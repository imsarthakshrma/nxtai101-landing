import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, generateToken, setAuthCookie, AdminUser } from '@/lib/admin-auth';
import { checkRateLimit, resetRateLimit, getClientIP } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting by IP
    const clientIP = getClientIP(request.headers);
    const ipRateLimit = checkRateLimit(`ip:${clientIP}`, 10, 15 * 60 * 1000); // 10 attempts per 15 min
    
    if (!ipRateLimit.success) {
      const retryAfter = Math.ceil((ipRateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(ipRateLimit.resetAt).toISOString(),
          }
        }
      );
    }

    // Rate limiting by email
    const emailRateLimit = checkRateLimit(`email:${email.toLowerCase()}`, 5, 15 * 60 * 1000); // 5 attempts per 15 min
    
    if (!emailRateLimit.success) {
      const retryAfter = Math.ceil((emailRateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many failed login attempts for this account. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          }
        }
      );
    }

    // Find admin user
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // Verify password (constant-time to prevent timing attacks)
    const isValid = admin && !error 
      ? await verifyPassword(password, admin.password_hash)
      : await verifyPassword(password, '$2a$10$dummy.hash.to.prevent.timing.attacks.xxxxxxxxxxxxxxxxxx');
    
    // Check if account is locked
    if (admin && admin.locked_until) {
      const lockedUntil = new Date(admin.locked_until);
      if (lockedUntil > new Date()) {
        const retryAfter = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
        return NextResponse.json(
          { error: 'Account temporarily locked due to multiple failed login attempts.' },
          { 
            status: 423, // Locked
            headers: {
              'Retry-After': retryAfter.toString(),
            }
          }
        );
      } else {
        // Unlock account if lock period has expired
        await supabaseAdmin
          .from('admin_users')
          .update({ locked_until: null, failed_login_attempts: 0 })
          .eq('id', admin.id);
      }
    }
    
    if (!isValid || !admin) {
      // Increment failed login attempts
      if (admin) {
        const failedAttempts = (admin.failed_login_attempts || 0) + 1;
        const updates: Record<string, unknown> = { failed_login_attempts: failedAttempts };
        
        // Lock account after 5 failed attempts
        if (failedAttempts >= 5) {
          const lockDuration = 30 * 60 * 1000; // 30 minutes
          updates.locked_until = new Date(Date.now() + lockDuration).toISOString();
        }
        
        await supabaseAdmin
          .from('admin_users')
          .update(updates)
          .eq('id', admin.id);

        // Log failed attempt
        await supabaseAdmin.from('admin_activity_log').insert({
          admin_id: admin.id,
          action: 'failed_login',
          entity_type: 'admin_user',
          entity_id: admin.id,
          ip_address: clientIP,
          details: { failed_attempts: failedAttempts },
        });
      }
      
      // Generic error message to avoid leaking information
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset failed login attempts and update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ 
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', admin.id);

    // Reset rate limits on successful login
    resetRateLimit(`email:${email.toLowerCase()}`);

    // Log successful login
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: admin.id,
      action: 'login_success',
      entity_type: 'admin_user',
      entity_id: admin.id,
      ip_address: clientIP,
    });

    // Generate token with must_change_password flag
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      must_change_password: admin.must_change_password,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        must_change_password: admin.must_change_password,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}