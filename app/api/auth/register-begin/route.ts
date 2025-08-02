import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const runtime = 'edge';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';
import { generateRegistrationOptionsConfig } from '@/lib/webauthn';
import { validateCapToken } from '@/lib/cap-utils';

export async function POST(request: NextRequest) {
  try {
    const { username, capToken } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate Cap token to prevent bot registrations (only if CAPTCHA is enabled)
    const ENABLE_CAPTCHA = process.env.ENABLE_CAPTCHA !== 'false' && process.env.ENABLE_CAPTCHA !== 'disabled';
    
    if (ENABLE_CAPTCHA) {
      if (!capToken) {
        return NextResponse.json(
          { error: 'CAPTCHA verification required' },
          { status: 400 }
        );
      }

      console.log('Validating Cap token:', capToken);
      const isValidCap = await validateCapToken(capToken);
      console.log('Cap token validation result:', isValidCap);
      
      if (!isValidCap) {
        return NextResponse.json(
          { error: 'Invalid or expired CAPTCHA token' },
          { status: 400 }
        );
      }
    } else {
      console.log('CAPTCHA validation disabled, skipping CAPTCHA check');
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Generate a temporary user ID for the registration process
    const tempUserId = crypto.randomUUID();

    // Generate registration options
    const options = await generateRegistrationOptions(
      generateRegistrationOptionsConfig(username, tempUserId)
    );

    // Store the challenge in memory (in production, use Redis or database)
    // For now, we'll return it to the client to store temporarily
    return NextResponse.json({
      ...options,
      tempUserId
    });
  } catch (error) {
    console.error('Registration begin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}