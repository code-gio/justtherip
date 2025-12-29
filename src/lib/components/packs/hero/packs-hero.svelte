<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { IconCoin } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";

  let { balance }: { balance: number } = $props();
</script>

<div class="relative w-full overflow-hidden">
  <!-- Background with gradient overlay -->
  <div
    class="relative w-full py-8 md:py-12 bg-gradient-to-b from-transparent to-card"
  >
    <!-- Floating orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-10 right-[20%] w-64 h-64 bg-primary/10 rounded-full blur-[100px]"
      ></div>
      <div
        class="absolute bottom-0 left-[10%] w-48 h-48 bg-chart-4/10 rounded-full blur-[80px]"
      ></div>
    </div>

    <div class="relative flex flex-col items-center gap-4 md:gap-6 px-4">
      <!-- Title Section -->
      <div class="flex flex-col items-center text-center pt-4">
        <span class="text-xl md:text-3xl font-black tracking-wide text-foreground">
          DISCOVER, OPEN & COLLECT
        </span>
        <span
          class="text-xl md:text-3xl font-black uppercase text-primary animate-pulse"
        >
          Pokemon Cards
        </span>
      </div>

      <!-- Balance Card -->
      <div
        class="flex items-center gap-3 px-5 py-3 rounded-2xl border border-border bg-card/90 backdrop-blur-sm"
      >
        <div
          class="flex items-center justify-center w-10 h-10 rounded-xl bg-chart-4 shadow-[0_0_20px_rgba(var(--chart-4),0.4)]"
        >
          <IconCoin size={20} class="text-background" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground uppercase tracking-wider"
            >Your Balance</span
          >
          <span class="text-lg font-bold text-foreground">{balance} Rips</span>
        </div>
        <Button
          size="sm"
          onclick={() => goto("/store")}
          class="ml-2 bg-primary/10 border border-primary text-primary hover:bg-primary/20"
        >
          Get More
        </Button>
      </div>

      <!-- Promo Text -->
      <div class="flex items-center gap-2">
        <span class="text-sm md:text-base font-bold text-foreground">
          GET A <span class="text-primary">FREE BOX</span> WHEN SIGNING UP!
        </span>
      </div>
    </div>
  </div>
</div>
