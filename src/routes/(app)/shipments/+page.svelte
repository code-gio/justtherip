<script lang="ts">
  /**
   * Shipments Page — `/shipments`
   * 
   * PURPOSE: Track physical card fulfillment
   * 
   * COMPONENTS:
   * - List of all shipment requests
   * - Per shipment:
   *   - Card thumbnail and name
   *   - Request date
   *   - Status indicator (pending, processing, shipped, delivered)
   *   - Tracking number (when available, clickable)
   *   - Carrier info
   *   - Estimated delivery
   * - Filter by status
   * - Sort by date
   * 
   * STATES:
   * - Pending: Request received, awaiting processing
   * - Processing: Being prepared for shipment
   * - Shipped: In transit with tracking
   * - Delivered: Confirmed delivery
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Shipments</h1>
  <p class="text-muted-foreground mt-2">
    Track fulfillment status of shipped cards with tracking numbers,
    carrier info, and delivery status indicators.
  </p>
</div>

