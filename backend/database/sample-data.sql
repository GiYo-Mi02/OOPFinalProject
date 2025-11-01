-- ============================================
-- COMPLETE SAMPLE DATA SCRIPT
-- ============================================
-- This script creates a complete test election with positions and sample candidates
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE SAMPLE ADMIN USER
-- ============================================
INSERT INTO users (email, name, role, institute_id)
VALUES 
    ('admin@umak.edu.ph', 'Admin User', 'admin', NULL),
    ('student1@umak.edu.ph', 'Juan Dela Cruz', 'student', 'ccis'),
    ('student2@umak.edu.ph', 'Maria Santos', 'student', 'ccis'),
    ('student3@umak.edu.ph', 'Pedro Reyes', 'student', 'ccis')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. CREATE SAMPLE ELECTION
-- ============================================
DO $$
DECLARE
    election_uuid UUID;
    position_chairperson UUID;
    position_vice UUID;
    position_secretary UUID;
    position_treasurer UUID;
BEGIN
    -- Create election
    INSERT INTO elections (title, description, institute_id, start_date, end_date, status)
    VALUES (
        'CCIS Student Council Election 2025',
        'Annual election for the College of Computer and Information Science student council',
        'ccis',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '7 days',
        'active'
    )
    RETURNING id INTO election_uuid;

    RAISE NOTICE 'Created election with ID: %', election_uuid;

    -- Create all standard positions
    INSERT INTO positions (election_id, title, display_order)
    VALUES 
        (election_uuid, 'Chairperson', 1),
        (election_uuid, 'Vice Chairperson', 2),
        (election_uuid, 'Secretary', 3),
        (election_uuid, 'Treasurer', 4),
        (election_uuid, 'Auditor', 5),
        (election_uuid, '1st Year Representative', 6),
        (election_uuid, '2nd Year Representative', 7),
        (election_uuid, '3rd Year Representative', 8),
        (election_uuid, '4th Year Representative', 9),
        (election_uuid, 'Public Relations Officer', 10),
        (election_uuid, 'Representative', 11);

    RAISE NOTICE 'Created 11 positions';

    -- Get position IDs for adding sample candidates
    SELECT id INTO position_chairperson FROM positions WHERE election_id = election_uuid AND title = 'Chairperson';
    SELECT id INTO position_vice FROM positions WHERE election_id = election_uuid AND title = 'Vice Chairperson';
    SELECT id INTO position_secretary FROM positions WHERE election_id = election_uuid AND title = 'Secretary';
    SELECT id INTO position_treasurer FROM positions WHERE election_id = election_uuid AND title = 'Treasurer';

    -- Create sample candidates for Chairperson
    INSERT INTO candidates (position_id, name, platform, image_url)
    VALUES 
        (
            position_chairperson,
            'John Michael Torres',
            'Experienced leader with vision for student welfare|Former Class President, Debate Team Captain|GWA: 1.35 (Dean''s Lister)|Certified Leader, Public Speaking Award',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
        ),
        (
            position_chairperson,
            'Sarah Mae Villanueva',
            'Committed to transparency and student empowerment|Student Council Secretary 2024, Volunteer Coordinator|GWA: 1.42 (Dean''s Lister)|Leadership Training Certificate, Event Management',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
        );

    -- Create sample candidates for Vice Chairperson
    INSERT INTO candidates (position_id, name, platform, image_url)
    VALUES 
        (
            position_vice,
            'Carlos Antonio Reyes',
            'Supporting student initiatives and innovation|Vice President - Tech Club|GWA: 1.50 (Dean''s Lister)|Programming Certifications, Hackathon Winner',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos'
        ),
        (
            position_vice,
            'Anna Marie Cruz',
            'Bridging students and administration effectively|Student Council Member, Student Ambassador|GWA: 1.38|Communication Excellence Award, Student Leader',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=anna'
        );

    -- Create sample candidates for Secretary
    INSERT INTO candidates (position_id, name, platform, image_url)
    VALUES 
        (
            position_secretary,
            'Miguel Angelo Santos',
            'Organized documentation and efficient communication|Documentation Officer - ACM Club|GWA: 1.45|Microsoft Office Specialist, Organizational Skills',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=miguel'
        );

    -- Create sample candidates for Treasurer
    INSERT INTO candidates (position_id, name, platform, image_url)
    VALUES 
        (
            position_treasurer,
            'Patricia Anne Gonzales',
            'Financial transparency and responsible budgeting|Finance Committee Member|GWA: 1.40|Accounting Fundamentals, Budget Management',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=patricia'
        );

    RAISE NOTICE 'Created sample candidates for top 4 positions';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'SETUP COMPLETE!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Election ID: %', election_uuid;
    RAISE NOTICE 'Election Title: CCIS Student Council Election 2025';
    RAISE NOTICE 'Status: Active';
    RAISE NOTICE 'Positions: 11 (all standard positions)';
    RAISE NOTICE 'Candidates: 6 sample candidates';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '1. Log in to the admin panel';
    RAISE NOTICE '2. Add more candidates through the UI';
    RAISE NOTICE '3. Students can start voting!';
    RAISE NOTICE '================================================';

END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- View the created election
SELECT 
    id,
    title,
    institute_id,
    status,
    start_date,
    end_date
FROM elections
ORDER BY created_at DESC
LIMIT 1;

-- View all positions
SELECT 
    p.title,
    p.display_order,
    COUNT(c.id) as candidate_count
FROM positions p
LEFT JOIN candidates c ON p.id = c.position_id
WHERE p.election_id = (SELECT id FROM elections ORDER BY created_at DESC LIMIT 1)
GROUP BY p.id, p.title, p.display_order
ORDER BY p.display_order;

-- View all candidates
SELECT 
    p.title as position,
    c.name as candidate_name,
    SPLIT_PART(c.platform, '|', 1) as description
FROM candidates c
JOIN positions p ON c.position_id = p.id
WHERE p.election_id = (SELECT id FROM elections ORDER BY created_at DESC LIMIT 1)
ORDER BY p.display_order, c.name;

COMMENT ON SCRIPT IS 'Complete sample data setup for UMakEBallot';
