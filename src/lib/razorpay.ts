import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance (server-side only)
// Use placeholder values if env vars not set (for build time)
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Razorpay signature
 * @returns boolean - true if signature is valid
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return false;
    }
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 * @param body - Webhook request body (raw string)
 * @param signature - X-Razorpay-Signature header
 * @returns boolean - true if webhook is authentic
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return false;
    }
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Format amount to paise (Razorpay uses smallest currency unit)
 * @param amount - Amount in rupees
 * @returns amount in paise
 */
export function formatAmountToPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format amount from paise to rupees
 * @param paise - Amount in paise
 * @returns amount in rupees
 */
export function formatAmountToRupees(paise: number): number {
  return paise / 100;
}
