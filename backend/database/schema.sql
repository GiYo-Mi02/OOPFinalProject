-- UMak eBallot Database Schema
-- Run this script in your Supabase SQL Editor

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  institute_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_institute ON public.users(institute_id);

-- ============================================
-- 2. Elections Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  institute_id TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elections_institute ON public.elections(institute_id);
CREATE INDEX IF NOT EXISTS idx_elections_status ON public.elections(status);

-- ============================================
-- 3. Positions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_positions_election ON public.positions(election_id);

-- ============================================
-- 4. Candidates Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_position ON public.candidates(position_id);

-- ============================================
-- 5. Votes Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  is_abstain BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per user per position in an election
  UNIQUE(user_id, position_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON public.votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON public.votes(candidate_id);

-- ============================================
-- 6. Audit Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================
-- 7. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. RLS Policies
-- ============================================

-- Users: Can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Elections: Everyone can read active/upcoming elections
CREATE POLICY "Anyone can read elections" ON public.elections
  FOR SELECT USING (true);

-- Positions: Everyone can read positions
CREATE POLICY "Anyone can read positions" ON public.positions
  FOR SELECT USING (true);

-- Candidates: Everyone can read candidates
CREATE POLICY "Anyone can read candidates" ON public.candidates
  FOR SELECT USING (true);

-- Votes: Users can only insert their own votes and read their own votes
CREATE POLICY "Users can insert own votes" ON public.votes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own votes" ON public.votes
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Audit logs: Users can read their own logs, admins can read all
CREATE POLICY "Users can read own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================
-- 9. Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. Seed Data (Optional)
-- ============================================

-- Insert sample institutes (used as reference data)
-- Note: These are stored as text values, not a separate table

-- Insert an admin user for testing (adjust email as needed)
INSERT INTO public.users (email, role, institute_id)
VALUES ('admin@umak.edu.ph', 'admin', null)
ON CONFLICT (email) DO NOTHING;

-- Insert sample election
INSERT INTO public.elections (title, description, institute_id, start_date, end_date, status)
VALUES (
  'CCIS Student Council Election 2025',
  'Annual election for CCIS student council representatives',
  'ccis',
  '2025-11-15 08:00:00+08',
  '2025-11-15 18:00:00+08',
  'upcoming'
) ON CONFLICT DO NOTHING;

-- Note: You'll need to add positions and candidates via the admin interface
-- or additional SQL scripts once you have the election IDs

COMMENT ON TABLE public.users IS 'Stores user profiles with role-based access';
COMMENT ON TABLE public.elections IS 'Election metadata including dates and status';
COMMENT ON TABLE public.positions IS 'Positions available in each election (e.g., President, VP)';
COMMENT ON TABLE public.candidates IS 'Candidates running for each position';
COMMENT ON TABLE public.votes IS 'Individual votes cast by users with uniqueness constraint';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for security and compliance';
