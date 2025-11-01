-- Test Data for Voting System
-- Run this in Supabase SQL Editor after running schema.sql

-- ============================================
-- 1. Create Test Election
-- ============================================
INSERT INTO public.elections (
  id,
  title,
  description,
  institute_id,
  start_date,
  end_date,
  status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'CCIS Student Council Election 2025',
  'Annual election for CCIS student council representatives',
  'ccis',
  '2025-11-01 08:00:00+08',
  '2025-11-30 18:00:00+08',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  status = 'active',
  updated_at = NOW();

-- ============================================
-- 2. Create Positions
-- ============================================
INSERT INTO public.positions (
  id,
  election_id,
  title,
  description,
  display_order
) VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Chairperson',
    'Lead the student council and represent CCIS students',
    1
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'Vice Chairperson',
    'Assist the chairperson and lead in their absence',
    2
  )
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();

-- ============================================
-- 3. Create Candidates
-- ============================================
INSERT INTO public.candidates (
  id,
  position_id,
  name,
  platform,
  display_order
) VALUES 
  -- Chairperson Candidates
  (
    '750e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Maria Santos',
    'Dedicated leader with a passion for technology and innovation. Past Leadership: President - CCIS Programming Club (2023-2024). GWA: 1.45 (Dean''s Lister). Qualifications: 3+ years student org experience, Project Management Certified.',
    1
  ),
  (
    '750e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'Juan Dela Cruz',
    'Experienced organizer focused on student welfare. Past Leadership: VP - Student Council (2022-2023). GWA: 1.52 (Dean''s Lister). Qualifications: Leadership training, Event management certified.',
    2
  ),
  -- Vice Chairperson Candidate
  (
    '750e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440002',
    'Ana Reyes',
    'Strategic thinker committed to academic excellence. Past Leadership: Secretary - Academic Affairs Committee (2023-2024). GWA: 1.38 (Dean''s Lister). Qualifications: Debate champion, Student research awardee.',
    1
  )
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();

-- ============================================
-- 4. Create Test Student User (if not exists)
-- ============================================
INSERT INTO public.users (
  email,
  name,
  role,
  institute_id
) VALUES (
  'student@umak.edu.ph',
  'Test Student',
  'student',
  'ccis'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 5. Verify Data
-- ============================================

-- Check election
SELECT id, title, status, institute_id FROM public.elections 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Check positions
SELECT id, title, election_id FROM public.positions 
WHERE election_id = '550e8400-e29b-41d4-a716-446655440000';

-- Check candidates
SELECT c.id, c.name, p.title as position 
FROM public.candidates c
JOIN public.positions p ON c.position_id = p.id
WHERE p.election_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY p.display_order, c.display_order;

-- ============================================
-- SUCCESS!
-- ============================================
-- You should now be able to:
-- 1. Login as student@umak.edu.ph
-- 2. Navigate to /vote
-- 3. See the 2 positions with 3 candidates
-- 4. Cast your vote
-- 5. See results in /dashboard leaderboard
