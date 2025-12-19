<script lang="ts">
  /**
   * Wallet Page — `/wallet`
   * 
   * PURPOSE: Jewel balance management
   * 
   * COMPONENTS:
   * - Current Jewel balance (large, prominent)
   * - "Buy Jewels" CTA button → /wallet/buy
   * - Transaction history (read-only):
   *   - Date
   *   - Type (purchase, pack open, sell-back)
   *   - Amount (+/-)
   *   - Description
   * - Pagination for history
   * 
   * UI/UX CONSTRAINTS:
   * - Jewels clearly labeled as non-withdrawable
   * - No cash-out option or mention
   * - Transactions are for transparency only
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Wallet</h1>
  <p class="text-muted-foreground mt-2">
    View Jewel balance, buy more Jewels, and see read-only transaction history.
    Jewels are non-withdrawable virtual currency.
  </p>
</div>

