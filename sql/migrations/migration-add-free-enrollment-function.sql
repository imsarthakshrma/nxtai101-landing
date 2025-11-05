-- Migration: Add atomic free enrollment function
-- Date: 2025-11-05
-- Purpose: Create database function for atomic free enrollment creation and count increment

-- Drop function if exists (for re-running)
DROP FUNCTION IF EXISTS create_free_enrollment(
  p_session_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_company TEXT,
  p_linkedin_url TEXT,
  p_razorpay_order_id TEXT
);

-- Create function for atomic free enrollment
CREATE OR REPLACE FUNCTION create_free_enrollment(
  p_session_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_company TEXT DEFAULT NULL,
  p_linkedin_url TEXT DEFAULT NULL,
  p_razorpay_order_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  enrollment_id UUID,
  enrollment_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_enrollment_id UUID;
  v_enrollment_data JSONB;
BEGIN
  -- Lock the session row for update to prevent race conditions
  SELECT * INTO v_session
  FROM sessions
  WHERE id = p_session_id
  FOR UPDATE;

  -- Check if session exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Validate session is free
  IF NOT v_session.is_free THEN
    RAISE EXCEPTION 'This session requires payment';
  END IF;

  -- Check if session is full
  IF v_session.current_enrollments >= v_session.max_capacity THEN
    RAISE EXCEPTION 'Session is full';
  END IF;

  -- Check for existing successful enrollment
  IF EXISTS (
    SELECT 1 FROM enrollments
    WHERE session_id = p_session_id
      AND email = p_email
      AND payment_status = 'success'
  ) THEN
    RAISE EXCEPTION 'Already enrolled in this session';
  END IF;

  -- Insert enrollment
  INSERT INTO enrollments (
    session_id,
    name,
    email,
    phone,
    company,
    linkedin_url,
    razorpay_order_id,
    razorpay_payment_id,
    amount_paid,
    currency,
    payment_status,
    enrolled_at
  ) VALUES (
    p_session_id,
    p_name,
    p_email,
    p_phone,
    p_company,
    p_linkedin_url,
    COALESCE(p_razorpay_order_id, 'free_' || gen_random_uuid()::text),
    NULL,
    0,
    'INR',
    'success',
    NOW()
  )
  RETURNING id INTO v_enrollment_id;

  -- Increment session enrollment count
  UPDATE sessions
  SET current_enrollments = current_enrollments + 1,
      updated_at = NOW()
  WHERE id = p_session_id;

  -- Fetch the created enrollment data with all fields
  SELECT jsonb_build_object(
    'id', e.id,
    'session_id', e.session_id,
    'name', e.name,
    'email', e.email,
    'phone', e.phone,
    'company', e.company,
    'linkedin_url', e.linkedin_url,
    'razorpay_order_id', e.razorpay_order_id,
    'razorpay_payment_id', e.razorpay_payment_id,
    'razorpay_signature', e.razorpay_signature,
    'amount_paid', e.amount_paid,
    'currency', e.currency,
    'payment_status', e.payment_status,
    'email_sent', e.email_sent,
    'email_sent_at', e.email_sent_at,
    'confirmation_email_id', e.confirmation_email_id,
    'enrolled_at', e.enrolled_at,
    'payment_verified_at', e.payment_verified_at,
    'utm_source', e.utm_source,
    'utm_medium', e.utm_medium,
    'utm_campaign', e.utm_campaign,
    'created_at', e.created_at,
    'updated_at', e.updated_at
  ) INTO v_enrollment_data
  FROM enrollments e
  WHERE e.id = v_enrollment_id;

  -- Return the enrollment ID and data
  RETURN QUERY SELECT v_enrollment_id, v_enrollment_data;
END;
$$;

-- Grant execute permission to authenticated users (adjust as needed)
GRANT EXECUTE ON FUNCTION create_free_enrollment TO service_role;

-- Add comment
COMMENT ON FUNCTION create_free_enrollment IS 'Atomically creates a free enrollment and increments session count. Prevents race conditions and ensures data consistency.';
