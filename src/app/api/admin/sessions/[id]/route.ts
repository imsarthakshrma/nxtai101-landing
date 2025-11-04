import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get enrollment count for this session
    const { count: enrollmentCount } = await supabaseAdmin
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', id)
      .eq('payment_status', 'success');

    // Log activity (non-blocking)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'view_session',
      entity_type: 'session',
      entity_id: id,
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log activity:', logError);
      }
    });

    return NextResponse.json({
      session: {
        ...session,
        enrollment_count: enrollmentCount || 0,
      },
    });
  } catch (error) {
    console.error('Error in session API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
    if (!title || !session_date || !duration_minutes || !max_capacity) {
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

    // Check if session has enrollments
    const { count: enrollmentCount } = await supabaseAdmin
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', params.id)
      .eq('payment_status', 'success');

    // If session has enrollments, restrict certain changes
    if (enrollmentCount && enrollmentCount > 0) {
      // Can't reduce capacity below current enrollments
      if (max_capacity < enrollmentCount) {
        return NextResponse.json(
          {
            error: `Cannot reduce capacity below current enrollments (${enrollmentCount})`,
          },
          { status: 400 }
        );
      }
    }

    // Update session
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .update({
        title,
        session_date,
        duration_minutes,
        zoom_link,
        zoom_meeting_id: zoom_meeting_id || null,
        zoom_passcode: zoom_passcode || null,
        max_capacity,
        price,
        status,
        is_free: is_free || price === 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    // Log activity (non-blocking)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'update_session',
      entity_type: 'session',
      entity_id: params.id,
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log activity:', logError);
      }
    });

    return NextResponse.json({
      success: true,
      session,
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if session has enrollments
    const { count: enrollmentCount } = await supabaseAdmin
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', id)
      .eq('payment_status', 'success');

    if (enrollmentCount && enrollmentCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete session with ${enrollmentCount} enrollments. Cancel it instead.`,
        },
        { status: 400 }
      );
    }

    // Delete session
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    // Log activity (non-blocking)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'delete_session',
      entity_type: 'session',
      entity_id: params.id,
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log activity:', logError);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
