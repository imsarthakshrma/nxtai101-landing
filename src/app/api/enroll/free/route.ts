import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail } from '@/lib/email';
import type { Session } from '@/types/database';
import { randomUUID } from 'crypto';

// Type for the RPC function result
interface FreeEnrollmentResult {
  enrollment_id: string;
  enrollment_data: {
    id: string;
    session_id: string;
    name: string;
    email: string;
    phone: string;
    company: string | null;
    linkedin_url: string | null;
    razorpay_order_id: string;
    amount_paid: number;
    currency: string;
    payment_status: 'success';
    enrolled_at: string;
  };
}

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

    // Validate session is free (use is_free as authoritative)
    if (!typedSession.is_free) {
      return NextResponse.json(
        { error: 'This session requires payment' },
        { status: 400 }
      );
    }

    // Generate unique order ID using UUID
    const uniqueOrderId = `free_${randomUUID()}`;

    // Use atomic database function to create enrollment and increment count
    // This prevents race conditions and ensures data consistency
    const { data, error: enrollmentError } = await supabaseAdmin
      .rpc('create_free_enrollment', {
        p_session_id: session_id,
        p_name: name,
        p_email: email,
        p_phone: phone,
        p_company: company || null,
        p_linkedin_url: linkedin_url || null,
        p_razorpay_order_id: uniqueOrderId,
      })
      .single();
    
    const result = data as FreeEnrollmentResult | null;

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      
      // Handle specific error cases
      if (enrollmentError.message?.includes('Session is full')) {
        return NextResponse.json(
          { error: 'Session is full' },
          { status: 400 }
        );
      }
      
      if (enrollmentError.message?.includes('Already enrolled')) {
        return NextResponse.json(
          { error: 'You are already enrolled in this session' },
          { status: 400 }
        );
      }
      
      if (enrollmentError.message?.includes('requires payment')) {
        return NextResponse.json(
          { error: 'This session requires payment' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      );
    }

    // Extract enrollment data from function result
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create enrollment - no data returned' },
        { status: 500 }
      );
    }

    const enrollment = result.enrollment_data;

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
