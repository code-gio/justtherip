<script lang="ts">
  /**
   * Buy Jewels Page — `/wallet/buy`
   * 
   * PURPOSE: Purchase Jewels via Stripe
   * 
   * FLOW:
   * 1. Display Jewel packages (e.g., 100, 500, 1000, 5000 Jewels)
   * 2. Show price per package in USD
   * 3. User selects package
   * 4. Redirect to Stripe Checkout
   * 5. Handle success/cancel callbacks
   * 6. Update wallet balance on success
   * 
   * COMPONENTS:
   * - Package cards with Jewel amounts and prices
   * - "Best value" badge for larger packages
   * - Secure payment badges
   * - Terms reminder (non-refundable, non-withdrawable)
   * 
   * UI/UX: Make the value proposition clear. Larger bundles = better deal.
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Buy Jewels</h1>
  <p class="text-muted-foreground mt-2">
    Select a Jewel package and complete purchase via Stripe Checkout.
    Packages range from small to bulk with value incentives.
  </p>
</div>

