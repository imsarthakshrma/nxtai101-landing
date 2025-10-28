-- NXTAI101 Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
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

-- Create admin_activity_log table
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

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session Info
  title TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Zoom Details
  zoom_link TEXT NOT NULL,
  zoom_meeting_id TEXT,
  zoom_passcode TEXT,
  
  -- Capacity Management
  max_capacity INTEGER DEFAULT 150,
  current_enrollments INTEGER DEFAULT 0,
  
  -- Pricing (in INR)
  price INTEGER NOT NULL DEFAULT 199,
  
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- User Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  linkedin_url TEXT,
  
  -- Payment Details
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount_paid INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
  
  -- Email Tracking
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  confirmation_email_id TEXT,
  
  -- Payment Timestamps
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  payment_verified_at TIMESTAMPTZ,
  
  -- Marketing Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_session ON enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_razorpay_order ON enrollments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_razorpay_payment ON enrollments(razorpay_payment_id);

-- Prevent duplicate SUCCESSFUL enrollments for same session
-- Only applies to successful payments, allows retry for failed/pending payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_session_email_success 
  ON enrollments(session_id, email) 
  WHERE payment_status = 'success';

-- Create function to increment session enrollments
CREATE OR REPLACE FUNCTION increment_session_enrollments(session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sessions
  SET current_enrollments = current_enrollments + 1,
      updated_at = NOW()
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Service role can manage admin users"
  ON admin_users FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for admin_activity_log
CREATE POLICY "Service role can manage admin activity log"
  ON admin_activity_log FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for sessions
CREATE POLICY "Public can view upcoming sessions"
  ON sessions FOR SELECT
  USING (status = 'upcoming');

CREATE POLICY "Service role can manage sessions"
  ON sessions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for enrollments
CREATE POLICY "Public can create enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage enrollments"
  ON enrollments FOR ALL
  USING (auth.role() = 'service_role');

-- Insert sessions for October & November 2025
INSERT INTO sessions (title, session_date, zoom_link, zoom_meeting_id, zoom_passcode, max_capacity, price, status)
VALUES 
  (
    'Spark 101 - October 18, 2025',
    '2025-10-18 11:00:00+05:30',
    'https://meet.google.com/dkw-ztcj-wuo',
    'dkw-ztcj-wuo',
    '413 750 055',
    150,
    199,
    'upcoming'
  ),
  (
    'Spark 101 - October 25, 2025',
    '2025-10-25 11:00:00+05:30',
    'https://meet.google.com/yin-bpcm-fjt',
    'yin-bpcm-fjt',
    '916 452 432',
    150,
    199,
    'upcoming'
  ),
  (
    'Spark 101 - November 8, 2025',
    '2025-11-08 11:00:00+05:30',
    'https://meet.google.com/foa-kfvi-pbc',
    'foa-kfvi-pbc',
    '205 765 411',
    150,
    199,
    'upcoming'
  )
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
