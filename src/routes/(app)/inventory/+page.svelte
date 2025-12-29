<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { toast } from "svelte-sonner";
  import {
    IconCoin,
    IconLoader2,
    IconTrophy,
    IconSparkles,
    IconCards,
  } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import { invalidateAll } from "$app/navigation";

  let { data } = $props();

  let cards = $state<any[]>([]);
  let loading = $state(true);
  let stats = $state<any>(null);
  let sellingCardId = $state<string | null>(null);

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

  onMount(() => {
    loadInventory();
  });
</script>

<div class="max-w-7xl space-y-6">
  <!-- Stats -->
  {#if stats}
    <div class="grid md:grid-cols-2 gap-4">
      <Card.Root>
        <Card.Content class="p-4">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-full bg-muted">
              <IconTrophy size={24} class="text-foreground" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Cards</p>
              <p class="text-2xl font-bold">{stats.total_cards}</p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Content class="p-4">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-full bg-muted">
              <IconCoin size={24} class="text-foreground" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Collection Value</p>
              <p class="text-2xl font-bold">${stats.total_value_usd}</p>
            </div>
          </div>
      </Card.Content>
    </Card.Root>
    </div>
  {/if}

  <!-- Tier Breakdown -->
  {#if stats && Object.keys(stats.tier_breakdown).length > 0}
    <Card.Root>
      <Card.Header>
        <Card.Title>Cards by Tier</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-wrap gap-3">
          {#each Object.entries(stats.tier_breakdown) as [tierName, count]}
            <Badge variant="secondary">
              {tierName}: {count}
            </Badge>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  {/if}

  <!-- Cards Grid -->
  {#if loading}
    <div class="grid grid-cols-5 gap-4">
      {#each Array(8) as _}
        <Card.Root>
          <Card.Header>
            <Skeleton class="h-5 w-20 mb-3" />
            <Skeleton class="w-full aspect-square rounded-lg" />
            <Skeleton class="h-6 w-24 mt-4" />
            <Skeleton class="h-4 w-32 mt-2" />
            <Skeleton class="h-3 w-28 mt-2" />
          </Card.Header>
          <Card.Footer class="flex-col gap-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-9 w-full" />
          </Card.Footer>
        </Card.Root>
      {/each}
    </div>
  {:else if cards.length === 0}
    <Empty.Root class="py-16 border rounded-xl">
      <Empty.Header>
        <Empty.Media variant="icon" class="size-16 rounded-full">
          <IconCards size={32} />
        </Empty.Media>
        <Empty.Title>No Cards Yet</Empty.Title>
        <Empty.Description>
          Open some packs to start building your collection!
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button href="/packs">
          <IconSparkles class="mr-2" size={18} />
          Open Packs
        </Button>
      </Empty.Content>
    </Empty.Root>
  {:else}
    <div class="grid grid-cols-5 gap-4">
      {#each cards as card (card.id)}
        {@const isSelling = sellingCardId === card.id}
        {@const sellbackRips = (card.card_value_cents * 0.85 / 100).toFixed(2)}

        <Card.Root class="relative overflow-hidden">
          <Card.Header class="relative z-10">
            <Badge class="mb-3 w-fit" variant="secondary">
              {card.tier_name}
            </Badge>

            <div class="mb-4">
              {#if card.card_image_url}
                <img
                  src={card.card_image_url}
                  alt={card.card_name || "Card"}
                  class="w-full aspect-square rounded-lg object-cover"
                />
              {:else}
                <div class="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <IconTrophy size={64} class="text-muted-foreground" />
                </div>
              {/if}
            </div>

            <Card.Title class="text-lg">
              ${(card.card_value_cents / 100).toFixed(2)}
            </Card.Title>

            {#if card.card_name}
              <Card.Description class="text-sm">
                {card.card_name}
              </Card.Description>
            {/if}

            <p class="text-xs text-muted-foreground mt-2">
              Pulled {new Date(card.created_at).toLocaleDateString()}
            </p>
          </Card.Header>

          <Card.Footer class="relative z-10 flex-col gap-2">
            <div class="w-full text-sm text-muted-foreground text-center">
              Sell for <span class="font-bold text-primary"
                >{sellbackRips} Rips</span
              > (85%)
            </div>
            <Button
              class="w-full"
              variant="outline"
              onclick={() => sellCard(card.id)}
              disabled={isSelling}
            >
              {#if isSelling}
                <IconLoader2 class="mr-2 animate-spin" size={16} />
                Selling...
              {:else}
                Sell Card
              {/if}
            </Button>
          </Card.Footer>
        </Card.Root>
      {/each}
    </div>
  {/if}

  <!-- Info Section -->
  <Card.Root class="bg-muted/50">
    <Card.Header>
      <Card.Title>About Sell-Back</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-3 text-sm text-muted-foreground">
      <p>
        You can sell any card back to the system for 85% of its value in Rips.
      </p>
      <p>
        Use the Rips to open more packs and try your luck at pulling even
        rarer cards!
      </p>
      <p class="text-destructive">
        <strong>Warning:</strong> Selling a card is permanent and cannot be undone.
      </p>
    </Card.Content>
  </Card.Root>
</div>
