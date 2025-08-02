import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';
import { createVerifyAuthenticationConfig, origin, rpID } from '@/lib/webauthn';
import { createToken } from '@/lib/auth-utils';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('Login Complete Route Hit!');
  try {
    const requestBody = await request.json();
    console.log('Login Complete Request Body:', requestBody);
    const { credential, expectedChallenge } = requestBody;

    if (!credential || !expectedChallenge) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the credential in database
    const credentialId = credential.rawId;
    console.log('Attempting to find credential with ID:', credentialId);
    
    const { data: storedCredential, error: credError } = await supabase
      .from('user_credentials')
      .select(`
        *,
        users (
          id,
          username,
          email,
          display_name
        )
      `)
      .eq('credential_id', credentialId)
      .single();

    console.log('Supabase query result - storedCredential:', storedCredential);
    console.log('Supabase query result - credError:', credError);

    if (credError || !storedCredential) {
      console.error('Credential not found error:', credError);
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      );
    }

    // Verify the authentication response
    const userVerification = process.env.NEXT_PUBLIC_USER_VERIFICATION as 'discouraged' | 'preferred' | 'required' || 'preferred';
    const requireUserVerification = userVerification === 'required';
    
    // Determine the actual origin from the credential's clientDataJSON
    let actualOrigin = origin; // default fallback
    
    try {
      // Parse the clientDataJSON to get the actual origin
      const clientDataJSON = JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf-8'));
      const credentialOrigin = clientDataJSON.origin;
      
      console.log('Credential origin from clientDataJSON:', credentialOrigin);
      console.log('Default expected origin:', origin);
      
      // Validate that the origin is a subdomain of the RP ID
      if (credentialOrigin) {
        try {
          const originUrl = new URL(credentialOrigin);
          const originHost = originUrl.hostname;
          
          // Accept if origin is exactly the RP ID or a subdomain of RP ID
          if (originHost === rpID || originHost.endsWith(`.${rpID}`)) {
            actualOrigin = credentialOrigin;
            console.log('Using credential origin for verification:', actualOrigin);
          } else {
            console.error('Invalid origin - not a subdomain of RP ID:', originHost, 'vs', rpID);
            return NextResponse.json(
              { error: 'Invalid origin for this RP ID' },
              { status: 400 }
            );
          }
        } catch (urlError) {
          console.error('Invalid origin URL:', credentialOrigin);
          return NextResponse.json(
            { error: 'Invalid origin format' },
            { status: 400 }
          );
        }
      }
    } catch (parseError) {
      console.error('Failed to parse clientDataJSON:', parseError);
      // Continue with default origin as fallback
    }
    
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: actualOrigin,
      expectedRPID: rpID,
      requireUserVerification,
      credential: {
        id: storedCredential.credential_id,
        publicKey: new Uint8Array(JSON.parse(Buffer.from(storedCredential.credential_public_key.substring(2), 'hex').toString('utf8')).data),
        counter: storedCredential.counter,
        transports: storedCredential.transports,
      },
    });

    console.log('Full authentication verification object:', JSON.stringify(verification, null, 2));

    // Update counter
    await supabase
      .from('user_credentials')
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq('id', storedCredential.id);

    // Create and set auth token
    const user = storedCredential.users;
    const token = await createToken({ userId: user.id, username: user.username });
    
    const response = NextResponse.json({
      success: true,
      token: token, // Include token in response for client-side storage
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
    console.error('Login complete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}