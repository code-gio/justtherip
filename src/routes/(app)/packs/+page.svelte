<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { Progress } from "$lib/components/ui/progress";
  import { toast } from "svelte-sonner";
  import {
    IconSparkles,
    IconSearch,
    IconFlame,
    IconTrendingUp,
    IconCoin,
    IconChartBar,
    IconFilter,
    IconStar,
    IconBolt,
    IconDiamond,
    IconCrown,
    IconPackage,
  } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let { balance } = $derived(data);

  let searchQuery = $state("");
  let activeCategory = $state("all");
  let sortBy = $state("popular");

  interface Pack {
    id: string;
    name: string;
    set: string;
    price: number;
    ev: number;
    image: string;
    gradient: string;
    icon: typeof IconSparkles;
    featured: boolean;
    hot: boolean;
    new: boolean;
    odds: { tier: string; chance: number; color: string }[];
    totalOpened: number;
  }

  const PACKS: Pack[] = [
    {
      id: "prismatic-evolutions",
      name: "Prismatic Evolutions",
      set: "Scarlet & Violet",
      price: 5,
      ev: 7.24,
      image: "🌈",
      gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
      icon: IconDiamond,
      featured: true,
      hot: true,
      new: true,
      odds: [
        { tier: "Common", chance: 45, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 30, color: "bg-emerald-500" },
        { tier: "Rare", chance: 15, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 8, color: "bg-purple-500" },
        { tier: "Chase", chance: 2, color: "bg-amber-500" },
      ],
      totalOpened: 12847,
    },
    {
      id: "surging-sparks",
      name: "Surging Sparks",
      set: "Scarlet & Violet",
      price: 3,
      ev: 4.12,
      image: "⚡",
      gradient: "from-amber-400 via-yellow-500 to-orange-500",
      icon: IconBolt,
      featured: false,
      hot: true,
      new: false,
      odds: [
        { tier: "Common", chance: 50, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 28, color: "bg-emerald-500" },
        { tier: "Rare", chance: 14, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 6, color: "bg-purple-500" },
        { tier: "Chase", chance: 2, color: "bg-amber-500" },
      ],
      totalOpened: 8432,
    },
    {
      id: "stellar-crown",
      name: "Stellar Crown",
      set: "Scarlet & Violet",
      price: 4,
      ev: 5.50,
      image: "👑",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      icon: IconCrown,
      featured: true,
      hot: false,
      new: false,
      odds: [
        { tier: "Common", chance: 48, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 29, color: "bg-emerald-500" },
        { tier: "Rare", chance: 14, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 7, color: "bg-purple-500" },
        { tier: "Chase", chance: 2, color: "bg-amber-500" },
      ],
      totalOpened: 6219,
    },
    {
      id: "twilight-masquerade",
      name: "Twilight Masquerade",
      set: "Scarlet & Violet",
      price: 3,
      ev: 3.89,
      image: "🎭",
      gradient: "from-rose-500 via-purple-600 to-indigo-600",
      icon: IconStar,
      featured: false,
      hot: false,
      new: false,
      odds: [
        { tier: "Common", chance: 52, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 27, color: "bg-emerald-500" },
        { tier: "Rare", chance: 13, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 6, color: "bg-purple-500" },
        { tier: "Chase", chance: 2, color: "bg-amber-500" },
      ],
      totalOpened: 4891,
    },
    {
      id: "temporal-forces",
      name: "Temporal Forces",
      set: "Scarlet & Violet",
      price: 4,
      ev: 5.10,
      image: "⏳",
      gradient: "from-cyan-400 via-blue-500 to-indigo-600",
      icon: IconSparkles,
      featured: false,
      hot: false,
      new: false,
      odds: [
        { tier: "Common", chance: 49, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 28, color: "bg-emerald-500" },
        { tier: "Rare", chance: 14, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 7, color: "bg-purple-500" },
        { tier: "Chase", chance: 2, color: "bg-amber-500" },
      ],
      totalOpened: 5632,
    },
    {
      id: "paldean-fates",
      name: "Paldean Fates",
      set: "Scarlet & Violet",
      price: 6,
      ev: 8.75,
      image: "✨",
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      icon: IconDiamond,
      featured: true,
      hot: true,
      new: false,
      odds: [
        { tier: "Common", chance: 42, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 30, color: "bg-emerald-500" },
        { tier: "Rare", chance: 16, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 9, color: "bg-purple-500" },
        { tier: "Chase", chance: 3, color: "bg-amber-500" },
      ],
      totalOpened: 15234,
    },
    {
      id: "obsidian-flames",
      name: "Obsidian Flames",
      set: "Scarlet & Violet",
      price: 2,
      ev: 2.45,
      image: "🔥",
      gradient: "from-orange-500 via-red-500 to-rose-600",
      icon: IconFlame,
      featured: false,
      hot: false,
      new: false,
      odds: [
        { tier: "Common", chance: 55, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 26, color: "bg-emerald-500" },
        { tier: "Rare", chance: 12, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 5, color: "bg-purple-500" },
        { tier: "Chase", chance: 2, color: "bg-amber-500" },
      ],
      totalOpened: 9821,
    },
    {
      id: "151",
      name: "151",
      set: "Scarlet & Violet",
      price: 8,
      ev: 12.50,
      image: "🎴",
      gradient: "from-red-500 via-pink-500 to-purple-500",
      icon: IconCrown,
      featured: true,
      hot: true,
      new: false,
      odds: [
        { tier: "Common", chance: 40, color: "bg-slate-400" },
        { tier: "Uncommon", chance: 28, color: "bg-emerald-500" },
        { tier: "Rare", chance: 18, color: "bg-blue-500" },
        { tier: "Ultra Rare", chance: 10, color: "bg-purple-500" },
        { tier: "Chase", chance: 4, color: "bg-amber-500" },
      ],
      totalOpened: 21456,
    },
  ];

  const CATEGORIES = [
    { id: "all", label: "All Packs", icon: IconPackage },
    { id: "featured", label: "Featured", icon: IconStar },
    { id: "hot", label: "Hot", icon: IconFlame },
    { id: "new", label: "New", icon: IconSparkles },
    { id: "high-ev", label: "High EV", icon: IconTrendingUp },
  ];

  const SORT_OPTIONS = [
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "ev-high", label: "Highest EV" },
    { value: "newest", label: "Newest" },
  ];

  let filteredPacks = $derived.by(() => {
    let packs = [...PACKS];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      packs = packs.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.set.toLowerCase().includes(query)
      );
    }

    if (activeCategory === "featured") {
      packs = packs.filter((p) => p.featured);
    } else if (activeCategory === "hot") {
      packs = packs.filter((p) => p.hot);
    } else if (activeCategory === "new") {
      packs = packs.filter((p) => p.new);
    } else if (activeCategory === "high-ev") {
      packs = packs.filter((p) => p.ev > p.price * 1.2);
    }

    if (sortBy === "popular") {
      packs.sort((a, b) => b.totalOpened - a.totalOpened);
    } else if (sortBy === "price-low") {
      packs.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      packs.sort((a, b) => b.price - a.price);
    } else if (sortBy === "ev-high") {
      packs.sort((a, b) => b.ev - a.ev);
    }

    return packs;
  });

  function handleOpenPack(pack: Pack) {
    if (balance < pack.price) {
      toast.error("Insufficient Rips! Purchase more from the store.");
      return;
    }
    goto(`/packs/${pack.id}`);
  }
</script>

<div class="min-h-screen">
  <!-- Hero Section -->
  <div class="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-muted/50 to-background">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
    </div>
    
    <div class="relative px-6 py-12 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <IconPackage size={24} class="text-white" />
            </div>
            <Badge variant="secondary" class="text-xs font-medium">
              {PACKS.length} Packs Available
            </Badge>
          </div>
          <h1 class="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Pack Store
          </h1>
          <p class="text-muted-foreground text-lg max-w-xl">
            Open digital packs and win real cards. Every pack contains guaranteed value with chances at ultra rare hits.
          </p>
        </div>
        
        <div class="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-lg">
          <div class="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
            <IconCoin size={24} class="text-white" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Your Balance</p>
            <p class="text-2xl font-bold">{balance} Rips</p>
          </div>
          <Button variant="secondary" size="sm" onclick={() => goto("/store")}>
            Get More
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters Bar -->
  <div class="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
    <div class="px-6 py-4 max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <IconSearch size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search packs..."
            bind:value={searchQuery}
            class="pl-10 bg-muted/50"
          />
        </div>

        <!-- Category Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {#each CATEGORIES as category}
            {@const Icon = category.icon}
            <button
              onclick={() => activeCategory = category.id}
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 {activeCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}"
            >
              <Icon size={16} />
              {category.label}
            </button>
          {/each}
        </div>

        <!-- Sort -->
        <Select.Root type="single" bind:value={sortBy}>
          <Select.Trigger class="w-[180px] bg-muted/50">
            <span class="flex items-center gap-2">
              <IconFilter size={16} />
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
            </span>
          </Select.Trigger>
          <Select.Content>
            {#each SORT_OPTIONS as option}
              <Select.Item value={option.value}>{option.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  </div>

  <!-- Packs Grid -->
  <div class="px-6 py-8 max-w-7xl mx-auto">
    {#if filteredPacks.length === 0}
      <div class="text-center py-16">
        <IconPackage size={48} class="mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-1">No packs found</h3>
        <p class="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each filteredPacks as pack (pack.id)}
          <div class="group relative">
            <!-- Glow Effect -->
            {#if pack.featured}
              <div class="absolute -inset-0.5 bg-gradient-to-r {pack.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            {/if}
            
            <Card.Root class="relative overflow-hidden bg-card hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 {pack.featured ? 'border-2 border-white/20' : ''}">
              <!-- Pack Visual -->
              <div class="relative h-48 bg-gradient-to-br {pack.gradient} overflow-hidden">
                <!-- Pattern Overlay -->
                <div class="absolute inset-0 opacity-20">
                  <div class="absolute inset-0" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px); background-size: 30px 30px;"></div>
                </div>
                
                <!-- Badges -->
                <div class="absolute top-3 left-3 flex gap-2">
                  {#if pack.new}
                    <Badge class="bg-white/20 backdrop-blur-sm text-white border-0">NEW</Badge>
                  {/if}
                  {#if pack.hot}
                    <Badge class="bg-orange-500/80 backdrop-blur-sm text-white border-0">
                      <IconFlame size={12} class="mr-1" />
                      HOT
                    </Badge>
                  {/if}
                </div>
                
                <!-- EV Badge -->
                <div class="absolute top-3 right-3">
                  <Tooltip.Root>
                    <Tooltip.Trigger>
                      <Badge class="bg-black/30 backdrop-blur-sm text-white border-0">
                        <IconTrendingUp size={12} class="mr-1" />
                        EV ${pack.ev.toFixed(2)}
                      </Badge>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <p>Expected Value per pack</p>
                    </Tooltip.Content>
                  </Tooltip.Root>
                </div>
                
                <!-- Icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-7xl drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    {pack.image}
                  </span>
                </div>
                
                <!-- Shine Effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </div>

              <Card.Content class="p-4">
                <div class="mb-3">
                  <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">{pack.set}</p>
                  <h3 class="text-lg font-bold">{pack.name}</h3>
                </div>

                <!-- Odds Preview -->
                <div class="mb-4">
                  <div class="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Pull Rates</span>
                    <span>{pack.totalOpened.toLocaleString()} opened</span>
                  </div>
                  <div class="flex gap-0.5 h-2 rounded-full overflow-hidden">
                    {#each pack.odds as odd}
                      <Tooltip.Root>
                        <Tooltip.Trigger class="h-full {odd.color}" style="width: {odd.chance}%"></Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{odd.tier}: {odd.chance}%</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    {/each}
                  </div>
                </div>

                <!-- Price & Action -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                      <IconCoin size={16} class="text-amber-500" />
                      <span class="font-bold text-amber-600 dark:text-amber-400">{pack.price}</span>
                    </div>
                    {#if pack.ev > pack.price}
                      <Badge variant="secondary" class="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                        +{((pack.ev / pack.price - 1) * 100).toFixed(0)}% EV
                      </Badge>
                    {/if}
                  </div>
                  
                  <Button
                    size="sm"
                    onclick={() => handleOpenPack(pack)}
                    disabled={balance < pack.price}
                    class="shadow-lg"
                  >
                    <IconSparkles size={16} class="mr-1.5" />
                    Open
                  </Button>
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Stats Bar -->
  <div class="border-t border-border bg-muted/30">
    <div class="px-6 py-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <p class="text-3xl font-black text-primary mb-1">$2.4M+</p>
          <p class="text-sm text-muted-foreground">Total Prizes Won</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-black text-primary mb-1">84,521</p>
          <p class="text-sm text-muted-foreground">Packs Opened</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-black text-primary mb-1">12,847</p>
          <p class="text-sm text-muted-foreground">Active Users</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-black text-primary mb-1">$500</p>
          <p class="text-sm text-muted-foreground">Top Prize</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
