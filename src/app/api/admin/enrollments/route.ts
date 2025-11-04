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

    // Fetch all enrollments with session details
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        sessions (
          title,
          session_date,
          session_type
        )
      `)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    // Transform data to include session details at top level
    const transformedEnrollments = enrollments?.map((enrollment) => ({
      ...enrollment,
      session_title: enrollment.sessions?.title || 'Unknown Session',
      session_date: enrollment.sessions?.session_date || null,
      session_type: enrollment.sessions?.session_type || 'spark101',
    }));

    // Log activity (non-blocking, fire-and-forget)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'view_enrollments',
      entity_type: 'enrollment',
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log enrollments activity:', logError);
      }
    });

    return NextResponse.json({ enrollments: transformedEnrollments });
  } catch (error) {
    console.error('Error in enrollments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}