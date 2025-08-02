import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Optional: Add secret protection
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const providedSecret = request.nextUrl.searchParams.get('secret');
      if (providedSecret !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Simple queries to keep database active
    const [usersResult, credentialsResult] = await Promise.all([
      supabase.from('users').select('count()', { count: 'exact' }).limit(1),
      supabase.from('user_credentials').select('count()', { count: 'exact' }).limit(1)
    ]);

    const stats = {
      users: usersResult.count || 0,
      credentials: credentialsResult.count || 0,
      timestamp: new Date().toISOString(),
      status: 'alive'
    };

    console.log('Database keepalive ping:', stats);

    return NextResponse.json({
      success: true,
      message: 'Database keepalive successful',
      stats
    });

  } catch (error) {
    console.error('Keepalive error:', error);
    return NextResponse.json(
      { 
        error: 'Keepalive failed',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
