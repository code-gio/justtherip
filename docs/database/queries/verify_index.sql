-- RUN THESE QUERIES ONE BY ONE AND SEND ME THE RESULTS

-- 1. Verify that the index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'mtg_cards' 
AND indexname = 'idx_mtg_cards_name_lower';

-- 2. Count how many MTG cards you have
SELECT COUNT(*) as total_cards FROM mtg_cards;

-- 3. Test how many cards match "lightning"
SELECT COUNT(*) FROM mtg_cards WHERE LOWER(name) LIKE '%lightning%';

-- 4. Check current database timeout
SHOW statement_timeout;

-- 5. Run EXPLAIN to see if it uses the index
EXPLAIN SELECT * FROM mtg_cards WHERE name ILIKE '%lightning%' LIMIT 25;
