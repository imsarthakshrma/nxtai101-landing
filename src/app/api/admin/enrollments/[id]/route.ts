import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET single enrollment
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

    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        sessions (
          title,
          session_date,
          session_type
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching enrollment:', error);
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Transform data to include session details at top level
    const transformedEnrollment = {
      ...enrollment,
      session_title: enrollment.sessions?.title || 'Unknown Session',
      session_date: enrollment.sessions?.session_date || null,
      session_type: enrollment.sessions?.session_type || 'spark101',
    };

    // Log activity (non-blocking)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'view_enrollment',
      entity_type: 'enrollment',
      entity_id: id,
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log activity:', logError);
      }
    });

    return NextResponse.json({
      enrollment: transformedEnrollment,
    });
  } catch (error) {
    console.error('Error in enrollment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
