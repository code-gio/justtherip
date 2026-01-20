-- RUN THIS IN SUPABASE SQL EDITOR TO DIAGNOSE THE ISSUE

-- 1. Check if the index exists
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'mtg_cards';

-- 2. Verify how many MTG cards exist
SELECT COUNT(*) as total_mtg_cards FROM mtg_cards;

-- 3. Test a simple search WITHOUT index (to see if it's the problem)
-- ONLY RUN THIS IF THE PREVIOUS ONES WORKED
-- SELECT COUNT(*) FROM mtg_cards WHERE name ILIKE '%lightning%' LIMIT 10;

-- 4. If the index doesn't exist, CREATE IT:
CREATE INDEX IF NOT EXISTS idx_mtg_cards_name_lower ON mtg_cards(LOWER(name));

-- 5. After creating the index, verify it was created:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'mtg_cards' 
AND indexname = 'idx_mtg_cards_name_lower';
