# User Inventory Schema Improvements

## Issues Found in Current Schema

### 1. **Missing Critical Fields**
- ❌ No `card_uuid` - Cannot reference the actual card from game-specific tables
- ❌ No `tier_id` - Only has `tier_name`, making joins difficult
- ❌ No `card_image_url` - Code tries to insert this but schema doesn't support it
- ❌ No `set_name`, `set_code`, `rarity` - Code tries to insert these
- ❌ No `is_foil`, `condition` - Important metadata from `pack_cards` table
- ❌ No `game_code` - Needed to know which card table to query

### 2. **Code Inconsistencies**
- Code uses `sold` but schema has `is_sold` ✅ (schema is correct)
- Code uses `obtained_at` but schema has `created_at` ✅ (schema is correct, code needs fix)
- Code tries to insert fields that don't exist in schema

### 3. **Missing Indexes**
- No index on `pack_opening_id` (needed for lookups)
- No index on `tier_id` (needed for filtering)
- No index on `created_at` (needed for sorting)
- No index on `card_uuid` (needed for card lookups)

## Improvements Made

### ✅ Added Fields

1. **`card_uuid` (UUID, NOT NULL)**
   - **Why**: Links to actual card in `mtg_cards`, `pokemon_cards`, etc.
   - **Critical**: Without this, you can't fetch updated card data or verify card details

2. **`game_code` (TEXT, NOT NULL, DEFAULT 'mtg')**
   - **Why**: Determines which card table to query (`mtg_cards` vs `pokemon_cards`)
   - **Constraint**: Only allows 'mtg' or 'pokemon'

3. **`tier_id` (UUID, NULLABLE)**
   - **Why**: Better for joins than just `tier_name`
   - **Foreign Key**: References `card_tiers.id`
   - **Nullable**: In case tier is deleted, we still have `tier_name`

4. **`card_image_url` (TEXT, NULLABLE)**
   - **Why**: Extracted from card's `image_uri` JSONB for easy display
   - **Performance**: Avoids parsing JSONB on every query

5. **`set_name`, `set_code`, `rarity` (VARCHAR, NULLABLE)**
   - **Why**: Important metadata for displaying cards
   - **From**: Card data fetched from game-specific tables

6. **`is_foil` (BOOLEAN, DEFAULT false)**
   - **Why**: Foil cards have different values
   - **From**: `pack_cards.is_foil` field

7. **`condition` (VARCHAR(20), DEFAULT 'NM')**
   - **Why**: Card condition affects value
   - **From**: `pack_cards.condition` field
   - **Values**: NM, LP, MP, HP, DMG

8. **`updated_at` (TIMESTAMPTZ)**
   - **Why**: Track when card was sold/updated
   - **Auto-updated**: Via trigger

### ✅ Added Indexes

1. **`idx_user_inventory_pack_opening_id`**
   - For: Looking up all cards from a pack opening
   - Query: "Show me all cards from this pack opening"

2. **`idx_user_inventory_tier_id`**
   - For: Filtering inventory by tier
   - Query: "Show me all my Chase cards"

3. **`idx_user_inventory_created_at`**
   - For: Sorting by newest cards
   - Query: "Show my most recent pulls"

4. **`idx_user_inventory_card_uuid`**
   - For: Finding all instances of a specific card
   - Query: "How many copies of this card do I have?"

5. **`idx_user_inventory_tier_sold`**
   - For: Filtering by tier and sold status (common combo)
   - Query: "Show me all my unsold Chase cards"

### ✅ Added Constraints

1. **`user_inventory_game_code_check`**
   - Ensures only valid game codes

2. **`user_inventory_condition_check`**
   - Ensures only valid condition values

3. **`user_inventory_tier_id_fkey`**
   - Foreign key to `card_tiers` table
   - `ON DELETE SET NULL` to preserve data if tier deleted

4. **`user_inventory_pack_opening_id_fkey`**
   - Foreign key to `pack_openings` table
   - `ON DELETE SET NULL` to preserve inventory if opening deleted

### ✅ Added Trigger

- **`update_user_inventory_updated_at`**
  - Automatically updates `updated_at` on any row change
  - Useful for tracking when cards are sold

## Migration Notes

### Breaking Changes
- **`card_uuid` is NOT NULL** - You'll need to populate this for existing records
- **`game_code` is NOT NULL** - Defaults to 'mtg' but should be set correctly

### Data Migration Required

If you have existing data, you'll need to:

1. **Populate `card_uuid`**:
   ```sql
   -- This is tricky - you'll need to match cards by name
   -- Better to do this during pack opening going forward
   UPDATE user_inventory 
   SET card_uuid = (SELECT id FROM mtg_cards WHERE name = user_inventory.card_name LIMIT 1)
   WHERE card_uuid IS NULL;
   ```

2. **Set `game_code`**:
   ```sql
   -- If all existing cards are MTG
   UPDATE user_inventory SET game_code = 'mtg' WHERE game_code IS NULL;
   ```

3. **Populate `tier_id`**:
   ```sql
   UPDATE user_inventory ui
   SET tier_id = ct.id
   FROM card_tiers ct
   WHERE ct.name = ui.tier_name;
   ```

## Code Updates Needed

### 1. Fix Inventory API (`/api/inventory/+server.ts`)
```typescript
// Change:
.eq("sold", false)  // ❌ Wrong field name
.order("obtained_at", { ascending: false })  // ❌ Wrong field name

// To:
.eq("is_sold", false)  // ✅ Correct
.order("created_at", { ascending: false })  // ✅ Correct
```

### 2. Fix Sell API (`/api/inventory/sell/+server.ts`)
```typescript
// Change:
.eq("sold", false)  // ❌ Wrong field name

// To:
.eq("is_sold", false)  // ✅ Correct
```

### 3. Update Pack Opening (`/api/packs/open/+server.ts`)
```typescript
// Add these fields when inserting:
{
  card_uuid: selectedCard.card_uuid,  // ✅ NEW
  game_code: pack.game_code,  // ✅ NEW
  tier_id: selectedCard.tier_id,  // ✅ NEW
  card_image_url: extractedImageUrl,  // ✅ NEW
  set_name: cardData.set_name,  // ✅ NEW
  set_code: cardData.set_code,  // ✅ NEW
  rarity: cardData.rarity,  // ✅ NEW
  is_foil: selectedCard.is_foil,  // ✅ NEW
  condition: selectedCard.condition,  // ✅ NEW
  // ... existing fields
}
```

## Benefits

1. **Data Integrity**: Foreign keys ensure referential integrity
2. **Query Performance**: Proper indexes for common queries
3. **Flexibility**: Can reference actual card data for updates
4. **Completeness**: All card metadata stored for display
5. **Maintainability**: Clear structure with documentation

## Recommendation

**Use the improved schema** - It addresses all the issues found in the codebase and provides a solid foundation for the pack opening system.

