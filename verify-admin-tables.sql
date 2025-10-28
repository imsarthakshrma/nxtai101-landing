-- Verification Script for Admin Tables Migration
-- Run this in Supabase SQL Editor after migration

-- 1. Check if tables exist
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('admin_users', 'admin_activity_log') THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admin_users', 'admin_activity_log')
ORDER BY table_name;

-- 2. Check admin_users columns
SELECT 
  'admin_users Columns' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- 3. Check admin_activity_log columns
SELECT 
  'admin_activity_log Columns' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admin_activity_log'
ORDER BY ordinal_position;

-- 4. Check indexes
SELECT 
  'Indexes Check' as check_type,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('admin_users', 'admin_activity_log')
ORDER BY tablename, indexname;

-- 5. Check foreign key constraints
SELECT
  'Foreign Keys Check' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('admin_users', 'admin_activity_log');

-- 6. Check RLS policies
SELECT 
  'RLS Policies Check' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('admin_users', 'admin_activity_log')
ORDER BY tablename, policyname;

-- 7. Check triggers
SELECT 
  'Triggers Check' as check_type,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('admin_users', 'admin_activity_log')
ORDER BY event_object_table, trigger_name;

-- 8. Check admin users count
SELECT 
  'Admin Users Count' as check_type,
  COUNT(*) as total_admins,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators
FROM admin_users;

-- 9. List all admin users (without password hash)
SELECT 
  'Admin Users List' as check_type,
  id,
  email,
  name,
  role,
  last_login,
  created_at
FROM admin_users
ORDER BY created_at DESC;

-- 10. Check activity log count
SELECT 
  'Activity Log Count' as check_type,
  COUNT(*) as total_activities,
  COUNT(DISTINCT admin_id) as unique_admins,
  COUNT(CASE WHEN action = 'login' THEN 1 END) as logins,
  COUNT(CASE WHEN action = 'logout' THEN 1 END) as logouts
FROM admin_activity_log;

-- 11. Recent activity (last 10 entries)
SELECT 
  'Recent Activity' as check_type,
  al.action,
  au.email as admin_email,
  al.entity_type,
  al.ip_address,
  al.created_at
FROM admin_activity_log al
LEFT JOIN admin_users au ON al.admin_id = au.id
ORDER BY al.created_at DESC
LIMIT 10;
