import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail } from '@/lib/email';
import type { RazorpayWebhookEvent } from '@/types/razorpay';
import type { Enrollment, Session } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the event
    const event: RazorpayWebhookEvent = JSON.parse(body);

    console.log('Webhook event received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'order.paid':
        await handleOrderPaid(event);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Event handlers
async function handlePaymentAuthorized(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment.entity;
  console.log('Payment authorized:', payment.id);

  // Update enrollment status
  await supabaseAdmin
    .from('enrollments')
    .update({
      razorpay_payment_id: payment.id,
      payment_status: 'success',
    })
    .eq('razorpay_order_id', payment.order_id);
}

async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment.entity;
  console.log('Payment captured:', payment.id);

  // Find enrollment
  const { data: enrollment, error } = await supabaseAdmin
    .from('enrollments')
    .select('*, session:sessions(*)')
    .eq('razorpay_order_id', payment.order_id)
    .single();

  if (error || !enrollment) {
    console.error('Enrollment not found for order:', payment.order_id);
    return;
  }

  const typedEnrollment = enrollment as Enrollment & { session: Session };

  // Check if already processed
  if (typedEnrollment.payment_status === 'success' && typedEnrollment.email_sent) {
    console.log('Payment already processed:', payment.id);
    return;
  }

  // Update enrollment
  await supabaseAdmin
    .from('enrollments')
    .update({
      razorpay_payment_id: payment.id,
      payment_status: 'success',
      payment_verified_at: new Date().toISOString(),
    })
    .eq('id', typedEnrollment.id);

  // Increment session enrollment count
  await supabaseAdmin.rpc('increment_session_enrollments', {
    session_id: typedEnrollment.session_id,
  });

  // Send confirmation email if not already sent
  if (!typedEnrollment.email_sent) {
    const emailResult = await sendConfirmationEmail(
      { ...typedEnrollment, razorpay_payment_id: payment.id, payment_status: 'success' },
      typedEnrollment.session
    );

    if (emailResult.success) {
      await supabaseAdmin
        .from('enrollments')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          confirmation_email_id: emailResult.emailId,
        })
        .eq('id', typedEnrollment.id);
    }
  }
}

async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  const payment = event.payload.payment.entity;
  console.log('Payment failed:', payment.id, payment.error_description);

  // Update enrollment status
  await supabaseAdmin
    .from('enrollments')
    .update({
      razorpay_payment_id: payment.id,
      payment_status: 'failed',
    })
    .eq('razorpay_order_id', payment.order_id);
}

async function handleOrderPaid(event: RazorpayWebhookEvent) {
  const order = event.payload.order?.entity;
  console.log('Order paid:', order?.id);

  // This is similar to payment.captured, handle accordingly
  await handlePaymentCaptured(event);
}
