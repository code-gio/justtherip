<script lang="ts">
  /**
   * Pack Detail Page — `/packs/[packId]`
   * 
   * PURPOSE: View pack details and initiate opening
   * 
   * COMPONENTS:
   * - Pack hero image/artwork
   * - Pack name and description
   * - Price in Jewels
   * - Card tiers breakdown:
   *   - Tier names
   *   - Probability percentages
   *   - Example cards per tier
   * - "Open Pack" button (if user has sufficient Jewels)
   * - Confirmation modal before spending Jewels
   * 
   * UI/UX CONSTRAINTS:
   * - Odds MUST be visible before opening
   * - Clear confirmation dialog before purchase
   * - Show Jewel balance vs pack cost
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Pack Details</h1>
  <p class="text-muted-foreground mt-2">
    Pack description, card tiers with odds, and Open Pack button
    with confirmation modal. Odds always visible before purchase.
  </p>
</div>

