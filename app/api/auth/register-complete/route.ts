import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';
import { createVerifyRegistrationConfig, origin, rpID } from '@/lib/webauthn';
import { createToken, setAuthCookie } from '@/lib/auth-utils';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { credential, expectedChallenge, username, tempUserId, email, displayName } = await request.json();

    if (!credential || !expectedChallenge || !username || !tempUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the registration response
    const userVerification = process.env.NEXT_PUBLIC_USER_VERIFICATION as 'discouraged' | 'preferred' | 'required' || 'preferred';
    const requireUserVerification = userVerification === 'required';
    
    // Determine the actual origin from the credential's clientDataJSON
    let actualOrigin = origin; // default fallback
    
    try {
      // Parse the clientDataJSON to get the actual origin
      const clientDataJSON = JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf-8'));
      const credentialOrigin = clientDataJSON.origin;
      
      console.log('Registration credential origin from clientDataJSON:', credentialOrigin);
      console.log('Default expected origin:', origin);
      
      // Validate that the origin is a subdomain of the RP ID
      if (credentialOrigin) {
        try {
          const originUrl = new URL(credentialOrigin);
          const originHost = originUrl.hostname;
          
          // Accept if origin is exactly the RP ID or a subdomain of RP ID
          if (originHost === rpID || originHost.endsWith(`.${rpID}`)) {
            actualOrigin = credentialOrigin;
            console.log('Using credential origin for registration verification:', actualOrigin);
          } else {
            console.error('Invalid registration origin - not a subdomain of RP ID:', originHost, 'vs', rpID);
            return NextResponse.json(
              { error: 'Invalid origin for this RP ID' },
              { status: 400 }
            );
          }
        } catch (urlError) {
          console.error('Invalid registration origin URL:', credentialOrigin);
          return NextResponse.json(
            { error: 'Invalid origin format' },
            { status: 400 }
          );
        }
      }
    } catch (parseError) {
      console.error('Failed to parse registration clientDataJSON:', parseError);
      // Continue with default origin as fallback
    }
    
    const verifyConfig = createVerifyRegistrationConfig(expectedChallenge, actualOrigin, rpID);
    const verification = await verifyRegistrationResponse(
      verifyConfig({
        response: credential,
        requireUserVerification,
      })
    );

    console.log('Full verification object:', JSON.stringify(verification, null, 2));

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Registration verification failed' },
        { status: 400 }
      );
    }

    const { registrationInfo } = verification;

    if (!registrationInfo) {
      console.error('registrationInfo is missing from verification object');
      return NextResponse.json(
        { error: 'Registration info missing' },
        { status: 400 }
      );
    }

    

    // Create user in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        email: email || null,
        display_name: displayName || null,
      })
      .select()
      .single();

    if (userError) {
      console.error('Supabase user creation error:', userError);
      console.error('Full error object:', JSON.stringify(userError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Store the credential
    const { error: credError } = await supabase
      .from('user_credentials')
      .insert({
        user_id: user.id,
        credential_id: credential.id,
        credential_public_key: Buffer.from(registrationInfo.credential.publicKey.buffer),
        counter: registrationInfo.credential.counter,
        credential_device_type: registrationInfo.credentialDeviceType,
        credential_backed_up: registrationInfo.credentialBackedUp,
        transports: credential.response.transports,
      });

    console.log('Credential ID being stored:', Buffer.from(registrationInfo.credential.id).toString('base64url'));

    if (credError) {
      console.error('Supabase credential storage error:', credError);
      console.error('Full credential error object:', JSON.stringify(credError, null, 2));
      // Clean up user if credential creation fails
      await supabase.from('users').delete().eq('id', user.id);
      return NextResponse.json(
        { error: 'Failed to store credential' },
        { status: 500 }
      );
    }

    // Create and set auth token
    const token = await createToken({ userId: user.id, username: user.username });
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration complete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}