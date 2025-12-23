<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    IconTruck,
    IconMapPin,
    IconCheck,
    IconExternalLink,
    IconTrophy,
  } from "@tabler/icons-svelte";
  import type { Shipment } from "./types";
  import { SHIPMENT_STATUS_CONFIG, getTrackingUrl } from "./types";
  import ShipmentProgress from "./shipment-progress.svelte";

  interface Props {
    shipment: Shipment;
  }

  let { shipment }: Props = $props();

  const config = $derived(SHIPMENT_STATUS_CONFIG[shipment.status]);
  const trackingUrl = $derived(getTrackingUrl(shipment.carrier, shipment.trackingNumber));
  const isDelivered = $derived(shipment.status === "delivered");
  const isInProgress = $derived(shipment.status !== "delivered");
</script>

<div class="p-1.5 space-y-2 bg-muted/50 border border-border rounded-2xl">
  <!-- Header -->
  <div class="py-3 px-4 sm:px-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5">
      <div>
        <h4 class="mb-1 text-xs text-muted-foreground">
          Status
        </h4>
        <p class="flex items-center font-medium text-[13px] text-foreground">
          {#if isInProgress}
            <span class="me-1.5 shrink-0 size-2 inline-block bg-green-500 rounded-full"></span>
            Shipment in progress
          {:else}
            <IconCheck size={16} class="shrink-0 me-1.5" />
            Delivered
          {/if}
        </p>
      </div>

      <div>
        <h4 class="mb-1 text-xs text-muted-foreground">
          Shipment ID
        </h4>
        <p class="font-medium text-[13px] text-foreground">
          {shipment.id}
        </p>
      </div>

      <div>
        <h4 class="mb-1 text-xs text-muted-foreground">
          Request date
        </h4>
        <p class="font-medium text-[13px] text-foreground">
          {shipment.requestDate}
        </p>
      </div>

      <div>
        <h4 class="mb-1 text-xs text-muted-foreground">
          Value
        </h4>
        <p class="font-medium text-[13px] text-foreground">
          {shipment.cardValue}
        </p>
      </div>
    </div>
  </div>

  <!-- Inner Card -->
  <div class="p-4 sm:p-6 bg-background rounded-xl shadow-sm">
    <!-- Delivery Info Section -->
    <div class="pb-6 mb-6 border-b border-border">
      <div class="flex flex-wrap items-center gap-3">
        <div class="grow space-y-1">
          <div class="flex items-center gap-x-3">
            <IconTruck size={16} class="shrink-0 text-muted-foreground" />
            <div class="grow">
              <span class="text-sm text-muted-foreground">
                {#if isDelivered}
                  Delivered: <span class="font-semibold text-foreground">{shipment.deliveredDate || shipment.estimatedDelivery}</span>
                {:else if shipment.estimatedDelivery}
                  Estimated delivery: <span class="font-semibold text-foreground">{shipment.estimatedDelivery}</span>
                {:else}
                  Processing - tracking info coming soon
                {/if}
              </span>
            </div>
          </div>

          {#if shipment.shippingAddress}
            <div class="flex items-center gap-x-3">
              <IconMapPin size={16} class="shrink-0 text-muted-foreground" />
              <div class="grow">
                <span class="text-sm text-muted-foreground">
                  {shipment.shippingAddress}
                </span>
              </div>
            </div>
          {/if}
        </div>

        <div class="flex gap-2">
          {#if trackingUrl}
            <Button variant="outline" size="sm" href={trackingUrl} target="_blank">
              <IconExternalLink size={16} class="mr-1" />
              Track shipment
            </Button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Progress Section (only show if not delivered) -->
    {#if isInProgress}
      <div class="pb-6 mb-6 border-b border-border">
        <ShipmentProgress status={shipment.status} />
      </div>
    {/if}

    <!-- Card Item -->
    <div class="relative flex flex-row gap-5">
      <div class="relative shrink-0 w-24 sm:w-32">
        {#if shipment.cardImage}
          <img 
            class="shrink-0 w-full h-40 object-cover bg-muted rounded-xl" 
            src={shipment.cardImage} 
            alt={shipment.cardName}
          />
        {:else}
          <div class="shrink-0 w-full h-40 bg-muted rounded-xl flex items-center justify-center">
            <IconTrophy size={40} class="text-muted-foreground" />
          </div>
        {/if}
      </div>

      <div class="grow">
        <div class="mb-3 sm:flex sm:gap-3">
          <div class="grow">
            <h4 class="text-foreground font-medium">
              {shipment.cardName}
            </h4>
            <div class="mt-1 flex items-center gap-2">
              <Badge variant="secondary">
                {shipment.cardTier}
              </Badge>
              <span class="text-sm text-foreground font-medium">{shipment.cardValue}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap sm:grid grid-cols-3 gap-3">
          {#if shipment.carrier}
            <div>
              <h4 class="mb-1.5 text-sm text-muted-foreground">
                Carrier
              </h4>
              <p class="text-sm text-foreground">
                {shipment.carrier}
              </p>
            </div>
          {/if}

          {#if shipment.trackingNumber}
            <div class="col-span-2">
              <h4 class="mb-1.5 text-sm text-muted-foreground">
                Tracking number
              </h4>
              <p class="text-sm text-foreground font-mono truncate">
                {shipment.trackingNumber}
              </p>
            </div>
          {/if}
        </div>

        {#if isDelivered}
          <div class="mt-5 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" href="/inventory">
              View in inventory
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

