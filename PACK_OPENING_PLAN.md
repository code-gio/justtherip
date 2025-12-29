# Pack Opening Function Plan

## Overview
The pack opening system needs to be updated to work with pack-specific cards stored in the `pack_cards` table, where each pack has its own set of cards assigned to tiers with individual odds.

## Current State
- Current `drawCard()` function uses generic tier probabilities from `card_tiers` table
- Pack opening endpoint (`/api/packs/open`) doesn't use pack-specific cards
- Cards are stored in `pack_cards` table with:
  - `pack_id`: Links to specific pack
  - `card_uuid`: References card in game-specific table (e.g., `mtg_cards`)
  - `tier_id`: Which tier this card belongs to
  - `odds`: Weight within the tier (for weighted selection)
  - `market_value`: Card's market value in cents
  - `is_foil`: Whether card is foil
  - `condition`: Card condition

## New Pack Opening Flow

### 1. Validation Phase
- [ ] Verify user is authenticated
- [ ] Fetch pack from database using `pack_id`
- [ ] Verify pack exists and is active (`is_active = true`)
- [ ] Check user has sufficient Rips (`balance >= pack.rip_cost`)
- [ ] Verify pack has cards assigned (`pack_cards` count > 0)

### 2. Rips Deduction Phase
- [ ] Deduct Rips using `spendRips()` function
- [ ] Handle failure: If deduction fails, return error immediately
- [ ] Store transaction reference for potential refund

### 3. Card Selection Phase
**New function: `drawCardFromPack(packId: string)`**

#### 3.1 Fetch Pack Configuration
- [ ] Fetch `pack_tiers` for the pack (tier probabilities)
- [ ] Fetch `pack_cards` for the pack (all available cards)
- [ ] Group cards by `tier_id`
- [ ] Calculate total odds per tier (sum of all `odds` values in each tier)

#### 3.2 Tier Selection (Weighted Random)
- [ ] Use `pack_tiers` probabilities to select a tier
- [ ] Algorithm:
  ```typescript
  const random = Math.random();
  let cumulative = 0;
  for (const packTier of packTiers) {
    cumulative += packTier.probability;
    if (random <= cumulative) {
      selectedTier = packTier;
      break;
    }
  }
  ```

#### 3.3 Card Selection Within Tier (Weighted Random)
- [ ] Get all cards in selected tier from `pack_cards`
- [ ] Calculate normalized weights: `cardWeight = card.odds / totalTierOdds`
- [ ] Select card using weighted random:
  ```typescript
  const random = Math.random();
  let cumulative = 0;
  for (const card of tierCards) {
    cumulative += cardWeight;
    if (random <= cumulative) {
      selectedCard = card;
      break;
    }
  }
  ```

#### 3.4 Fetch Card Details
- [ ] Determine card table from `pack.game_code` (e.g., `mtg_cards`, `pokemon_cards`)
- [ ] Fetch full card data from game-specific table using `card_uuid`
- [ ] Extract:
  - Card name
  - Card image (handle JSONB `image_uri` field)
  - Set name/code
  - Rarity
  - Prices (if available)

### 4. Database Recording Phase

#### 4.1 Update Pack Statistics
- [ ] Increment `packs.total_openings` counter
- [ ] Use atomic increment: `UPDATE packs SET total_openings = total_openings + 1 WHERE id = ?`

#### 4.2 Record Pack Opening
- [ ] Insert into `pack_openings` table:
  ```typescript
  {
    user_id: userId,
    pack_id: packId,
    rips_spent: pack.rip_cost,
    cards_pulled: JSONB array of card objects,
    total_value_cents: selectedCard.market_value,
    created_at: now()
  }
  ```

#### 4.3 Add to User Inventory
- [ ] Insert into `user_inventory` table:
  ```typescript
  {
    user_id: userId,
    pack_opening_id: packOpening.id,
    card_uuid: selectedCard.card_uuid,
    card_name: cardData.name,
    card_value_cents: selectedCard.market_value,
    tier_id: selectedCard.tier_id,
    tier_name: tier.name,
    is_foil: selectedCard.is_foil,
    condition: selectedCard.condition,
    set_name: cardData.set_name,
    rarity: cardData.rarity,
    card_image_url: extracted from cardData.image_uri,
    is_sold: false,
    created_at: now()
  }
  ```

### 5. Response Phase
- [ ] Return success response with:
  ```typescript
  {
    success: true,
    card: {
      id: inventoryItem.id,
      card_uuid: selectedCard.card_uuid,
      card_name: cardData.name,
      tier_name: tier.name,
      value_cents: selectedCard.market_value,
      value_usd: (selectedCard.market_value / 100).toFixed(2),
      card_image_url: imageUrl,
      set_name: cardData.set_name,
      rarity: cardData.rarity,
      is_foil: selectedCard.is_foil,
      condition: selectedCard.condition
    },
    new_balance: spendResult.balance,
    pack_opening_id: packOpening.id
  }
  ```

## Error Handling

### Rollback Strategy
If any step fails after Rips are deducted:
1. **Card selection fails**: Refund Rips (add back to balance)
2. **Database insert fails**: 
   - Try to refund Rips
   - Log error for manual investigation
   - Return error to user

### Error Cases
- [ ] Pack not found or inactive
- [ ] Insufficient Rips
- [ ] Pack has no cards assigned
- [ ] No cards in selected tier (edge case)
- [ ] Card data fetch fails
- [ ] Database insert fails

## Edge Cases to Handle

1. **Pack with no cards**: Return error before deducting Rips
2. **Tier with no cards**: Should not happen if admin properly configured, but handle gracefully
3. **Card odds = 0**: Skip cards with 0 odds
4. **Multiple cards per pack**: Support `cards_per_pack` field (currently defaults to 1)
5. **Daily ultra-chase limit**: Check if still needed with pack-specific system

## Database Schema Considerations

### pack_openings table
- Should store array of cards if `cards_per_pack > 1`
- `cards_pulled` JSONB field can store full card objects

### user_inventory table
- One row per card pulled
- Links to `pack_opening_id` for tracking

## Implementation Steps

1. **Create new function**: `drawCardFromPack(packId: string)` in `card-draw.ts`
2. **Update pack opening endpoint**: Use new function instead of generic `drawCard()`
3. **Add validation**: Check pack has cards before opening
4. **Handle multiple cards**: Support `cards_per_pack` field
5. **Update error handling**: Add rollback logic
6. **Test edge cases**: Empty packs, tiers, etc.

## Future Enhancements

- [ ] Support opening multiple packs at once
- [ ] Animation/visual effects for pack opening
- [ ] Pack opening history page
- [ ] Statistics: Most pulled cards, rarest pulls, etc.
- [ ] Pack opening streaks/achievements

