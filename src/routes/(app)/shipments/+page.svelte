<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import {
    IconTruck,
    IconPackage,
    IconTrophy,
    IconExternalLink,
    IconFilter,
    IconClipboardCheck,
    IconLoader,
    IconCircleCheck,
    IconBox,
  } from "@tabler/icons-svelte";

  // State
  let isLoading = $state(true);
  let statusFilter = $state<string>("all");

  // Status configuration
  const statusConfig: Record<
    string,
    { label: string; icon: typeof IconTruck }
  > = {
    pending: {
      label: "Pending",
      icon: IconLoader,
    },
    processing: {
      label: "Processing",
      icon: IconClipboardCheck,
    },
    shipped: {
      label: "Shipped",
      icon: IconTruck,
    },
    delivered: {
      label: "Delivered",
      icon: IconCircleCheck,
    },
  };

  // Mock shipments data
  const allShipments = $state([
    {
      id: "SHP-2024-001",
      cardName: "Charizard VMAX",
      cardTier: "Ultra Chase",
      cardValue: "$425.00",
      status: "shipped",
      requestDate: "Dec 15, 2025",
      trackingNumber: "1Z999AA10123456784",
      carrier: "UPS",
      estimatedDelivery: "Dec 23, 2025",
    },
    {
      id: "SHP-2024-002",
      cardName: "Black Lotus (NM)",
      cardTier: "Chase",
      cardValue: "$289.00",
      status: "processing",
      requestDate: "Dec 18, 2025",
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
    },
    {
      id: "SHP-2024-003",
      cardName: "Pikachu Illustrator",
      cardTier: "Ultra Chase",
      cardValue: "$500.00",
      status: "pending",
      requestDate: "Dec 20, 2025",
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
    },
    {
      id: "SHP-2024-004",
      cardName: "Mewtwo GX",
      cardTier: "Rare",
      cardValue: "$45.00",
      status: "delivered",
      requestDate: "Dec 5, 2025",
      trackingNumber: "1Z999AA10123456780",
      carrier: "UPS",
      estimatedDelivery: "Dec 12, 2025",
    },
    {
      id: "SHP-2024-005",
      cardName: "Liliana of the Veil",
      cardTier: "Chase",
      cardValue: "$156.00",
      status: "delivered",
      requestDate: "Dec 1, 2025",
      trackingNumber: "9400111899223033034400",
      carrier: "USPS",
      estimatedDelivery: "Dec 8, 2025",
    },
  ]);

  // Filtered shipments
  const filteredShipments = $derived(
    statusFilter === "all"
      ? allShipments
      : allShipments.filter((s) => s.status === statusFilter)
  );

  // Simulate loading
  $effect(() => {
    const timer = setTimeout(() => {
      isLoading = false;
    }, 700);
    return () => clearTimeout(timer);
  });

  function getTrackingUrl(carrier: string | null, trackingNumber: string | null): string | null {
    if (!carrier || !trackingNumber) return null;

    const urls: Record<string, string> = {
      UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    };

    return urls[carrier] || null;
  }
</script>

<div class="space-y-6 max-w-4xl">
  <!-- Filter -->
  <div class="flex items-center gap-2">
    <IconFilter size={18} class="text-muted-foreground" />
    <Select.Root
      type="single"
      value={statusFilter}
      onValueChange={(v) => (statusFilter = v ?? "all")}
    >
      <Select.Trigger class="w-[160px]">
        {statusFilter === "all"
          ? "All Statuses"
          : statusConfig[statusFilter]?.label || statusFilter}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">All Statuses</Select.Item>
        <Select.Item value="pending">Pending</Select.Item>
        <Select.Item value="processing">Processing</Select.Item>
        <Select.Item value="shipped">Shipped</Select.Item>
        <Select.Item value="delivered">Delivered</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <!-- Stats Summary -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {#each Object.entries(statusConfig) as [status, config]}
      {@const count = allShipments.filter((s) => s.status === status).length}
      <Card.Root
        class="cursor-pointer transition-all hover:shadow-md {statusFilter === status ? 'ring-2 ring-primary' : ''}"
        onclick={() => (statusFilter = statusFilter === status ? "all" : status)}
      >
        <Card.Content class="p-4 flex items-center gap-3">
          <div class="p-2 rounded-full bg-muted">
            <config.icon size={18} class="text-foreground" />
          </div>
          <div>
            <p class="text-2xl font-bold">{count}</p>
            <p class="text-xs text-muted-foreground">{config.label}</p>
          </div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>

  <!-- Shipments List -->
  {#if isLoading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <Card.Root>
          <Card.Content class="p-6">
            <div class="flex gap-4">
              <Skeleton class="h-20 w-20 rounded-lg" />
              <div class="flex-1 space-y-3">
                <Skeleton class="h-5 w-48" />
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-4 w-64" />
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {:else if filteredShipments.length === 0}
    <Empty.Root class="py-16 border rounded-xl">
      <Empty.Header>
        <Empty.Media variant="icon" class="size-16 rounded-full">
          <IconBox size={32} />
        </Empty.Media>
        <Empty.Title>No Shipments Found</Empty.Title>
        <Empty.Description>
          {#if statusFilter !== "all"}
            No shipments with "{statusConfig[statusFilter]?.label}" status.
            Try selecting a different filter.
          {:else}
            You haven't requested any card shipments yet.
            Pull some valuable cards and request shipping from your inventory!
          {/if}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <div class="flex gap-3">
          {#if statusFilter !== "all"}
            <Button variant="outline" onclick={() => (statusFilter = "all")}>
              Clear Filter
            </Button>
          {/if}
          <Button href="/inventory">
            <IconTrophy size={18} class="mr-2" />
            View Inventory
          </Button>
        </div>
      </Empty.Content>
    </Empty.Root>
  {:else}
    <div class="space-y-4">
      {#each filteredShipments as shipment (shipment.id)}
        {@const config = statusConfig[shipment.status]}
        {@const trackingUrl = getTrackingUrl(shipment.carrier, shipment.trackingNumber)}

        <Card.Root class="overflow-hidden transition-all hover:shadow-md">
          <Card.Content class="p-6">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Card Preview -->
              <div class="w-full sm:w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <IconTrophy size={40} class="text-muted-foreground" />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-start gap-2 mb-2">
                  <h3 class="font-semibold text-lg">{shipment.cardName}</h3>
                  <Badge variant="secondary">
                    {shipment.cardTier}
                  </Badge>
                  <Badge variant="outline">
                    <config.icon size={14} class="mr-1" />
                    {config.label}
                  </Badge>
                </div>

                <div class="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  <div class="flex justify-between sm:block">
                    <span class="text-muted-foreground">Value:</span>
                    <span class="font-medium">{shipment.cardValue}</span>
                  </div>
                  <div class="flex justify-between sm:block">
                    <span class="text-muted-foreground">Requested:</span>
                    <span class="font-medium">{shipment.requestDate}</span>
                  </div>

                  {#if shipment.trackingNumber}
                    <div class="flex justify-between sm:block">
                      <span class="text-muted-foreground">Carrier:</span>
                      <span class="font-medium">{shipment.carrier}</span>
                    </div>
                    <div class="flex justify-between sm:block">
                      <span class="text-muted-foreground">Est. Delivery:</span>
                      <span class="font-medium">{shipment.estimatedDelivery}</span>
                    </div>
                  {/if}
                </div>

                {#if shipment.trackingNumber}
                  <div class="mt-4 flex flex-col sm:flex-row gap-2">
                    <div class="flex-1 p-2 bg-muted rounded-md font-mono text-sm truncate">
                      {shipment.trackingNumber}
                    </div>
                    {#if trackingUrl}
                      <Button variant="outline" size="sm" href={trackingUrl} target="_blank">
                        <IconExternalLink size={16} class="mr-1" />
                        Track
                      </Button>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}

  <!-- Info Card -->
  <Card.Root class="bg-muted/50">
    <Card.Header>
      <Card.Title class="flex items-center gap-2 text-base">
        <IconPackage size={18} />
        About Shipments
      </Card.Title>
    </Card.Header>
    <Card.Content class="text-sm text-muted-foreground space-y-2">
      <p>
        <strong class="text-foreground">Pending:</strong> Your shipment request has been received and is
        awaiting processing.
      </p>
      <p>
        <strong class="text-foreground">Processing:</strong> We're preparing your card for shipment.
        This typically takes 1-3 business days.
      </p>
      <p>
        <strong class="text-foreground">Shipped:</strong> Your card is on its way! Use the tracking
        number to monitor delivery progress.
      </p>
      <p>
        <strong class="text-foreground">Delivered:</strong> Your card has been delivered. Enjoy your
        pull!
      </p>
    </Card.Content>
  </Card.Root>
</div>
