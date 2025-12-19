<script lang="ts">
  /**
   * Card Detail Page — `/inventory/[packOpenId]`
   * 
   * PURPOSE: View individual card details and take actions
   * 
   * COMPONENTS:
   * - Large card image (zoomable)
   * - Card metadata:
   *   - Name, set, rarity
   *   - Game (MTG/Pokémon)
   *   - Date pulled
   *   - Pack it came from
   * - Locked USD value (informational only, not withdrawable)
   * - Current status
   * 
   * ACTIONS:
   * - Sell-back button → Returns Jewels to wallet
   * - Ship request button → Initiates fulfillment
   * - Confirmation modals for both actions
   * 
   * UI/UX CONSTRAINTS:
   * - USD value is informational only
   * - No mention of cash-out or conversion
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Card Details</h1>
  <p class="text-muted-foreground mt-2">
    Full card view with image, metadata, and locked USD value (informational).
    Sell-back for Jewels or request physical shipment.
  </p>
</div>

