/**
 * Email Test Script
 * 
 * This script tests the email sending functionality to verify:
 * 1. Email is being sent successfully
 * 2. Email content is correct
 * 3. All dynamic data is populated properly
 * 
 * Usage:
 *   npx tsx test-email.ts
 * 
 * Make sure to install tsx first:
 *   npm install -D tsx
 */

import { sendConfirmationEmail } from './src/lib/email';

// Test data - Replace with your actual test data
const testEnrollment = {
  id: 'test-enrollment-id-123',
  name: 'John Doe',
  email: 'imsarthakshrma@gmail.com', // ⚠️ CHANGE THIS TO YOUR EMAIL
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

async function testEmail() {
  console.log('🧪 Testing Email Functionality...\n');
  console.log('📧 Sending test email to:', testEnrollment.email);
  console.log('📅 Session:', testSession.title);
  console.log('🕐 Date:', new Date(testSession.session_date).toLocaleString('en-IN'));
  console.log('💰 Amount:', `₹${testEnrollment.amount_paid / 100}`);
  console.log('\n⏳ Sending email...\n');

  try {
    const result = await sendConfirmationEmail(testEnrollment, testSession);

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Email ID:', result.emailId);
      console.log('\n📋 What to check in your inbox:');
      console.log('  1. Subject: "You\'re Enrolled in Spark 101 - Test Session 🎉"');
      console.log('  2. Greeting: "Hi John Doe,"');
      console.log('  3. Session details with date and time');
      console.log('  4. Zoom link button');
      console.log('  5. Payment confirmation (₹199)');
      console.log('  6. Calendar invite attachment');
      console.log('\n💡 Check your spam folder if you don\'t see it!');
    } else {
      console.error('❌ Email failed to send');
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error);
    console.log('\n🔍 Troubleshooting:');
    console.log('  1. Check if RESEND_API_KEY is set in .env.local');
    console.log('  2. Verify your Resend account is active');
    console.log('  3. Make sure you\'ve verified your domain in Resend');
    console.log('  4. Check if the email address is valid');
  }
}

// Run the test
testEmail();
