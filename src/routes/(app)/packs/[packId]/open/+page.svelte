<script lang="ts">
  /**
   * Pack Opening Page — `/packs/[packId]/open`
   * 
   * PURPOSE: Animated pack opening experience
   * 
   * FLOW:
   * 1. Loading / suspense state while API processes
   * 2. Pack opening animation (wrapper peeling, pack tearing)
   * 3. Card reveal animation (flip, glow effects)
   * 4. Result confirmation with card details
   * 5. Options: View in inventory, Open another, Back to packs
   * 
   * RULES:
   * - One-time render per pack open (idempotency key)
   * - Animation should be skippable
   * - Results fetched from backend (no client-side RNG)
   * - Handle edge cases (insufficient funds, sold out)
   * 
   * This is the core "fun" experience of the app.
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Pack Opening</h1>
  <p class="text-muted-foreground mt-2">
    Animated pack opening experience with loading state, pack animation,
    card reveal, and result confirmation. Uses idempotency key for one-time renders.
  </p>
</div>

