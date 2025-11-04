-- Migration: Add session_type column to sessions table
-- This allows us to categorize sessions (Spark 101, Framework 101, Summit 101)

-- Add session_type column with enum type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_type_enum') THEN
    CREATE TYPE session_type_enum AS ENUM ('spark101', 'framework101', 'summit101');
  END IF;
END $$;

-- Add column to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS session_type session_type_enum DEFAULT 'spark101';

-- Add description column for session details
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add level column (beginner, intermediate, advanced)
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';

-- Add tags column for categorization
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_type ON sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_level ON sessions(level);
CREATE INDEX IF NOT EXISTS idx_sessions_type_date ON sessions(session_type, session_date);

-- Update existing sessions to have proper session_type
-- (Assuming all existing sessions are Spark 101)
UPDATE sessions 
SET session_type = 'spark101', 
    level = 'beginner',
    description = 'Introduction to AI and Machine Learning fundamentals'
WHERE session_type IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN sessions.session_type IS 'Type of session: spark101 (intro), framework101 (intermediate), summit101 (advanced)';
COMMENT ON COLUMN sessions.level IS 'Difficulty level: beginner, intermediate, advanced';
COMMENT ON COLUMN sessions.description IS 'Detailed description of the session content';
COMMENT ON COLUMN sessions.tags IS 'Array of tags for categorization and filtering';

-- Create view for session statistics by type
CREATE OR REPLACE VIEW session_stats_by_type AS
SELECT 
  session_type,
  COUNT(*) as total_sessions,
  SUM(current_enrollments) as total_enrollments,
  SUM(max_capacity) as total_capacity,
  SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcoming_count,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
  SUM(CASE WHEN is_free = false THEN current_enrollments * price ELSE 0 END) as total_revenue
FROM sessions
GROUP BY session_type;

COMMENT ON VIEW session_stats_by_type IS 'Aggregated statistics for each session type';
