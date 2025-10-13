export interface Session {
  id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  zoom_link: string;
  zoom_meeting_id: string | null;
  zoom_passcode: string | null;
  max_capacity: number;
  current_enrollments: number;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  session_id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  linkedin_url: string | null;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount_paid: number;
  currency: string;
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  email_sent: boolean;
  email_sent_at: string | null;
  confirmation_email_id: string | null;
  enrolled_at: string;
  payment_verified_at: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentWithSession extends Enrollment {
  session: Session;
}

export interface CreateEnrollmentData {
  session_id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  linkedin_url?: string;
  razorpay_order_id: string;
  amount_paid: number;
  currency: string;
}
