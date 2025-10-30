-- Seed: Create initial admin user
-- Run this in Supabase SQL Editor AFTER running migration-add-admin-tables.sql

-- IMPORTANT: Replace the password_hash below with the output from hash-password.js
-- Run: node hash-password.js
-- Then copy the hash and paste it below

-- Insert initial super admin user
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@nxtai101.com',
  '$2a$10$REPLACE_THIS_WITH_ACTUAL_HASH_FROM_HASH_PASSWORD_JS',
  'Admin User',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verify the admin user was created
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM admin_users;
