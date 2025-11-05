-- ============================================
-- SESSION IMPROVEMENTS MIGRATION
-- ============================================
-- Adds support for free sessions and auto-status updates

-- 1. Add is_free column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

-- 2. Update existing free sessions
UPDATE sessions
SET is_free = TRUE
WHERE price = 0;

-- 3. Create function to compute session status based on date
CREATE OR REPLACE FUNCTION get_session_status(
  p_session_date TIMESTAMPTZ,
  p_duration_minutes INTEGER,
  p_current_status TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_session_end TIMESTAMPTZ;
BEGIN
  -- If cancelled, always return cancelled
  IF p_current_status = 'cancelled' THEN
    RETURN 'cancelled';
  END IF;
  
  -- Calculate session end time
  v_session_end := p_session_date + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Determine status based on current time
  IF v_now < p_session_date THEN
    RETURN 'upcoming';
  ELSIF v_now >= p_session_date AND v_now < v_session_end THEN
    RETURN 'ongoing';
  ELSE
    RETURN 'completed';
  END IF;
END;
$$;

-- 4. Create view with computed status
CREATE OR REPLACE VIEW sessions_with_computed_status AS
SELECT 
  s.*,
  get_session_status(s.session_date, s.duration_minutes, s.status) AS computed_status
FROM sessions s;

-- 5. Create index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_sessions_date_status 
ON sessions(session_date, status);

-- 6. Optional: Create trigger to auto-update status (commented out by default)
-- Uncomment if you want automatic status updates in database

/*
CREATE OR REPLACE FUNCTION auto_update_session_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if status is not manually set to cancelled
  IF NEW.status != 'cancelled' THEN
    NEW.status := get_session_status(NEW.session_date, NEW.duration_minutes, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_update_session_status
  BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_session_status();
*/

-- Success message
SELECT 'Session improvements applied successfully!' AS message;
SELECT 'Added is_free column, computed status function, and performance indexes' AS details;
