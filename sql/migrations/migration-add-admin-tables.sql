-- Migration: Add admin_users and admin_activity_log tables
-- Run this in Supabase SQL Editor

-- Step 1: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- Profile
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  
  -- Activity Tracking
  last_login TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  
  -- Activity Details
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  
  -- Request Context
  ip_address TEXT,
  user_agent TEXT,
  
  -- Additional Data
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);

-- Step 4: Create trigger for updated_at on admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
CREATE POLICY "Service role can manage admin users"
  ON admin_users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage admin activity log"
  ON admin_activity_log FOR ALL
  USING (auth.role() = 'service_role');

-- Step 7: Grant necessary permissions
GRANT ALL ON admin_users TO anon, authenticated;
GRANT ALL ON admin_activity_log TO anon, authenticated;

-- Step 8: Verify the tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('admin_users', 'admin_activity_log')
ORDER BY table_name, ordinal_position;

-- Step 9: Check indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('admin_users', 'admin_activity_log')
ORDER BY tablename, indexname;
