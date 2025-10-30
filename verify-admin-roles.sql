-- ============================================
-- VERIFY ADMIN ROLES ALIGNMENT
-- ============================================
-- Run this in Supabase SQL Editor to verify the admin roles are correctly set up

-- 1. Check admin_users table structure
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- 2. Check the role constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'admin_users'::regclass
  AND contype = 'c'  -- Check constraint
  AND conname LIKE '%role%';

-- 3. List all admin users and their roles
SELECT 
  id,
  email,
  name,
  role,
  last_login,
  created_at
FROM admin_users
ORDER BY created_at DESC;

-- 4. Count users by role
SELECT 
  role,
  COUNT(*) as user_count
FROM admin_users
GROUP BY role
ORDER BY user_count DESC;

-- Expected output for constraint:
-- CHECK (role IN ('admin', 'super_admin', 'moderator'))

-- Valid roles are:
-- - super_admin (highest privileges)
-- - admin (manage sessions & enrollments)
-- - moderator (read-only access)
