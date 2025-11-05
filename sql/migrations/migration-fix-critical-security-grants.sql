-- CRITICAL SECURITY FIX: Remove overly permissive grants
-- Date: 2025-11-05
-- Issue: ALL permissions granted to anon/authenticated users on ALL tables
-- Impact: Exposes admin data, enrollment data, and allows unauthorized modifications

-- ============================================================================
-- STEP 1: REVOKE DANGEROUS PERMISSIONS
-- ============================================================================

-- Revoke ALL permissions from anon and authenticated users
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- ============================================================================
-- STEP 2: GRANT MINIMAL REQUIRED PERMISSIONS
-- ============================================================================

-- Grant schema usage (required for any access)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ============================================================================
-- Sessions Table: Public read-only for upcoming sessions
-- ============================================================================

-- Allow public to view sessions (RLS policy restricts to upcoming only)
GRANT SELECT ON sessions TO anon, authenticated;

-- ============================================================================
-- Enrollments Table: Public can only insert (create enrollments)
-- ============================================================================

-- Allow public to create enrollments only
GRANT INSERT ON enrollments TO anon, authenticated;

-- Note: enrollments table uses UUID (uuid_generate_v4()), not a sequence
-- No sequence grant needed

-- ============================================================================
-- Admin Tables: NO PUBLIC ACCESS
-- ============================================================================

-- Admin users table: service_role only (no public access)
-- RLS policy already restricts to service_role

-- Admin activity log: service_role only (no public access)
-- RLS policy already restricts to service_role

-- ============================================================================
-- Functions: Grant execute only on safe public functions
-- ============================================================================

-- No public functions currently needed
-- If you add public functions later, grant explicitly:
-- GRANT EXECUTE ON FUNCTION function_name TO anon, authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check current permissions (run after migration)
-- SELECT 
--   grantee,
--   table_schema,
--   table_name,
--   privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
--   AND grantee IN ('anon', 'authenticated')
-- ORDER BY table_name, grantee, privilege_type;

-- Expected results:
-- anon/authenticated should have:
--   - SELECT on sessions
--   - INSERT on enrollments
--   - USAGE, SELECT on enrollments_id_seq
-- anon/authenticated should NOT have:
--   - ANY access to admin_users
--   - ANY access to admin_activity_log
--   - UPDATE/DELETE on sessions
--   - SELECT/UPDATE/DELETE on enrollments

COMMENT ON TABLE sessions IS 'Public can SELECT (view) upcoming sessions only via RLS policy';
COMMENT ON TABLE enrollments IS 'Public can INSERT (create) enrollments only. Service role can manage all.';
COMMENT ON TABLE admin_users IS 'Service role only. No public access.';
COMMENT ON TABLE admin_activity_log IS 'Service role only. No public access.';
