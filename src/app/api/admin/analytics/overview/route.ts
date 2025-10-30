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
    const { count: totalEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'success');

    // Fetch total revenue
    const { data: revenueData } = await supabaseAdmin
      .from('enrollments')
      .select('amount_paid')
      .eq('payment_status', 'success');

    const totalRevenue = revenueData?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0;

    // Fetch upcoming sessions count
    const { count: upcomingSessions } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'upcoming');

    // Fetch pending payments count
    const { count: pendingPayments } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    // Log activity
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'view_analytics',
      entity_type: 'analytics',
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