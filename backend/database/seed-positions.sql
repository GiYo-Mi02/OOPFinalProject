-- ============================================
-- SEED SCRIPT: Add Positions to ALL Elections
-- ============================================
-- This script adds common student council positions to ALL elections in the database
-- Safe to run multiple times (checks for existing positions first)

DO $$
DECLARE
    election_record RECORD;
    positions_added INTEGER := 0;
    elections_processed INTEGER := 0;
    position_title TEXT;
    position_titles TEXT[] := ARRAY[
        'Chairperson',
        'Vice Chairperson',
        'Secretary',
        'Treasurer',
        'Auditor',
        '1st Year Representative',
        '2nd Year Representative',
        '3rd Year Representative',
        '4th Year Representative',
        'Public Relations Officer',
        'Representative'
    ];
    display_order_counter INTEGER;
BEGIN
    -- Loop through ALL elections
    FOR election_record IN 
        SELECT id, title, institute_id, status FROM elections ORDER BY created_at DESC
    LOOP
        elections_processed := elections_processed + 1;
        
        RAISE NOTICE 'Processing election: % (ID: %)', election_record.title, election_record.id;

        display_order_counter := 1;
        
        -- Insert each position individually to avoid conflicts
        FOREACH position_title IN ARRAY position_titles
        LOOP
            -- Check if position already exists
            IF NOT EXISTS (
                SELECT 1 FROM positions 
                WHERE election_id = election_record.id 
                AND title = position_title
            ) THEN
                -- Insert the position
                INSERT INTO positions (election_id, title, display_order)
                VALUES (election_record.id, position_title, display_order_counter);
                
                positions_added := positions_added + 1;
            END IF;
            
            display_order_counter := display_order_counter + 1;
        END LOOP;
        
        RAISE NOTICE '  → Added % new positions', positions_added;
        positions_added := 0; -- Reset for next election
    END LOOP;

    RAISE NOTICE '================================================';
    RAISE NOTICE 'COMPLETE!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Elections processed: %', elections_processed;
    RAISE NOTICE 'All elections now have standard positions!';
    RAISE NOTICE '================================================';
    
    IF elections_processed = 0 THEN
        RAISE NOTICE 'No elections found in database. Create an election first.';
    END IF;
END $$;

-- ============================================
-- VERIFICATION: View all elections and their positions
-- ============================================
SELECT 
    e.title as election,
    e.institute_id,
    e.status,
    COUNT(p.id) as position_count,
    STRING_AGG(p.title, ', ' ORDER BY p.display_order) as positions
FROM elections e
LEFT JOIN positions p ON e.id = p.election_id
GROUP BY e.id, e.title, e.institute_id, e.status
ORDER BY e.created_at DESC;
