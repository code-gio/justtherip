<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select/index.js";
  import { IconSearch, IconFilter } from "@tabler/icons-svelte";
  import type { Category, SortOption } from "./types";

  let {
    searchQuery = $bindable(""),
    activeCategory = $bindable("all"),
    sortBy = $bindable("popular"),
    categories,
    sortOptions,
  }: {
    searchQuery: string;
    activeCategory: string;
    sortBy: string;
    categories: Category[];
    sortOptions: SortOption[];
  } = $props();
</script>

<div
  class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl"
>
  <div class="px-4 md:px-6 py-4 max-w-7xl mx-auto">
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <!-- Search -->
      <div class="relative flex-1 max-w-md">
        <IconSearch
          size={18}
          class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder="Search packs..."
          bind:value={searchQuery}
          class="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
        />
      </div>

      <!-- Category Tabs -->
      <div
        class="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide"
      >
        {#each categories as category}
          {@const Icon = category.icon}
          <button
            onclick={() => (activeCategory = category.id)}
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 {activeCategory ===
            category.id
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'}"
          >
            <Icon size={16} />
            {category.label}
          </button>
        {/each}
      </div>

      <!-- Sort -->
      <Select.Root type="single" bind:value={sortBy}>
        <Select.Trigger
          class="w-[180px] bg-card border-border text-foreground"
        >
          <span class="flex items-center gap-2">
            <IconFilter size={16} class="text-muted-foreground" />
            {sortOptions.find((o) => o.value === sortBy)?.label}
          </span>
        </Select.Trigger>
        <Select.Content class="bg-card border-border">
          {#each sortOptions as option}
            <Select.Item
              value={option.value}
              class="text-foreground hover:bg-secondary">{option.label}</Select.Item
            >
          {/each}
        </Select.Content>
      </Select.Root>
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
