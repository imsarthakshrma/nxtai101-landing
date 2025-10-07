import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail } from '@/lib/email';
import type { RazorpayPaymentVerification } from '@/types/razorpay';
import type { Enrollment, Session } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as RazorpayPaymentVerification;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Find enrollment
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*, session:sessions(*)')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const typedEnrollment = enrollment as Enrollment & { session: Session };

    // Check if already verified
    if (typedEnrollment.payment_status === 'success') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        enrollment_id: typedEnrollment.id,
      });
    }

    // Update enrollment
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'success',
        payment_verified_at: new Date().toISOString(),
      })
      .eq('id', typedEnrollment.id);

    if (updateError) {
      console.error('Error updating enrollment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update enrollment' },
        { status: 500 }
      );
    }

    // Increment session enrollment count
    const { error: sessionError } = await supabaseAdmin.rpc(
      'increment_session_enrollments',
      { session_id: typedEnrollment.session_id }
    );

    if (sessionError) {
      console.error('Error incrementing session count:', sessionError);
      // Don't fail the request, just log the error
    }

    // Send confirmation email
    const emailResult = await sendConfirmationEmail(
      { ...typedEnrollment, razorpay_payment_id, payment_status: 'success' },
      typedEnrollment.session
    );

    if (emailResult.success) {
      // Update email sent status
      await supabaseAdmin
        .from('enrollments')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          confirmation_email_id: emailResult.emailId,
        })
        .eq('id', typedEnrollment.id);
    } else {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the request, email can be resent later
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      enrollment_id: typedEnrollment.id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      {
        error: 'Payment verification failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
