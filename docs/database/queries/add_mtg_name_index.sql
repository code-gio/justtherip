-- Add index on name column for mtg_cards table to improve search performance
-- This will significantly speed up ILIKE queries on the name field

-- Create index for case-insensitive searches on name
CREATE INDEX IF NOT EXISTS idx_mtg_cards_name_lower ON mtg_cards(LOWER(name));

-- Optional: Add a GIN index for full-text search (more advanced)
-- Uncomment if you want even better text search performance
-- CREATE INDEX IF NOT EXISTS idx_mtg_cards_name_gin ON mtg_cards USING gin(to_tsvector('english', name));

