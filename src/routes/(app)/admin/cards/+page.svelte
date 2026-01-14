<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import type { PageData } from "./$types";
  import {
    IconSearch,
    IconCards,
    IconFilter,
    IconRefresh,
  } from "@tabler/icons-svelte";

  let { data }: { data: PageData } = $props();

  let cards = $state(data.cards || []);

  const gameFilter = $derived(
    ($page.url.searchParams.get("game") as string) || "all"
  );
  const searchQuery = $derived($page.url.searchParams.get("search") || "");
  const setFilter = $derived($page.url.searchParams.get("set") || "");
  const rarityFilter = $derived($page.url.searchParams.get("rarity") || "");

  // Update cards when data changes
  $effect(() => {
    cards = data.cards || [];
  });

  function handleGameChange(game: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (game === "all") {
      params.delete("game");
    } else {
      params.set("game", game);
    }
    params.set("page", "1");
    goto(`?${params.toString()}`);
  }

  function handleSearchChange(query: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (query.trim()) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    goto(`?${params.toString()}`);
  }

  function handleSetChange(set: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (set) {
      params.set("set", set);
    } else {
      params.delete("set");
    }
    params.set("page", "1");
    goto(`?${params.toString()}`);
  }

  function handleRarityChange(rarity: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (rarity) {
      params.set("rarity", rarity);
    } else {
      params.delete("rarity");
    }
    params.set("page", "1");
    goto(`?${params.toString()}`);
  }

  function formatCurrency(cents: number | null): string {
    if (cents === null) return "N/A";
    return `$${(cents / 100).toFixed(2)}`;
  }

  function getGameBadgeColor(game: string): string {
    switch (game) {
      case "mtg":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "pokemon":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "yugioh":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "bg-muted";
    }
  }

</script>

<div class="container mx-auto px-4 py-8 space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-4xl font-bold">Card Catalog</h1>
    <p class="text-muted-foreground mt-2">
      View and manage card database, search by name, set, or rarity.
    </p>
  </div>

  <!-- Filters -->
  <Card.Root>
    <Card.Content class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <div class="relative">
            <IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by card name..."
              value={searchQuery}
              oninput={(e) => handleSearchChange(e.currentTarget.value)}
              class="pl-10"
            />
          </div>
        </div>

        <!-- Game Filter -->
        <Select.Root
          selected={{
            value: gameFilter,
            label:
              gameFilter === "all"
                ? "All Games"
                : gameFilter.charAt(0).toUpperCase() + gameFilter.slice(1),
          }}
          onSelectedChange={(selected) => {
            if (selected) handleGameChange(selected.value);
          }}
        >
          <Select.Trigger>
            <Select.Value placeholder="Game" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All Games</Select.Item>
            <Select.Item value="mtg">Magic: The Gathering</Select.Item>
            <Select.Item value="pokemon">Pokemon</Select.Item>
            <Select.Item value="yugioh">Yu-Gi-Oh!</Select.Item>
          </Select.Content>
        </Select.Root>

        <!-- Set Filter -->
        <Select.Root
          selected={
            setFilter
              ? { value: setFilter, label: setFilter }
              : { value: "", label: "All Sets" }
          }
          onSelectedChange={(selected) => {
            if (selected) handleSetChange(selected.value);
          }}
        >
          <Select.Trigger>
            <Select.Value placeholder="Set" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">All Sets</Select.Item>
            {#each data.filters.sets as set}
              <Select.Item value={set}>{set}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <!-- Rarity Filter -->
        <Select.Root
          selected={
            rarityFilter
              ? { value: rarityFilter, label: rarityFilter }
              : { value: "", label: "All Rarities" }
          }
          onSelectedChange={(selected) => {
            if (selected) handleRarityChange(selected.value);
          }}
        >
          <Select.Trigger>
            <Select.Value placeholder="Rarity" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">All Rarities</Select.Item>
            {#each data.filters.rarities as rarity}
              <Select.Item value={rarity}>{rarity}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Cards Grid -->
  {#if cards.length === 0}
    <Card.Root>
      <Card.Content class="p-12 text-center">
        <IconCards class="size-12 mx-auto text-muted-foreground mb-4" />
        <p class="text-muted-foreground">No cards found.</p>
        <p class="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or search query.
        </p>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each cards as card}
        <Card.Root class="hover:border-primary/50 transition-colors">
          <Card.Content class="p-4">
            {#if card.image_url}
              <img
                src={card.image_url}
                alt={card.name}
                class="w-full h-48 object-contain bg-muted rounded-lg mb-4"
              />
            {:else}
              <div class="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                <IconCards class="size-12 text-muted-foreground" />
              </div>
            {/if}
            <div class="space-y-2">
              <h3 class="font-semibold text-lg line-clamp-2">{card.name}</h3>
              <div class="flex flex-wrap gap-2">
                <Badge variant="outline" class={getGameBadgeColor(card.game_code)}>
                  {card.game_code.toUpperCase()}
                </Badge>
                {#if card.set_code}
                  <Badge variant="outline">{card.set_code}</Badge>
                {/if}
                {#if card.rarity}
                  <Badge variant="outline">{card.rarity}</Badge>
                {/if}
              </div>
              <div class="flex items-center justify-between pt-2 border-t">
                <span class="text-sm text-muted-foreground">Market Value</span>
                <span class="font-semibold">
                  {formatCurrency(card.market_value_cents)}
                </span>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}

  <!-- Pagination -->
  {#if data.hasMore || data.page > 1}
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {cards.length} of {data.total} cards
        {#if data.page > 1}
          (Page {data.page} of {Math.ceil(data.total / data.limit)})
        {/if}
      </p>
      <div class="flex gap-2">
        {#if data.page > 1}
          <Button
            variant="outline"
            onclick={() => {
              const params = new URLSearchParams($page.url.searchParams);
              params.set("page", String(data.page - 1));
              goto(`?${params.toString()}`);
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
            }}
          >
            Next
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</div>
