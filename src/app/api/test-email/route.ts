import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/email';

/**
 * Test Email API Route
 * 
 * Usage: Visit http://localhost:3000/api/test-email in your browser
 * 
 * This will send a test email to verify:
 * 1. Email is being sent successfully
 * 2. Email content is correct
 * 3. All dynamic data is populated properly
 */

export async function GET() {
  try {
    // Test data
    const testEnrollment = {
      id: 'test-enrollment-id-123',
      name: 'John Doe',
      email: 'imsarthakshrma@gmail.com', // ⚠️ Change this to your email
      phone: '+91 98765 43210',
      company: 'Test Company Inc',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test456',
      amount_paid: 19900, // 199 INR in paise
      currency: 'INR',
      payment_status: 'success' as const,
      enrolled_at: new Date().toISOString(),
      session_id: 'test-session-id',
      razorpay_signature: null,
      email_sent: false,
      email_sent_at: null,
      confirmation_email_id: null,
      payment_verified_at: new Date().toISOString(),
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const testSession = {
      id: 'test-session-id',
      title: 'Spark 101 - Test Session',
      session_date: '2025-10-20T19:00:00+05:30',
      duration_minutes: 60,
      zoom_link: 'https://zoom.us/j/123456789?pwd=testpassword',
      zoom_meeting_id: '123 456 789',
      zoom_passcode: 'spark101',
      max_capacity: 150,
      current_enrollments: 1,
      price: 199,
      status: 'upcoming' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('🧪 Testing Email Functionality...');
    console.log('📧 Sending test email to:', testEnrollment.email);
    console.log('📅 Session:', testSession.title);

    const result = await sendConfirmationEmail(testEnrollment, testSession);

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Email ID:', result.emailId);

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        emailId: result.emailId,
        sentTo: testEnrollment.email,
        checkList: [
          'Subject: "You\'re Enrolled in Spark 101 - Test Session 🎉"',
          'Greeting: "Hi John Doe,"',
          'Session details with date and time',
          'Zoom link button',
          'Payment confirmation (₹199)',
          'Calendar invite attachment',
        ],
        note: 'Check your spam folder if you don\'t see it!',
      });
    } else {
      console.error('❌ Email failed to send');
      console.error('Error:', result.error);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          details: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('❌ Test failed with error:');
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: errorMessage,
        troubleshooting: [
          'Check if RESEND_API_KEY is set in .env.local',
          'Verify your Resend account is active',
          'Make sure you\'ve verified your domain in Resend',
          'Check if the email address is valid',
        ],
      },
      { status: 500 }
    );
  }
}
