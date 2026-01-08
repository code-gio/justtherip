-- ============================================================================
-- REMOVE TIER SYSTEM MIGRATION
-- ============================================================================
-- This migration removes tier dependencies from the database schema
-- after implementing the inverse-power probability distribution system.
--
-- Run this in Supabase SQL Editor after deploying the code changes.
-- ============================================================================

-- ============================================================================
-- 1. PACK_CARDS TABLE
-- ============================================================================
-- Remove tier_id and odds columns entirely (no longer used)

ALTER TABLE pack_cards 
  DROP COLUMN IF EXISTS tier_id,
  DROP COLUMN IF EXISTS odds;

-- ============================================================================
-- 2. PACK_TIERS TABLE
-- ============================================================================
-- Drop this table entirely (no longer used)

DROP TABLE IF EXISTS pack_tiers CASCADE;

-- ============================================================================
-- 3. USER_INVENTORY TABLE
-- ============================================================================
-- Make tier_id nullable (already should be, but ensure it)
-- tier_name can stay NOT NULL but will be set to "N/A" for new cards

-- Ensure tier_id is nullable (should already be, but make sure)
ALTER TABLE user_inventory 
  ALTER COLUMN tier_id DROP NOT NULL;

-- Optional: Make tier_name nullable if you want (currently it's NOT NULL)
-- ALTER TABLE user_inventory 
--   ALTER COLUMN tier_name DROP NOT NULL;

-- ============================================================================
-- 4. CARD_TIERS TABLE
-- ============================================================================
-- Drop this table entirely (no longer used)
-- First drop the foreign key constraint, then drop the table

-- Step 1: Drop the foreign key constraint on user_inventory
ALTER TABLE user_inventory 
  DROP CONSTRAINT IF EXISTS user_inventory_tier_id_fkey;

-- Step 2: Drop the card_tiers table
DROP TABLE IF EXISTS card_tiers CASCADE;

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the changes:

-- Check pack_cards structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'pack_cards' 
-- ORDER BY ordinal_position;

-- Check if pack_tiers still exists (should return 0 rows if dropped)
-- SELECT COUNT(*) FROM information_schema.tables 
-- WHERE table_name = 'pack_tiers';

-- Check user_inventory tier columns
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_inventory' 
-- AND column_name IN ('tier_id', 'tier_name')
-- ORDER BY ordinal_position;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. The pack_cards table now only requires:
--    - pack_id, card_uuid, market_value, is_foil, condition
--
-- 2. All tier-related tables have been dropped:
--    - pack_tiers (dropped)
--    - card_tiers (dropped)
--
-- 3. Tier-related columns removed:
--    - pack_cards.tier_id (dropped)
--    - pack_cards.odds (dropped)
--
-- 4. user_inventory.tier_id will be NULL for new cards
--    user_inventory.tier_name will be "N/A" for new cards
--    (These columns remain for backward compatibility but are not used)
--
-- 5. The foreign key constraint from user_inventory.tier_id to card_tiers
--    has been dropped, so user_inventory.tier_id can be NULL
-- ============================================================================
