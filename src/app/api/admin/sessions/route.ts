import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Check authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all sessions
    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Log activity (non-blocking, fire-and-forget)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'view_sessions',
      entity_type: 'session',
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log activity:', logError);
      }
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}