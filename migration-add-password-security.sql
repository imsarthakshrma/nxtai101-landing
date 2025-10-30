-- ============================================
-- ADMIN SECURITY ENHANCEMENTS
-- ============================================
-- Add password security features to admin_users table

-- 1. Add must_change_password flag
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE;

-- 2. Add failed login tracking
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- 3. Create index for locked accounts
CREATE INDEX IF NOT EXISTS idx_admin_users_locked ON admin_users(locked_until)
WHERE locked_until IS NOT NULL;

-- 4. Update existing admin users to require password change
UPDATE admin_users
SET must_change_password = TRUE
WHERE must_change_password IS NULL;

-- Success message
SELECT 'Admin security enhancements applied successfully!' AS message;
