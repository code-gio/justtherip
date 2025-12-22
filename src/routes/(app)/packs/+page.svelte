<script lang="ts">
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import {
    IconSparkles,
    IconFlame,
    IconTrendingUp,
    IconStar,
    IconBolt,
    IconDiamond,
    IconCrown,
    IconPackage,
  } from "@tabler/icons-svelte";
  import {
    PacksFilter,
    PacksGrid,
    type Pack,
    type Category,
    type SortOption,
  } from "$lib/components/packs";

  let { data } = $props();
  let { balance } = $derived(data);

  let searchQuery = $state("");
  let activeCategory = $state("all");
  let sortBy = $state("popular");

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
      ev: 5.5,
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
      ev: 5.1,
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
      ev: 12.5,
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

  const CATEGORIES: Category[] = [
    { id: "all", label: "All Packs", icon: IconPackage },
    { id: "featured", label: "Featured", icon: IconStar },
    { id: "hot", label: "Hot", icon: IconFlame },
    { id: "new", label: "New", icon: IconSparkles },
    { id: "high-ev", label: "High EV", icon: IconTrendingUp },
  ];

  const SORT_OPTIONS: SortOption[] = [
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

<div class="min-h-screen bg-background">
  <PacksFilter
    bind:searchQuery
    bind:activeCategory
    bind:sortBy
    categories={CATEGORIES}
    sortOptions={SORT_OPTIONS}
  />

  <PacksGrid packs={filteredPacks} {balance} onOpenPack={handleOpenPack} />
</div>
