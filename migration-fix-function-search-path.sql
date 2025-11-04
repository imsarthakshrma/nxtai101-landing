-- ============================================
-- FIX FUNCTION SEARCH_PATH SECURITY ISSUES
-- ============================================
-- This migration fixes the mutable search_path warnings in Supabase
-- by setting an explicit, immutable search_path for all functions

-- 1. Fix increment_session_enrollments function
CREATE OR REPLACE FUNCTION increment_session_enrollments(session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sessions
  SET current_enrollments = current_enrollments + 1,
      updated_at = NOW()
  WHERE id = session_id;
END;
$$;

-- 2. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Success message
SELECT 'Function search_path security issues fixed!' AS message;
