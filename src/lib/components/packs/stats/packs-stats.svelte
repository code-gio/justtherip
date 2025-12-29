<script lang="ts">
  import {
    IconTrophy,
    IconPackage,
    IconUsers,
    IconDiamond,
  } from "@tabler/icons-svelte";

  let {
    totalPrizes = "$2.4M+",
    packsOpened = "84,521",
    activeUsers = "12,847",
    topPrize = "$500",
  }: {
    totalPrizes?: string;
    packsOpened?: string;
    activeUsers?: string;
    topPrize?: string;
  } = $props();

  const stats = [
    {
      value: totalPrizes,
      label: "Total Prizes Won",
      icon: IconTrophy,
      colorClass: "text-chart-4 bg-chart-4/20",
    },
    {
      value: packsOpened,
      label: "Packs Opened",
      icon: IconPackage,
      colorClass: "text-primary bg-primary/20",
    },
    {
      value: activeUsers,
      label: "Active Users",
      icon: IconUsers,
      colorClass: "text-chart-2 bg-chart-2/20",
    },
    {
      value: topPrize,
      label: "Top Prize",
      icon: IconDiamond,
      colorClass: "text-chart-4 bg-chart-4/20",
    },
  ];
</script>

<div
  class="border-t border-border bg-gradient-to-b from-background to-card"
>
  <div class="px-4 md:px-6 py-8 max-w-7xl mx-auto">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {#each stats as stat}
        {@const Icon = stat.icon}
        <div
          class="relative flex flex-col items-center p-4 rounded-2xl overflow-hidden bg-card/50 border border-border"
        >
          <div
            class="relative flex items-center justify-center w-10 h-10 rounded-xl mb-3 {stat.colorClass}"
          >
            <Icon size={20} />
          </div>
          <p
            class="relative text-2xl md:text-3xl font-black text-foreground mb-1"
          >
            {stat.value}
          </p>
          <p class="relative text-xs md:text-sm text-muted-foreground text-center">
            {stat.label}
          </p>
        </div>
      {/each}
    </div>
  </div>
</div>
