<script lang="ts">
  /**
   * Admin Fulfillment — `/admin/fulfillment`
   * 
   * PURPOSE: Manage physical card shipments
   * 
   * ACCESS: Restricted to admin users only
   * 
   * FEATURES:
   * - View all shipment requests:
   *   - User info
   *   - Card details
   *   - Shipping address
   *   - Request date
   *   - Current status
   * - Filter by status (pending, processing, shipped, delivered)
   * - Update status:
   *   - Mark as processing
   *   - Mark as shipped
   *   - Mark as delivered
   * - Add tracking numbers
   * - Add carrier information
   * - Bulk status updates
   * - Print shipping labels (integration)
   * 
   * WORKFLOW:
   * 1. New request appears as "pending"
   * 2. Admin marks "processing" when picking card
   * 3. Admin adds tracking # and marks "shipped"
   * 4. System or admin marks "delivered"
   */
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold">Fulfillment Management</h1>
  <p class="text-muted-foreground mt-2">
    View shipment requests, update status, add tracking numbers,
    and manage the physical card fulfillment pipeline.
  </p>
</div>

