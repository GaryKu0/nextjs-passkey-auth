import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { verifyToken } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Extract Bearer token from Authorization header
  const authHeader = request.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }
  const token = match[1];

  // Verify the token and extract payload
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Fetch user info from database
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, display_name')
    .eq('id', payload.userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Respond with normalized user info
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
    },
  });
}
