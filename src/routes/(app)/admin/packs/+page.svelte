<script lang="ts">
  /**
   * Admin Pack Management — `/admin/packs`
   * 
   * PURPOSE: Create, edit, and manage packs
   * 
   * ACCESS: Restricted to admin users only
   * 
   * FEATURES:
   * - List all packs (active and inactive)
   * - Create new pack:
   *   - Name, description, image
   *   - Game (MTG/Pokémon)
   *   - Price in Jewels
   *   - Card tiers and odds (must sum to 100%)
   *   - Card pool per tier
   * - Edit existing pack
   * - Activate/deactivate packs
   * - Adjust prices
   * - Modify odds (with validation)
   * - Set inventory/availability limits
   * 
   * VALIDATION:
   * - Odds must sum to exactly 100%
   * - Price must be positive integer
   * - Each tier needs at least one card
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Pack Management</h1>
  <p class="text-muted-foreground mt-2">
    Create and edit packs, set prices in Jewels, configure card tiers
    with odds, and activate/deactivate packs.
  </p>
</div>

