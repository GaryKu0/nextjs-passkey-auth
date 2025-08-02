import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const runtime = 'edge';
import { getServerSession } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, username, email, display_name')
      .eq('id', session.userId)
      .single();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null });
  }
}