<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Button } from "$lib/components/ui/button";
  import { IconBox, IconTrophy } from "@tabler/icons-svelte";
  import {
    ShipmentsHeader,
    ShipmentCard,
    type Shipment,
  } from "$lib/components/shipments";

  // State
  let isLoading = $state(true);
  let selectedYear = $state("2025");
  let activeTab = $state("all");

  // Mock shipments data
  const allShipments = $state<Shipment[]>([
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
      shippingAddress: "280 Suzanne Throughway, New York, NY 10001, US",
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
      shippingAddress: "280 Suzanne Throughway, New York, NY 10001, US",
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
      shippingAddress: "280 Suzanne Throughway, New York, NY 10001, US",
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
      deliveredDate: "Dec 12, 2025",
      shippingAddress: "280 Suzanne Throughway, New York, NY 10001, US",
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
      deliveredDate: "Dec 8, 2025",
      shippingAddress: "280 Suzanne Throughway, New York, NY 10001, US",
    },
  ]);

  // Filtered shipments based on tab
  const filteredShipments = $derived(() => {
    switch (activeTab) {
      case "in-progress":
        return allShipments.filter((s) => s.status !== "delivered");
      case "delivered":
        return allShipments.filter((s) => s.status === "delivered");
      default:
        return allShipments;
    }
  });

  const inProgressCount = $derived(
    allShipments.filter((s) => s.status !== "delivered").length
  );
  const deliveredCount = $derived(
    allShipments.filter((s) => s.status === "delivered").length
  );

  // Simulate loading
  $effect(() => {
    const timer = setTimeout(() => {
      isLoading = false;
    }, 700);
    return () => clearTimeout(timer);
  });
</script>

<div class="lg:pt-4 space-y-5">
  <!-- Tabs -->
  <Tabs.Root bind:value={activeTab} class="w-full">
    <div class="border-b border-border -mx-2">
      <Tabs.List class="bg-transparent h-auto p-0 gap-1">
        <Tabs.Trigger
          value="all"
          class="relative px-3 py-2 mb-0 rounded-lg border-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:bg-muted data-[state=active]:text-foreground text-muted-foreground data-[state=active]:after:absolute data-[state=active]:after:-bottom-px data-[state=active]:after:inset-x-3 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground"
        >
          All shipments
        </Tabs.Trigger>
        <Tabs.Trigger
          value="in-progress"
          class="relative px-3 py-2 mb-0 rounded-lg border-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:bg-muted data-[state=active]:text-foreground text-muted-foreground data-[state=active]:after:absolute data-[state=active]:after:-bottom-px data-[state=active]:after:inset-x-3 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground"
        >
          In progress
          {#if inProgressCount > 0}
            <span class="ml-1 text-xs text-muted-foreground"
              >({inProgressCount})</span
            >
          {/if}
        </Tabs.Trigger>
        <Tabs.Trigger
          value="delivered"
          class="relative px-3 py-2 mb-0 rounded-lg border-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:bg-muted data-[state=active]:text-foreground text-muted-foreground data-[state=active]:after:absolute data-[state=active]:after:-bottom-px data-[state=active]:after:inset-x-3 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground"
        >
          Delivered
          {#if deliveredCount > 0}
            <span class="ml-1 text-xs text-muted-foreground"
              >({deliveredCount})</span
            >
          {/if}
        </Tabs.Trigger>
      </Tabs.List>
    </div>

    <!-- All Shipments Tab -->
    <Tabs.Content value="all" class="mt-0">
      <div class="py-6">
        {#if isLoading}
          <div class="space-y-5">
            {#each Array(2) as _}
              <div
                class="p-1.5 space-y-2 bg-muted/50 border border-border rounded-2xl"
              >
                <div class="py-3 px-4 sm:px-6">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
                    {#each Array(4) as __}
                      <div>
                        <Skeleton class="h-3 w-16 mb-2" />
                        <Skeleton class="h-4 w-24" />
                      </div>
                    {/each}
                  </div>
                </div>
                <div class="p-4 sm:p-6 bg-background rounded-xl">
                  <div class="flex gap-5">
                    <Skeleton class="h-40 w-24 sm:w-32 rounded-xl" />
                    <div class="flex-1 space-y-3">
                      <Skeleton class="h-5 w-48" />
                      <Skeleton class="h-4 w-32" />
                      <Skeleton class="h-4 w-64" />
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else if filteredShipments().length === 0}
          <Empty.Root class="py-16 border rounded-xl">
            <Empty.Header>
              <Empty.Media variant="icon" class="size-16 rounded-full">
                <IconBox size={32} />
              </Empty.Media>
              <Empty.Title>No shipments found</Empty.Title>
              <Empty.Description>
                You haven't requested any card shipments yet. Pull some valuable
                cards and request shipping from your inventory!
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button href="/inventory">
                <IconTrophy size={18} class="mr-2" />
                View Inventory
              </Button>
            </Empty.Content>
          </Empty.Root>
        {:else}
          <div class="space-y-5 sm:space-y-8">
            {#each filteredShipments() as shipment (shipment.id)}
              <ShipmentCard {shipment} />
            {/each}
          </div>
        {/if}
      </div>
    </Tabs.Content>

    <!-- In Progress Tab -->
    <Tabs.Content value="in-progress" class="mt-0">
      <div class="py-6">
        {#if isLoading}
          <div class="space-y-5">
            {#each Array(2) as _}
              <div
                class="p-1.5 space-y-2 bg-muted/50 border border-border rounded-2xl"
              >
                <div class="py-3 px-4 sm:px-6">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
                    {#each Array(4) as __}
                      <div>
                        <Skeleton class="h-3 w-16 mb-2" />
                        <Skeleton class="h-4 w-24" />
                      </div>
                    {/each}
                  </div>
                </div>
                <div class="p-4 sm:p-6 bg-background rounded-xl">
                  <div class="flex gap-5">
                    <Skeleton class="h-40 w-24 sm:w-32 rounded-xl" />
                    <div class="flex-1 space-y-3">
                      <Skeleton class="h-5 w-48" />
                      <Skeleton class="h-4 w-32" />
                      <Skeleton class="h-4 w-64" />
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else if filteredShipments().length === 0}
          <p class="text-sm text-muted-foreground">
            Looking for a shipment? You don't have any in-progress shipments.
          </p>
        {:else}
          <div class="space-y-5 sm:space-y-8">
            {#each filteredShipments() as shipment (shipment.id)}
              <ShipmentCard {shipment} />
            {/each}
          </div>
        {/if}
      </div>
    </Tabs.Content>

    <!-- Delivered Tab -->
    <Tabs.Content value="delivered" class="mt-0">
      <div class="py-6">
        {#if isLoading}
          <div class="space-y-5">
            {#each Array(2) as _}
              <div
                class="p-1.5 space-y-2 bg-muted/50 border border-border rounded-2xl"
              >
                <div class="py-3 px-4 sm:px-6">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
                    {#each Array(4) as __}
                      <div>
                        <Skeleton class="h-3 w-16 mb-2" />
                        <Skeleton class="h-4 w-24" />
                      </div>
                    {/each}
                  </div>
                </div>
                <div class="p-4 sm:p-6 bg-background rounded-xl">
                  <div class="flex gap-5">
                    <Skeleton class="h-40 w-24 sm:w-32 rounded-xl" />
                    <div class="flex-1 space-y-3">
                      <Skeleton class="h-5 w-48" />
                      <Skeleton class="h-4 w-32" />
                      <Skeleton class="h-4 w-64" />
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else if filteredShipments().length === 0}
          <p class="text-sm text-muted-foreground">
            Looking for a shipment? You don't have any delivered shipments.
          </p>
        {:else}
          <div class="space-y-5 sm:space-y-8">
            {#each filteredShipments() as shipment (shipment.id)}
              <ShipmentCard {shipment} />
            {/each}
          </div>
        {/if}
      </div>
    </Tabs.Content>
  </Tabs.Root>
</div>
