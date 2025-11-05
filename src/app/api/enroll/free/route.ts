import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail } from '@/lib/email';
import type { Session, CreateEnrollmentData } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, user_info } = body;

    console.log('Free enrollment request:', { session_id, user_info });

    // Validate required fields
    if (!session_id || !user_info) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { name, email, phone, company, linkedin_url } = user_info;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Fetch session and validate it's free
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const typedSession = session as Session;

    // Validate session is free
    if (!typedSession.is_free && typedSession.price > 0) {
      return NextResponse.json(
        { error: 'This session requires payment' },
        { status: 400 }
      );
    }

    // Check if session is full
    if (typedSession.current_enrollments >= typedSession.max_capacity) {
      return NextResponse.json(
        { error: 'Session is full' },
        { status: 400 }
      );
    }

    // Check if user already enrolled
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, payment_status')
      .eq('session_id', session_id)
      .eq('email', email)
      .eq('payment_status', 'success')
      .maybeSingle();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this session' },
        { status: 400 }
      );
    }

    // Create enrollment record with success status for free sessions
    const enrollmentData: CreateEnrollmentData = {
      session_id,
      name,
      email,
      phone,
      company: company || null,
      linkedin_url: linkedin_url || null,
      razorpay_order_id: `free_${Date.now()}`,
      razorpay_payment_id: null,
      amount_paid: 0,
      currency: 'INR',
      payment_status: 'success', // Free sessions are immediately successful
    };

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      );
    }

    // Increment current_enrollments
    const { error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({
        current_enrollments: typedSession.current_enrollments + 1,
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Error updating session enrollment count:', updateError);
    }

    // Send confirmation email (non-blocking)
    sendConfirmationEmail(enrollment, typedSession)
      .then((result) => {
        if (result.success) {
          console.log('✅ Confirmation email sent:', result.emailId);
          // Update enrollment with email info
          supabaseAdmin
            .from('enrollments')
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
              confirmation_email_id: result.emailId,
            })
            .eq('id', enrollment.id)
            .then(({ error: emailUpdateError }) => {
              if (emailUpdateError) {
                console.error('Failed to update email status:', emailUpdateError);
              }
            });
        } else {
          console.error('❌ Failed to send confirmation email:', result.error);
        }
      })
      .catch((error) => {
        console.error('❌ Error sending confirmation email:', error);
      });

    return NextResponse.json({
      success: true,
      enrollment_id: enrollment.id,
      message: 'Enrollment successful! Check your email for confirmation.',
    });
  } catch (error: unknown) {
    console.error('Error in free enrollment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to process enrollment',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
