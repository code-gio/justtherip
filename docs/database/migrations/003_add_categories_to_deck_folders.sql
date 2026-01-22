-- Add categories column to deck_folders table
-- This allows explicit management of card categories within decks

-- Add the categories column with a default value
ALTER TABLE public.deck_folders
ADD COLUMN IF NOT EXISTS categories text[] NULL DEFAULT array['Uncategorized']::text[];

-- Update existing decks to have the default category
UPDATE public.deck_folders
SET categories = array['Uncategorized']::text[]
WHERE type = 'deck' AND categories IS NULL;

-- Optional: Populate categories based on existing deck_cards
-- This will find all unique categories currently in use for each deck
DO $$
DECLARE
    deck_record RECORD;
    existing_categories text[];
BEGIN
    FOR deck_record IN 
        SELECT DISTINCT df.id 
        FROM deck_folders df
        WHERE df.type = 'deck'
    LOOP
        -- Get unique categories for this deck
        SELECT array_agg(DISTINCT COALESCE(category, 'Uncategorized'))
        INTO existing_categories
        FROM deck_cards
        WHERE deck_id = deck_record.id;
        
        -- Update deck with its categories if any exist
        IF existing_categories IS NOT NULL AND array_length(existing_categories, 1) > 0 THEN
            UPDATE deck_folders
            SET categories = existing_categories
            WHERE id = deck_record.id;
        END IF;
    END LOOP;
END $$;

-- Add a comment to the column
COMMENT ON COLUMN public.deck_folders.categories IS 'Array of category names for organizing cards within decks (only applicable when type = deck)';
