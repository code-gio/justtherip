<script lang="ts">
  /**
   * Inventory Page — `/inventory`
   * 
   * PURPOSE: View and manage pulled cards
   * 
   * COMPONENTS:
   * - Grid/list toggle view of all cards
   * - Card thumbnails with:
   *   - Card image
   *   - Card name
   *   - Game (MTG/Pokémon)
   *   - Status badge (owned / sold back / shipped / pending shipment)
   * - Filter by status, game, date pulled
   * - Sort by value, date, name
   * 
   * ACTIONS (per card):
   * - View details → /inventory/[packOpenId]
   * - Quick sell back (returns Jewels)
   * - Request shipment
   * 
   * UI/UX: Cards in different states should be visually distinct.
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Inventory</h1>
  <p class="text-muted-foreground mt-2">
    Grid/list view of pulled cards with metadata and status.
    Actions: sell back for Jewels or request physical shipment.
  </p>
</div>

