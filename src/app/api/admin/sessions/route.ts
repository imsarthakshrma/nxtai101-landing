import { NextRequest, NextResponse } from 'next/server';
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

// POST create new session
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      session_date,
      duration_minutes,
      zoom_link,
      zoom_meeting_id,
      zoom_passcode,
      max_capacity,
      price,
      status,
      is_free,
    } = body;

    // Validate required fields
    if (!title || !session_date || !duration_minutes || !zoom_link || !max_capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price
    if (price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    // Validate capacity
    if (max_capacity < 1) {
      return NextResponse.json(
        { error: 'Capacity must be at least 1' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(zoom_link);
    } catch {
      return NextResponse.json(
        { error: 'Invalid Zoom link URL' },
        { status: 400 }
      );
    }

    // Create session
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        title,
        session_date,
        duration_minutes,
        zoom_link,
        zoom_meeting_id: zoom_meeting_id || null,
        zoom_passcode: zoom_passcode || null,
        max_capacity,
        current_enrollments: 0,
        price,
        status: status || 'upcoming',
        is_free: is_free || price === 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Log activity (non-blocking)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'create_session',
      entity_type: 'session',
      entity_id: session.id,
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log activity:', logError);
      }
    });

    return NextResponse.json({
      success: true,
      session,
      message: 'Session created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}