-- Rollback Script: Remove admin_users and admin_activity_log tables
-- ⚠️ WARNING: This will delete ALL admin users and activity logs!
-- Run this ONLY if you need to undo the admin tables migration

-- Step 1: Verify what will be deleted
SELECT 
  'Admin Users to be deleted' as warning,
  COUNT(*) as count
FROM admin_users;

SELECT 
  'Activity Logs to be deleted' as warning,
  COUNT(*) as count
FROM admin_activity_log;

-- Step 2: Drop RLS policies
DROP POLICY IF EXISTS "Service role can manage admin activity log" ON admin_activity_log;
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;

-- Step 3: Drop triggers
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;

-- Step 4: Drop indexes
DROP INDEX IF EXISTS idx_admin_activity_log_action;
DROP INDEX IF EXISTS idx_admin_activity_log_created_at;
DROP INDEX IF EXISTS idx_admin_activity_log_admin_id;
DROP INDEX IF EXISTS idx_admin_users_email;

-- Step 5: Drop tables (CASCADE will also drop the foreign key constraint)
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Step 6: Verify tables are gone
SELECT 
  table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('admin_users', 'admin_activity_log');

-- If the above query returns no rows, the rollback was successful
-- If it returns rows, the tables still exist

-- Step 7: Verify indexes are gone
SELECT 
  indexname
FROM pg_indexes
WHERE tablename IN ('admin_users', 'admin_activity_log');

-- If the above query returns no rows, all indexes were removed successfully

-- ROLLBACK COMPLETE
-- To re-apply the migration, run: migration-add-admin-tables.sql
