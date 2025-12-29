<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress";
  import { toast } from "svelte-sonner";
  import {
    IconSparkles,
    IconLoader2,
    IconCoin,
    IconX,
    IconTrendingUp,
    IconPackage,
    IconArrowLeft,
  } from "@tabler/icons-svelte";
  import { invalidateAll, goto } from "$app/navigation";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { balance, pack } = $derived(data);

  // Calculate EV from odds (simplified - would need actual card values for accurate EV)
  const expectedValue = $derived(() => {
    if (!pack?.odds || pack.odds.length === 0) return 0;
    // Simple calculation: average of min/max for each tier weighted by probability
    return pack.odds.reduce((sum, odd) => {
      const avgValue = (odd.min_value + odd.max_value) / 2;
      return sum + (avgValue * odd.chance) / 100;
    }, 0);
  });

  // Get default gradient based on game or pack name
  function getPackGradient(): string {
    if (pack?.image_url) return "from-blue-500 via-purple-500 to-pink-500";
    // Default gradient
    return "from-violet-500 via-fuchsia-500 to-pink-500";
  }

  // Get tier color based on tier name
  function getTierColor(tierName: string): string {
    const colors: Record<string, string> = {
      Trash: "bg-slate-400",
      Low: "bg-emerald-500",
      Mid: "bg-blue-500",
      High: "bg-purple-500",
      Chase: "bg-amber-500",
      "Ultra Chase": "bg-rose-500",
    };
    return colors[tierName] || "bg-gray-400";
  }



  let isOpening = $state(false);
  let pulledCard = $state<any>(null);
  let showCardReveal = $state(false);

  async function openPack() {
    if (!pack || balance < pack.rip_cost) {
      toast.error("Insufficient Rips! Purchase more from the store.");
      return;
    }

    isOpening = true;
    pulledCard = null;
    showCardReveal = false;

    try {
      const response = await fetch("/api/packs/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: pack.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open pack");
      }

      const result = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      pulledCard = result.card;
      showCardReveal = true;
      await invalidateAll();

      toast.success(
        `You pulled a ${result.card.tier_name} worth $${(result.card.value_cents / 100).toFixed(2)}!`
      );
    } catch (error) {
      console.error("Pack opening error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to open pack"
      );
    } finally {
      isOpening = false;
    }
  }

  function closeReveal() {
    showCardReveal = false;
    pulledCard = null;
  }

  function getTierGradient(tierName: string): string {
    const gradients: Record<string, string> = {
      Trash: "from-slate-400 to-slate-600",
      Low: "from-emerald-400 to-emerald-600",
      Mid: "from-blue-400 to-blue-600",
      High: "from-purple-400 to-purple-600",
      Chase: "from-amber-400 to-orange-500",
      "Ultra Chase": "from-rose-400 via-pink-500 to-purple-600",
    };
    return gradients[tierName] || "from-gray-400 to-gray-600";
  }

  function getTierTextColor(tier: string): string {
    const colors: Record<string, string> = {
      Trash: "text-slate-400",
      Low: "text-emerald-500",
      Mid: "text-blue-500",
      High: "text-purple-500",
      Chase: "text-amber-500",
      "Ultra Chase": "text-rose-500",
    };
    return colors[tier] || "text-gray-400";
  }
</script>

{#if !pack}
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
      <IconPackage size={64} class="mx-auto text-muted-foreground mb-4" />
      <h1 class="text-2xl font-bold mb-2">Pack Not Found</h1>
      <p class="text-muted-foreground mb-6">
        This pack doesn't exist or has been removed.
      </p>
      <Button onclick={() => goto("/packs")}>
        <IconArrowLeft size={18} class="mr-2" />
        Back to Packs
      </Button>
    </div>
  </div>
{:else}
  <div class="min-h-screen">
    <!-- Back Button -->
    <div class="px-6 py-4 max-w-7xl mx-auto">
      <Button variant="ghost" size="sm" onclick={() => goto("/packs")}>
        <IconArrowLeft size={18} class="mr-2" />
        Back to Store
      </Button>
    </div>

    {#if showCardReveal && pulledCard}
      <!-- Card Reveal Overlay -->
      <div
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div
          class="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center max-w-md w-full"
        >
          <div class="relative w-full">
            <!-- Glow Effect -->
            <div
              class="absolute inset-0 bg-gradient-to-r {getTierGradient(
                pulledCard.tier_name
              )} rounded-3xl blur-3xl opacity-60 scale-110 animate-pulse"
            ></div>

            <!-- Card -->
            <div
              class="relative aspect-[3/4] rounded-3xl bg-gradient-to-br {getTierGradient(
                pulledCard.tier_name
              )} p-1 shadow-2xl"
            >
              <div
                class="w-full h-full rounded-[22px] bg-card flex flex-col items-center justify-center p-8 text-center"
              >
                <Badge class="mb-6 text-sm px-4 py-1.5"
                  >{pulledCard.tier_name}</Badge
                >

                <div
                  class="text-6xl sm:text-7xl font-black mb-4 bg-gradient-to-br {getTierGradient(
                    pulledCard.tier_name
                  )} bg-clip-text text-transparent"
                >
                  ${((pulledCard.value_cents || 0) / 100).toFixed(2)}
                </div>

                {#if pulledCard.card_name}
                  <p class="text-xl font-semibold mb-2">
                    {pulledCard.card_name}
                  </p>
                {/if}

                {#if pulledCard.set_name}
                  <p class="text-muted-foreground">{pulledCard.set_name}</p>
                {/if}

                {#if pulledCard.rarity}
                  <p class="text-sm text-muted-foreground mt-2">
                    {pulledCard.rarity}
                  </p>
                {/if}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-3 mt-8">
            <Button variant="outline" size="lg" onclick={closeReveal}>
              <IconX size={18} class="mr-2" />
              Close
            </Button>
            <Button
              size="lg"
              onclick={openPack}
              disabled={isOpening || balance < pack.rip_cost}
            >
              <IconSparkles size={18} class="mr-2" />
              Open Another
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onclick={() => goto("/inventory")}
            >
              Inventory
            </Button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    <div class="px-6 pb-12 max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-12 items-start">
        <!-- Pack Visual -->
        <div class="relative">
          <div class="sticky top-24">
            <!-- Glow -->
            <div
              class="absolute inset-0 bg-gradient-to-r {getPackGradient()} rounded-3xl blur-3xl opacity-30"
            ></div>

            <!-- Pack Card -->
            <div
              class="relative aspect-[3/4] max-w-md mx-auto rounded-3xl bg-gradient-to-br {getPackGradient()} overflow-hidden shadow-2xl"
            >
              {#if pack.image_url}
                <img
                  src={pack.image_url}
                  alt={pack.name}
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black/40"></div>
              {:else}
                <!-- Pattern -->
                <div class="absolute inset-0 opacity-20">
                  <div
                    class="absolute inset-0"
                    style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px); background-size: 40px 40px;"
                  ></div>
                </div>
              {/if}

              <!-- Content -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center p-8"
              >
                <h2
                  class="text-3xl font-black text-white text-center mb-2 drop-shadow-lg"
                >
                  {pack.name}
                </h2>
                {#if pack.game_code}
                  <p class="text-white/70 text-center uppercase">{pack.game_code}</p>
                {/if}
              </div>

              <!-- Opening Overlay -->
              {#if isOpening}
                <div
                  class="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent animate-pulse"
                ></div>
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <div class="text-center">
                    <IconLoader2
                      size={64}
                      class="text-white animate-spin mx-auto mb-4"
                    />
                    <p class="text-white text-xl font-bold">Opening...</p>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Pack Details -->
        <div class="space-y-8">
          <!-- Header -->
          <div>
            <div class="flex items-center gap-3 mb-3">
              {#if pack.game_code}
                <Badge variant="secondary" class="uppercase">{pack.game_code}</Badge>
              {/if}
              {#if expectedValue() > 0}
                <Badge
                  variant="outline"
                  class="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                >
                  <IconTrendingUp size={14} class="mr-1" />
                  EV ${expectedValue().toFixed(2)}
                </Badge>
              {/if}
            </div>
            <h1 class="text-4xl font-black mb-3">{pack.name}</h1>
            {#if pack.description}
              <p class="text-lg text-muted-foreground">{pack.description}</p>
            {/if}
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4">
            <Card.Root class="p-4 text-center">
              <p class="text-2xl font-bold text-primary">
                {pack.total_openings.toLocaleString()}
              </p>
              <p class="text-xs text-muted-foreground">Packs Opened</p>
            </Card.Root>
            {#if expectedValue() > 0}
              <Card.Root class="p-4 text-center">
                <p class="text-2xl font-bold text-emerald-500">
                  ${expectedValue().toFixed(2)}
                </p>
                <p class="text-xs text-muted-foreground">Expected Value</p>
              </Card.Root>
            {/if}
            {#if pack.odds && pack.odds.length > 0}
              {@const chaseOdds = pack.odds.find((o) => o.tier_name === "Chase" || o.tier_name === "Ultra Chase")}
              {#if chaseOdds}
                <Card.Root class="p-4 text-center">
                  <p class="text-2xl font-bold text-amber-500">
                    {chaseOdds.chance.toFixed(1)}%
                  </p>
                  <p class="text-xs text-muted-foreground">Chase Rate</p>
                </Card.Root>
              {/if}
            {/if}
          </div>

          <!-- Odds Breakdown -->
          {#if pack.odds && pack.odds.length > 0}
            <Card.Root class="overflow-hidden">
              <Card.Header class="pb-4">
                <Card.Title>Pull Rates</Card.Title>
                <Card.Description
                  >Your chances of hitting each tier</Card.Description
                >
              </Card.Header>
              <Card.Content class="pb-6">
                <div class="space-y-4">
                  {#each pack.odds as odd}
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div class="w-3 h-3 rounded-full {getTierColor(odd.tier_name)}"></div>
                          <span class="font-medium {getTierTextColor(odd.tier_name)}"
                            >{odd.tier_name}</span
                          >
                        </div>
                        <div class="flex items-center gap-4 text-sm">
                          <span class="text-muted-foreground">{odd.value_range}</span>
                          <span class="font-bold w-12 text-right"
                            >{odd.chance.toFixed(1)}%</span
                          >
                        </div>
                      </div>
                      <Progress value={odd.chance} class="h-2" />
                    </div>
                  {/each}
                </div>
              </Card.Content>
            </Card.Root>
          {/if}

          <!-- Purchase Section -->
          <Card.Root
            class="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
          >
            <Card.Content class="p-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">
                    Price per pack
                  </p>
                  <div class="flex items-center gap-2">
                    <div
                      class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                    >
                      <IconCoin size={20} class="text-amber-500" />
                      <span
                        class="text-xl font-bold text-amber-600 dark:text-amber-400"
                        >{pack.rip_cost}</span
                      >
                    </div>
                    {#if expectedValue() > pack.rip_cost}
                      <Badge
                        class="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      >
                        +{((expectedValue() / pack.rip_cost - 1) * 100).toFixed(0)}% EV
                      </Badge>
                    {/if}
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-muted-foreground mb-1">Your Balance</p>
                  <p class="text-2xl font-bold">{balance} Rips</p>
                </div>
              </div>

              {#if balance < pack.rip_cost}
                <div class="space-y-3">
                  <p class="text-destructive text-sm text-center">
                    You need {pack.rip_cost - balance} more Rips to open this pack
                  </p>
                  <Button
                    class="w-full"
                    size="lg"
                    onclick={() => goto("/buy")}
                  >
                    <IconCoin size={18} class="mr-2" />
                    Get Rips
                  </Button>
                </div>
              {:else}
                <Button
                  class="w-full"
                  size="lg"
                  onclick={openPack}
                  disabled={isOpening}
                >
                  {#if isOpening}
                    <IconLoader2 size={18} class="mr-2 animate-spin" />
                    Opening...
                  {:else}
                    <IconSparkles size={18} class="mr-2" />
                    Open Pack for {pack.rip_cost} Rips
                  {/if}
                </Button>
              {/if}
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </div>
  </div>
{/if}
