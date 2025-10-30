import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, hashPassword, verifyPassword, generateToken, setAuthCookie, AdminUser } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new passwords are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Get admin user from database
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', admin.id)
      .single();

    if (fetchError || !adminUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, adminUser.password_hash);
    if (!isValid) {
      // Log failed attempt
      await supabaseAdmin.from('admin_activity_log').insert({
        admin_id: admin.id,
        action: 'failed_password_change',
        entity_type: 'admin_user',
        entity_id: admin.id,
        ip_address: getClientIP(request.headers),
      });

      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(newPassword, adminUser.password_hash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and clear must_change_password flag
    const { error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update({
        password_hash: newPasswordHash,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Log successful password change
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'password_changed',
      entity_type: 'admin_user',
      entity_id: admin.id,
      ip_address: getClientIP(request.headers),
    });

    // Generate new token without must_change_password flag
    const token = generateToken({
      ...admin,
      must_change_password: false,
    });

    // Set new cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
