<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Badge } from "$lib/components/ui/badge";
  import ShipmentFilters from "$lib/components/admin/fulfillment/shipment-filters.svelte";
  import ShipmentTable from "$lib/components/admin/fulfillment/shipment-table.svelte";
  import UpdateStatusDialog from "$lib/components/admin/fulfillment/update-status-dialog.svelte";
  import type { AdminShipment, ShipmentStatus } from "$lib/components/shipments/types";
  import type { PageData } from "./$types";

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
   * - Filter by status (pending, processing, shipped, delivered, cancelled)
   * - Update status:
   *   - Mark as processing
   *   - Mark as shipped
   *   - Mark as delivered
   * - Add tracking numbers
   * - Add carrier information
   * - Admin notes
   * 
   * WORKFLOW:
   * 1. New request appears as "pending"
   * 2. Admin marks "processing" when picking card
   * 3. Admin adds tracking # and marks "shipped"
   * 4. System or admin marks "delivered"
   */

  let { data }: { data: PageData } = $props();

  let shipments = $state<AdminShipment[]>([]);
  let isLoading = $state(false);
  let selectedShipment = $state<AdminShipment | null>(null);
  let showUpdateDialog = $state(false);

  // Initialize from server data
  $effect(() => {
    if (data?.shipments) {
      shipments = data.shipments;
    }
  });

  // Filter state from URL params
  const statusFilter = $derived(
    ($page.url.searchParams.get("status") as ShipmentStatus | "all") || "all"
  );
  const searchQuery = $derived($page.url.searchParams.get("search") || "");

  // Calculate stats
  const stats = $derived(() => {
    const all = shipments.length;
    const pending = shipments.filter((s) => s.status === "pending").length;
    const processing = shipments.filter((s) => s.status === "processing").length;
    const shipped = shipments.filter((s) => s.status === "shipped").length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const cancelled = shipments.filter((s) => s.status === "cancelled").length;

    return { all, pending, processing, shipped, delivered, cancelled };
  });

  async function loadShipments() {
    try {
      isLoading = true;
      const params = new URLSearchParams($page.url.searchParams);
      
      const response = await fetch(`/api/admin/shipments?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch shipments");
      }

      const result = await response.json();
      shipments = result.shipments || [];
    } catch (error) {
      console.error("Error loading shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      isLoading = false;
    }
  }

  function handleStatusChange(status: ShipmentStatus | "all") {
    const params = new URLSearchParams($page.url.searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1"); // Reset to first page
    goto(`?${params.toString()}`);
    loadShipments();
  }

  function handleSearchChange(query: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (query.trim()) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page
    goto(`?${params.toString()}`);
    loadShipments();
  }

  function handleClearFilters() {
    goto("?");
    loadShipments();
  }

  function handleUpdate(shipment: AdminShipment) {
    selectedShipment = shipment;
    showUpdateDialog = true;
  }

  function handleUpdateComplete() {
    showUpdateDialog = false;
    selectedShipment = null;
    loadShipments();
  }

  // Initialize from server data
  $effect(() => {
    if (data?.shipments) {
      shipments = data.shipments;
    }
  });

  onMount(() => {
    // Always load shipments on mount to ensure we have fresh data
    loadShipments();
  });
</script>

<div class="container mx-auto px-4 py-8 space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-4xl font-bold">Fulfillment Management</h1>
    <p class="text-muted-foreground mt-2">
      View shipment requests, update status, add tracking numbers,
      and manage the physical card fulfillment pipeline.
    </p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
    <div class="p-4 border rounded-lg">
      <p class="text-sm text-muted-foreground">Total</p>
      <p class="text-2xl font-bold">{stats().all}</p>
    </div>
    <div class="p-4 border rounded-lg">
      <p class="text-sm text-muted-foreground">Pending</p>
      <p class="text-2xl font-bold">{stats().pending}</p>
    </div>
    <div class="p-4 border rounded-lg">
      <p class="text-sm text-muted-foreground">Processing</p>
      <p class="text-2xl font-bold">{stats().processing}</p>
    </div>
    <div class="p-4 border rounded-lg">
      <p class="text-sm text-muted-foreground">Shipped</p>
      <p class="text-2xl font-bold">{stats().shipped}</p>
    </div>
    <div class="p-4 border rounded-lg">
      <p class="text-sm text-muted-foreground">Delivered</p>
      <p class="text-2xl font-bold">{stats().delivered}</p>
    </div>
    <div class="p-4 border rounded-lg">
      <p class="text-sm text-muted-foreground">Cancelled</p>
      <p class="text-2xl font-bold">{stats().cancelled}</p>
    </div>
  </div>

  <!-- Filters -->
  <ShipmentFilters
    statusFilter={statusFilter}
    searchQuery={searchQuery}
    onStatusChange={handleStatusChange}
    onSearchChange={handleSearchChange}
    onClear={handleClearFilters}
  />

  <!-- Table -->
  {#if isLoading}
    <div class="space-y-4">
      {#each Array(5) as _}
        <Skeleton class="h-20 w-full" />
      {/each}
    </div>
  {:else if shipments.length === 0}
    <div class="border rounded-lg p-12 text-center">
      <p class="text-muted-foreground">No shipments found.</p>
      {#if statusFilter !== "all" || searchQuery}
        <Button variant="outline" onclick={handleClearFilters} class="mt-4">
          Clear Filters
        </Button>
      {/if}
    </div>
  {:else}
    <ShipmentTable shipments={shipments} onUpdate={handleUpdate} />
  {/if}

  <!-- Pagination -->
  {#if data.hasMore || data.page > 1}
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Page {data.page} of {Math.ceil(data.total / data.limit)}
      </p>
      <div class="flex gap-2">
        {#if data.page > 1}
          <Button
            variant="outline"
            onclick={() => {
              const params = new URLSearchParams($page.url.searchParams);
              params.set("page", String(data.page - 1));
              goto(`?${params.toString()}`);
              loadShipments();
            }}
          >
            Previous
          </Button>
        {/if}
        {#if data.hasMore}
          <Button
            variant="outline"
            onclick={() => {
              const params = new URLSearchParams($page.url.searchParams);
              params.set("page", String(data.page + 1));
              goto(`?${params.toString()}`);
              loadShipments();
            }}
          >
            Next
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Update Dialog -->
<UpdateStatusDialog
  bind:open={showUpdateDialog}
  shipment={selectedShipment}
  onUpdate={handleUpdateComplete}
  onClose={() => {
    showUpdateDialog = false;
    selectedShipment = null;
  }}
/>

