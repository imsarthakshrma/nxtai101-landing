import { NextResponse } from 'next/server';
import { clearAuthCookie, getCurrentAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const admin = await getCurrentAdmin();

    if (admin) {
      // Log activity
      await supabaseAdmin.from('admin_activity_log').insert({
        admin_id: admin.id,
        action: 'logout',
        entity_type: 'admin_user',
        entity_id: admin.id,
      });
    }

    // Clear cookie
    await clearAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}