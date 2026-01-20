-- SOLUTION FOR WILDCARD SEARCHES AT THE BEGINNING
-- Normal index doesn't work with ILIKE '%text%'
-- We need a GIN index with pg_trgm (trigram)

-- 1. Enable pg_trgm extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create GIN trigram index for flexible searches
CREATE INDEX IF NOT EXISTS idx_mtg_cards_name_gin_trgm 
ON mtg_cards USING gin (name gin_trgm_ops);

-- 3. Verify it was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'mtg_cards' 
AND indexname = 'idx_mtg_cards_name_gin_trgm';

-- 4. Test the search (should be MUCH faster)
SELECT name, set_name 
FROM mtg_cards 
WHERE name ILIKE '%lightning%' 
LIMIT 10;
