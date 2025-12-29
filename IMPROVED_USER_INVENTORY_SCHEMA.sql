-- Improved user_inventory table schema
-- Addresses missing fields and inconsistencies found in codebase

CREATE TABLE IF NOT EXISTS public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pack_opening_id UUID NULL,
  
  -- Card Reference (CRITICAL: Links to actual card in game-specific table)
  card_uuid UUID NOT NULL, -- References card in mtg_cards, pokemon_cards, etc.
  game_code TEXT NOT NULL DEFAULT 'mtg', -- Which game this card belongs to
  
  -- Card Identity
  card_name VARCHAR(255) NOT NULL,
  card_image_url TEXT NULL, -- Extracted from card.image_uri for easy display
  
  -- Tier Information
  tier_id UUID NULL, -- References card_tiers.id (better for joins than just name)
  tier_name VARCHAR(50) NOT NULL,
  
  -- Card Value
  card_value_cents INTEGER NOT NULL,
  
  -- Card Metadata (from pack_cards and card data)
  set_name VARCHAR(255) NULL,
  set_code VARCHAR(50) NULL,
  rarity VARCHAR(50) NULL,
  is_foil BOOLEAN NULL DEFAULT false,
  condition VARCHAR(20) NULL DEFAULT 'NM', -- Near Mint, Lightly Played, etc.
  
  -- Sellback Information
  is_sold BOOLEAN NOT NULL DEFAULT false,
  sold_at TIMESTAMPTZ NULL,
  sellback_rips NUMERIC(10, 2) NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT user_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT user_inventory_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_inventory_pack_opening_id_fkey 
    FOREIGN KEY (pack_opening_id) REFERENCES pack_openings(id) ON DELETE SET NULL,
  CONSTRAINT user_inventory_tier_id_fkey 
    FOREIGN KEY (tier_id) REFERENCES card_tiers(id) ON DELETE SET NULL,
  CONSTRAINT user_inventory_card_value_cents_check 
    CHECK (card_value_cents > 0),
  CONSTRAINT user_inventory_sellback_rips_check 
    CHECK (sellback_rips >= 0::numeric),
  CONSTRAINT user_inventory_game_code_check 
    CHECK (game_code IN ('mtg', 'pokemon')),
  CONSTRAINT user_inventory_condition_check 
    CHECK (condition IN ('NM', 'LP', 'MP', 'HP', 'DMG')),
  
  -- Complex constraint: sold status consistency
  CONSTRAINT user_inventory_sold_status_check CHECK (
    (
      -- Not sold: all sellback fields must be null/false
      (is_sold = false) AND 
      (sold_at IS NULL) AND 
      (sellback_rips IS NULL)
    ) OR (
      -- Sold: all sellback fields must be set
      (is_sold = true) AND 
      (sold_at IS NOT NULL) AND 
      (sellback_rips IS NOT NULL)
    )
  )
) TABLESPACE pg_default;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id 
  ON public.user_inventory USING btree (user_id) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_user_inventory_is_sold 
  ON public.user_inventory USING btree (is_sold) 
  TABLESPACE pg_default;

-- Composite index for active inventory queries (most common)
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_unsold 
  ON public.user_inventory USING btree (user_id, is_sold) 
  WHERE (is_sold = false)
  TABLESPACE pg_default;

-- Index for pack opening lookups
CREATE INDEX IF NOT EXISTS idx_user_inventory_pack_opening_id 
  ON public.user_inventory USING btree (pack_opening_id) 
  TABLESPACE pg_default;

-- Index for tier filtering
CREATE INDEX IF NOT EXISTS idx_user_inventory_tier_id 
  ON public.user_inventory USING btree (tier_id) 
  TABLESPACE pg_default;

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_user_inventory_created_at 
  ON public.user_inventory USING btree (created_at DESC) 
  TABLESPACE pg_default;

-- Index for card lookups (if you need to find all instances of a card)
CREATE INDEX IF NOT EXISTS idx_user_inventory_card_uuid 
  ON public.user_inventory USING btree (card_uuid) 
  TABLESPACE pg_default;

-- Composite index for tier + sold status (common filter combo)
CREATE INDEX IF NOT EXISTS idx_user_inventory_tier_sold 
  ON public.user_inventory USING btree (tier_id, is_sold) 
  WHERE (is_sold = false)
  TABLESPACE pg_default;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_inventory_updated_at
  BEFORE UPDATE ON public.user_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_user_inventory_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.user_inventory IS 'Stores cards owned by users from pack openings';
COMMENT ON COLUMN public.user_inventory.card_uuid IS 'References the actual card in game-specific table (mtg_cards, pokemon_cards, etc.)';
COMMENT ON COLUMN public.user_inventory.game_code IS 'Which game this card belongs to (mtg, pokemon)';
COMMENT ON COLUMN public.user_inventory.tier_id IS 'References card_tiers table for better joins and consistency';
COMMENT ON COLUMN public.user_inventory.card_image_url IS 'Extracted image URL for easy display without parsing JSONB';
COMMENT ON COLUMN public.user_inventory.is_foil IS 'Whether this specific card instance is foil';
COMMENT ON COLUMN public.user_inventory.condition IS 'Card condition: NM (Near Mint), LP (Lightly Played), MP (Moderately Played), HP (Heavily Played), DMG (Damaged)';

