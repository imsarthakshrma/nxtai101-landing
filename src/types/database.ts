export type SessionType = 'spark101' | 'framework101' | 'summit101';
export type SessionLevel = 'beginner' | 'intermediate' | 'advanced';

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
  session_type: SessionType;
  level: SessionLevel;
  description: string | null;
  tags: string[] | null;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export const SESSION_TYPE_CONFIG = {
  spark101: {
    name: 'Spark 101',
    description: 'Introduction to AI & ML',
    color: 'purple',
    icon: '⚡',
    level: 'beginner' as SessionLevel,
  },
  framework101: {
    name: 'Framework 101',
    description: 'Deep dive into AI Frameworks',
    color: 'blue',
    icon: '🔧',
    level: 'intermediate' as SessionLevel,
  },
  summit101: {
    name: 'Summit 101',
    description: 'Advanced AI Applications',
    color: 'emerald',
    icon: '🏔️',
    level: 'advanced' as SessionLevel,
  },
} as const;

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
