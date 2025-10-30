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

    // Fetch total enrollments
    const { count: totalEnrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'success');

    if (enrollmentsError) {
      console.error('Error fetching enrollments count:', enrollmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch enrollments data' },
        { status: 500 }
      );
    }

    // Fetch total revenue
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('enrollments')
      .select('amount_paid')
      .eq('payment_status', 'success');

    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError);
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500 }
      );
    }

    const totalRevenuePaise = (revenueData ?? []).reduce((sum, e) => {
      const rawAmount = typeof e.amount_paid === 'number' ? e.amount_paid : Number(e.amount_paid ?? 0);
      return Number.isFinite(rawAmount) ? sum + rawAmount : sum;
    }, 0);
    const totalRevenue = totalRevenuePaise / 100;

    // Fetch upcoming sessions count
    const { count: upcomingSessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'upcoming');

    if (sessionsError) {
      console.error('Error fetching sessions count:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions data' },
        { status: 500 }
      );
    }

    // Fetch pending payments count
    const { count: pendingPayments, error: pendingError } = await supabaseAdmin
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    if (pendingError) {
      console.error('Error fetching pending payments count:', pendingError);
      return NextResponse.json(
        { error: 'Failed to fetch pending payments data' },
        { status: 500 }
      );
    }

    // Log activity (non-blocking, fire-and-forget)
    supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'view_analytics',
      entity_type: 'analytics',
    }).then(({ error: logError }) => {
      if (logError) {
        console.error('Failed to log analytics activity:', logError);
      }
    });

    return NextResponse.json({
      totalEnrollments: totalEnrollments || 0,
      totalRevenue: totalRevenue / 100, // Convert paise to rupees
      upcomingSessions: upcomingSessions || 0,
      pendingPayments: pendingPayments || 0,
    });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}