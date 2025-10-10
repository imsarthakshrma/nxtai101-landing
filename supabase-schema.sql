-- NXTAI101 Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

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

-- Insert sample session (for testing)
INSERT INTO sessions (title, session_date, zoom_link, zoom_meeting_id, zoom_passcode, max_capacity)
VALUES (
  'Spark 101 - October 11, 2025',
  '2025-10-11 15:00:00+05:30',
  'https://zoom.us/j/123456789',
  '123 456 789',
  'spark101',
  150
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
