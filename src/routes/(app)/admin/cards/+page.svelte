<script lang="ts">
  /**
   * Admin Card Catalog — `/admin/cards`
   * 
   * PURPOSE: Manage card database and pricing
   * 
   * ACCESS: Restricted to admin users only
   * 
   * FEATURES:
   * - View all cards in system
   * - Search/filter by:
   *   - Name
   *   - Game (MTG/Pokémon)
   *   - Set
   *   - Rarity
   * - Sync from market API (TCGPlayer, etc.):
   *   - Manual sync button
   *   - Last sync timestamp
   *   - Sync status/errors
   * - Per card:
   *   - Current market price
   *   - Max price cap (for sell-back limits)
   *   - Tier assignments
   * - Set max price caps (prevent abuse)
   * - Bulk operations
   * 
   * NOTES:
   * - Card values affect sell-back Jewel amounts
   * - Sync should be rate-limited
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Card Catalog</h1>
  <p class="text-muted-foreground mt-2">
    View and manage card database, sync from market APIs,
    set max price caps for sell-back limits.
  </p>
</div>

