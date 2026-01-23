<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import {
    IconCoin,
    IconSparkles,
    IconPlus,
    IconInfoCircle,
  } from "@tabler/icons-svelte";

  let {
    balance,
    isLoading = false,
    onBuyRips,
  }: {
    balance: number;
    isLoading?: boolean;
    onBuyRips: () => void;
  } = $props();
</script>

<div
  class="flex flex-wrap justify-between items-center gap-4 border p-4 rounded-lg"
>
  <!-- Balance Info -->
  <div class="flex items-center gap-x-4">
    <span
      class="shrink-0 size-14 rounded-full bg-primary/10 flex items-center justify-center"
    >
      <IconCoin size={32} class="text-primary" />
    </span>

    <div class="grow">
      {#if isLoading}
        <Skeleton class="h-8 w-32 mb-1" />
        <Skeleton class="h-4 w-20" />
      {:else}
        <p class="text-2xl md:text-3xl font-semibold">
          {balance.toFixed(2)}
        </p>
        <p class="text-muted-foreground flex items-center gap-1">
          Rip balance
          <Tooltip.Root>
            <Tooltip.Trigger>
              <IconInfoCircle
                size={14}
                class="text-muted-foreground/70 hover:text-muted-foreground cursor-help"
              />
            </Tooltip.Trigger>
            <Tooltip.Content class="max-w-xs">
              <p>
                Rips are a non-withdrawable virtual currency used exclusively
                for opening card packs. They cannot be converted to cash or
                transferred.
              </p>
            </Tooltip.Content>
          </Tooltip.Root>
        </p>
      {/if}
    </div>
  </div>

  <!-- Button Group -->
  <div class="flex flex-wrap gap-2">
    <Button onclick={onBuyRips} class="gap-2 text-white">
      <IconPlus size={16} />
      Buy Rips
    </Button>
    <Button variant="outline" href="/packs" class="gap-2  text-white">
      <IconSparkles size={16} />
      Open Packs
    </Button>
  </div>
</div>
