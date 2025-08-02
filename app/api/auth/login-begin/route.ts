import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { supabase } from '@/lib/supabase';
import { generateAuthenticationOptionsConfig } from '@/lib/webauthn';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    let allowCredentials: any[] = [];

    if (username) {
      // Get user's credentials if username provided
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (user) {
        const { data: credentials } = await supabase
          .from('user_credentials')
          .select('credential_id, transports')
          .eq('user_id', user.id);

        allowCredentials = credentials ? credentials.map(cred => ({
          id: cred.credential_id,
          transports: cred.transports,
        })) : [];
      }
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions(
      generateAuthenticationOptionsConfig(allowCredentials)
    );

    return NextResponse.json({ options });
  } catch (error) {
    console.error('Login begin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}