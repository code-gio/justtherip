<script lang="ts">
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import {
    InventoryStats,
    InventoryTierBreakdown,
    InventoryGrid,
    SellBackInfo,
  } from "$lib/components/inventory";

  let { data } = $props();

  let cards = $state<any[]>([]);
  let loading = $state(true);
  let stats = $state<any>(null);
  let sellingCardId = $state<string | null>(null);
  let shippingCardId = $state<string | null>(null);

  async function loadInventory() {
    try {
      loading = true;
      const response = await fetch("/api/inventory");

      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }

      const result = await response.json();
      cards = result.cards || [];
      stats = result.stats || null;
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      loading = false;
    }
  }

  async function sellCard(cardId: string) {
    try {
      sellingCardId = cardId;

      const response = await fetch("/api/inventory/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ card_id: cardId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sell card");
      }

      const result = await response.json();

      toast.success(
        `Sold for ${result.rips_credited.toFixed(2)} Rips!`
      );

      await loadInventory();
      await invalidateAll();
    } catch (error) {
      console.error("Error selling card:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to sell card"
      );
    } finally {
      sellingCardId = null;
    }
  }

  async function shipCard(cardId: string) {
    try {
      shippingCardId = cardId;

      const response = await fetch("/api/inventory/ship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ card_id: cardId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to ship card");
      }

      const result = await response.json();

      toast.success("Shipment request created successfully!");

      await loadInventory();
      await invalidateAll();
    } catch (error) {
      console.error("Error shipping card:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to ship card"
      );
    } finally {
      shippingCardId = null;
    }
  }

  onMount(() => {
    loadInventory();
  });
</script>

<div class="max-w-7xl space-y-6">
  <InventoryStats {stats} />
  <InventoryTierBreakdown tierBreakdown={stats?.tier_breakdown} />
  <InventoryGrid
    {cards}
    {loading}
    {sellingCardId}
    shippingCardId={shippingCardId}
    onSell={sellCard}
    onShip={shipCard}
  />
  <SellBackInfo />
</div>
