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
    IconChevronLeft,
    IconChevronRight,
    IconFlame,
    IconTrendingUp,
    IconDiamond,
    IconCrown,
    IconStar,
    IconBolt,
    IconPackage,
    IconArrowLeft,
  } from "@tabler/icons-svelte";
  import { invalidateAll, goto } from "$app/navigation";

  let { data } = $props();
  let { balance } = $derived(data);

  interface Pack {
    id: string;
    name: string;
    set: string;
    price: number;
    ev: number;
    image: string;
    gradient: string;
    description: string;
    odds: { tier: string; chance: number; color: string; value: string }[];
    totalOpened: number;
  }

  const PACKS: Record<string, Pack> = {
    "prismatic-evolutions": {
      id: "prismatic-evolutions",
      name: "Prismatic Evolutions",
      set: "Scarlet & Violet",
      price: 5,
      ev: 7.24,
      image: "🌈",
      gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
      description: "The most sought-after modern set featuring stunning prismatic artwork and chase cards.",
      odds: [
        { tier: "Common", chance: 45, color: "bg-slate-400", value: "$0.10 - $0.50" },
        { tier: "Uncommon", chance: 30, color: "bg-emerald-500", value: "$0.50 - $2.00" },
        { tier: "Rare", chance: 15, color: "bg-blue-500", value: "$2.00 - $10.00" },
        { tier: "Ultra Rare", chance: 8, color: "bg-purple-500", value: "$10.00 - $50.00" },
        { tier: "Chase", chance: 2, color: "bg-amber-500", value: "$50.00 - $500.00" },
      ],
      totalOpened: 12847,
    },
    "surging-sparks": {
      id: "surging-sparks",
      name: "Surging Sparks",
      set: "Scarlet & Violet",
      price: 3,
      ev: 4.12,
      image: "⚡",
      gradient: "from-amber-400 via-yellow-500 to-orange-500",
      description: "Electric energy courses through this pack with powerful lightning-themed hits.",
      odds: [
        { tier: "Common", chance: 50, color: "bg-slate-400", value: "$0.10 - $0.40" },
        { tier: "Uncommon", chance: 28, color: "bg-emerald-500", value: "$0.40 - $1.50" },
        { tier: "Rare", chance: 14, color: "bg-blue-500", value: "$1.50 - $8.00" },
        { tier: "Ultra Rare", chance: 6, color: "bg-purple-500", value: "$8.00 - $40.00" },
        { tier: "Chase", chance: 2, color: "bg-amber-500", value: "$40.00 - $300.00" },
      ],
      totalOpened: 8432,
    },
    "stellar-crown": {
      id: "stellar-crown",
      name: "Stellar Crown",
      set: "Scarlet & Violet",
      price: 4,
      ev: 5.50,
      image: "👑",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      description: "Royal treatment with majestic artwork and crown-worthy chase cards.",
      odds: [
        { tier: "Common", chance: 48, color: "bg-slate-400", value: "$0.10 - $0.45" },
        { tier: "Uncommon", chance: 29, color: "bg-emerald-500", value: "$0.45 - $1.80" },
        { tier: "Rare", chance: 14, color: "bg-blue-500", value: "$1.80 - $9.00" },
        { tier: "Ultra Rare", chance: 7, color: "bg-purple-500", value: "$9.00 - $45.00" },
        { tier: "Chase", chance: 2, color: "bg-amber-500", value: "$45.00 - $350.00" },
      ],
      totalOpened: 6219,
    },
    "twilight-masquerade": {
      id: "twilight-masquerade",
      name: "Twilight Masquerade",
      set: "Scarlet & Violet",
      price: 3,
      ev: 3.89,
      image: "🎭",
      gradient: "from-rose-500 via-purple-600 to-indigo-600",
      description: "Mystery and elegance combine in this theatrical set of masked wonders.",
      odds: [
        { tier: "Common", chance: 52, color: "bg-slate-400", value: "$0.10 - $0.35" },
        { tier: "Uncommon", chance: 27, color: "bg-emerald-500", value: "$0.35 - $1.30" },
        { tier: "Rare", chance: 13, color: "bg-blue-500", value: "$1.30 - $7.00" },
        { tier: "Ultra Rare", chance: 6, color: "bg-purple-500", value: "$7.00 - $35.00" },
        { tier: "Chase", chance: 2, color: "bg-amber-500", value: "$35.00 - $250.00" },
      ],
      totalOpened: 4891,
    },
    "temporal-forces": {
      id: "temporal-forces",
      name: "Temporal Forces",
      set: "Scarlet & Violet",
      price: 4,
      ev: 5.10,
      image: "⏳",
      gradient: "from-cyan-400 via-blue-500 to-indigo-600",
      description: "Bend time and space with this collection of temporal anomalies and paradoxes.",
      odds: [
        { tier: "Common", chance: 49, color: "bg-slate-400", value: "$0.10 - $0.42" },
        { tier: "Uncommon", chance: 28, color: "bg-emerald-500", value: "$0.42 - $1.70" },
        { tier: "Rare", chance: 14, color: "bg-blue-500", value: "$1.70 - $8.50" },
        { tier: "Ultra Rare", chance: 7, color: "bg-purple-500", value: "$8.50 - $42.00" },
        { tier: "Chase", chance: 2, color: "bg-amber-500", value: "$42.00 - $320.00" },
      ],
      totalOpened: 5632,
    },
    "paldean-fates": {
      id: "paldean-fates",
      name: "Paldean Fates",
      set: "Scarlet & Violet",
      price: 6,
      ev: 8.75,
      image: "✨",
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      description: "Destiny awaits in this high-value set packed with shiny treasures from Paldea.",
      odds: [
        { tier: "Common", chance: 42, color: "bg-slate-400", value: "$0.15 - $0.60" },
        { tier: "Uncommon", chance: 30, color: "bg-emerald-500", value: "$0.60 - $2.50" },
        { tier: "Rare", chance: 16, color: "bg-blue-500", value: "$2.50 - $12.00" },
        { tier: "Ultra Rare", chance: 9, color: "bg-purple-500", value: "$12.00 - $60.00" },
        { tier: "Chase", chance: 3, color: "bg-amber-500", value: "$60.00 - $500.00" },
      ],
      totalOpened: 15234,
    },
    "obsidian-flames": {
      id: "obsidian-flames",
      name: "Obsidian Flames",
      set: "Scarlet & Violet",
      price: 2,
      ev: 2.45,
      image: "🔥",
      gradient: "from-orange-500 via-red-500 to-rose-600",
      description: "Fiery passion ignites in this blazing set of volcanic power.",
      odds: [
        { tier: "Common", chance: 55, color: "bg-slate-400", value: "$0.08 - $0.30" },
        { tier: "Uncommon", chance: 26, color: "bg-emerald-500", value: "$0.30 - $1.00" },
        { tier: "Rare", chance: 12, color: "bg-blue-500", value: "$1.00 - $5.00" },
        { tier: "Ultra Rare", chance: 5, color: "bg-purple-500", value: "$5.00 - $25.00" },
        { tier: "Chase", chance: 2, color: "bg-amber-500", value: "$25.00 - $200.00" },
      ],
      totalOpened: 9821,
    },
    "151": {
      id: "151",
      name: "151",
      set: "Scarlet & Violet",
      price: 8,
      ev: 12.50,
      image: "🎴",
      gradient: "from-red-500 via-pink-500 to-purple-500",
      description: "The original 151 return in stunning glory. Chase the legendary Mew!",
      odds: [
        { tier: "Common", chance: 40, color: "bg-slate-400", value: "$0.20 - $0.80" },
        { tier: "Uncommon", chance: 28, color: "bg-emerald-500", value: "$0.80 - $3.00" },
        { tier: "Rare", chance: 18, color: "bg-blue-500", value: "$3.00 - $15.00" },
        { tier: "Ultra Rare", chance: 10, color: "bg-purple-500", value: "$15.00 - $75.00" },
        { tier: "Chase", chance: 4, color: "bg-amber-500", value: "$75.00 - $500.00" },
      ],
      totalOpened: 21456,
    },
  };

  let packId = $derived(page.params.packId);
  let pack = $derived(PACKS[packId]);

  let isOpening = $state(false);
  let pulledCard = $state<any>(null);
  let showCardReveal = $state(false);
  let openCount = $state(1);

  async function openPack() {
    if (!pack || balance < pack.price * openCount) {
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
        body: JSON.stringify({ packId: pack.id, count: openCount }),
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
        `You pulled a ${result.card.tier_name} worth $${result.card.value_usd}!`
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
      Common: "from-slate-400 to-slate-600",
      Uncommon: "from-emerald-400 to-emerald-600",
      Rare: "from-blue-400 to-blue-600",
      "Ultra Rare": "from-purple-400 to-purple-600",
      Epic: "from-purple-400 to-purple-600",
      Legendary: "from-amber-400 to-orange-500",
      Chase: "from-rose-400 via-pink-500 to-purple-600",
      "Ultra Chase": "from-rose-400 via-pink-500 to-purple-600",
    };
    return gradients[tierName] || "from-gray-400 to-gray-600";
  }

  function getTierTextColor(tier: string): string {
    const colors: Record<string, string> = {
      Common: "text-slate-400",
      Uncommon: "text-emerald-500",
      Rare: "text-blue-500",
      "Ultra Rare": "text-purple-500",
      Chase: "text-amber-500",
    };
    return colors[tier] || "text-gray-400";
  }
</script>

{#if !pack}
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
      <IconPackage size={64} class="mx-auto text-muted-foreground mb-4" />
      <h1 class="text-2xl font-bold mb-2">Pack Not Found</h1>
      <p class="text-muted-foreground mb-6">This pack doesn't exist or has been removed.</p>
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
      <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center max-w-md w-full">
          <div class="relative w-full">
            <!-- Glow Effect -->
            <div
              class="absolute inset-0 bg-gradient-to-r {getTierGradient(pulledCard.tier_name)} rounded-3xl blur-3xl opacity-60 scale-110 animate-pulse"
            ></div>

            <!-- Card -->
            <div
              class="relative aspect-[3/4] rounded-3xl bg-gradient-to-br {getTierGradient(pulledCard.tier_name)} p-1 shadow-2xl"
            >
              <div class="w-full h-full rounded-[22px] bg-card flex flex-col items-center justify-center p-8 text-center">
                <Badge class="mb-6 text-sm px-4 py-1.5">{pulledCard.tier_name}</Badge>

                <div class="text-6xl sm:text-7xl font-black mb-4 bg-gradient-to-br {getTierGradient(pulledCard.tier_name)} bg-clip-text text-transparent">
                  ${pulledCard.value_usd}
                </div>

                {#if pulledCard.card_name}
                  <p class="text-xl font-semibold mb-2">{pulledCard.card_name}</p>
                {/if}

                {#if pulledCard.set_name}
                  <p class="text-muted-foreground">{pulledCard.set_name}</p>
                {/if}

                {#if pulledCard.rarity}
                  <p class="text-sm text-muted-foreground mt-2">{pulledCard.rarity}</p>
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
              disabled={isOpening || balance < pack.price}
            >
              <IconSparkles size={18} class="mr-2" />
              Open Another
            </Button>
            <Button variant="secondary" size="lg" onclick={() => goto("/inventory")}>
              Inventory
              <IconChevronRight size={18} class="ml-1" />
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
            <div class="absolute inset-0 bg-gradient-to-r {pack.gradient} rounded-3xl blur-3xl opacity-30"></div>
            
            <!-- Pack Card -->
            <div class="relative aspect-[3/4] max-w-md mx-auto rounded-3xl bg-gradient-to-br {pack.gradient} overflow-hidden shadow-2xl">
              <!-- Pattern -->
              <div class="absolute inset-0 opacity-20">
                <div class="absolute inset-0" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px); background-size: 40px 40px;"></div>
              </div>
              
              <!-- Content -->
              <div class="absolute inset-0 flex flex-col items-center justify-center p-8">
                <span class="text-9xl mb-6 drop-shadow-2xl {isOpening ? 'animate-bounce' : ''}">
                  {pack.image}
                </span>
                <h2 class="text-3xl font-black text-white text-center mb-2 drop-shadow-lg">{pack.name}</h2>
                <p class="text-white/70 text-center">{pack.set}</p>
              </div>

              <!-- Opening Overlay -->
              {#if isOpening}
                <div class="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent animate-pulse"></div>
                <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div class="text-center">
                    <IconLoader2 size={64} class="text-white animate-spin mx-auto mb-4" />
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
              <Badge variant="secondary">{pack.set}</Badge>
              <Badge variant="outline" class="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                <IconTrendingUp size={14} class="mr-1" />
                EV ${pack.ev.toFixed(2)}
              </Badge>
            </div>
            <h1 class="text-4xl font-black mb-3">{pack.name}</h1>
            <p class="text-lg text-muted-foreground">{pack.description}</p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4">
            <Card.Root class="p-4 text-center">
              <p class="text-2xl font-bold text-primary">{pack.totalOpened.toLocaleString()}</p>
              <p class="text-xs text-muted-foreground">Packs Opened</p>
            </Card.Root>
            <Card.Root class="p-4 text-center">
              <p class="text-2xl font-bold text-emerald-500">${pack.ev.toFixed(2)}</p>
              <p class="text-xs text-muted-foreground">Expected Value</p>
            </Card.Root>
            <Card.Root class="p-4 text-center">
              <p class="text-2xl font-bold text-amber-500">{pack.odds.find(o => o.tier === "Chase")?.chance}%</p>
              <p class="text-xs text-muted-foreground">Chase Rate</p>
            </Card.Root>
          </div>

          <!-- Odds Breakdown -->
          <Card.Root class="overflow-hidden">
            <Card.Header class="pb-4">
              <Card.Title class="flex items-center gap-2">
                <IconChartBar size={20} />
                Pull Rates
              </Card.Title>
              <Card.Description>Your chances of hitting each tier</Card.Description>
            </Card.Header>
            <Card.Content class="pb-6">
              <div class="space-y-4">
                {#each pack.odds as odd}
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full {odd.color}"></div>
                        <span class="font-medium {getTierTextColor(odd.tier)}">{odd.tier}</span>
                      </div>
                      <div class="flex items-center gap-4 text-sm">
                        <span class="text-muted-foreground">{odd.value}</span>
                        <span class="font-bold w-12 text-right">{odd.chance}%</span>
                      </div>
                    </div>
                    <Progress value={odd.chance} class="h-2" />
                  </div>
                {/each}
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Purchase Section -->
          <Card.Root class="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <Card.Content class="p-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Price per pack</p>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                      <IconCoin size={20} class="text-amber-500" />
                      <span class="text-xl font-bold text-amber-600 dark:text-amber-400">{pack.price}</span>
                    </div>
                    {#if pack.ev > pack.price}
                      <Badge class="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                        +{((pack.ev / pack.price - 1) * 100).toFixed(0)}% EV
                      </Badge>
                    {/if}
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-muted-foreground mb-1">Your Balance</p>
                  <p class="text-2xl font-bold">{balance} Rips</p>
                </div>
              </div>

              {#if balance < pack.price}
                <div class="space-y-3">
                  <p class="text-destructive text-sm text-center">
                    You need {pack.price - balance} more Rips to open this pack
                  </p>
                  <Button class="w-full" size="lg" onclick={() => goto("/store")}>
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
                    Open Pack for {pack.price} Rips
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
