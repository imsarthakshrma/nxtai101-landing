-- Migration: Add price column and fix unique index for retry support
-- Run this in Supabase SQL Editor

-- Step 1: Add price column to sessions table (if not exists)
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 199;

-- Step 2: Update existing sessions to have the price
UPDATE sessions 
SET price = 199 
WHERE price IS NULL OR price = 0;

-- Step 3: Drop old unique index (if exists)
DROP INDEX IF EXISTS idx_unique_session_email;

-- Step 4: Create new partial unique index (only for successful payments)
-- This allows users to retry after failed/cancelled payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_session_email_success 
  ON enrollments(session_id, email) 
  WHERE payment_status = 'success';

-- Step 5: Verify the changes
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'sessions' AND column_name = 'price';

-- Step 6: Check existing sessions
SELECT id, title, price, session_date, status 
FROM sessions
ORDER BY session_date DESC;
