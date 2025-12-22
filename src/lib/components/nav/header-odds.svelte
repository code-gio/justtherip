<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { IconChartBar } from "@tabler/icons-svelte";

  interface CardTier {
    id: string;
    name: string;
    probability: number;
    min_value_cents: number;
    max_value_cents: number;
    color_hex: string;
  }

  let { tiers = [] }: { tiers?: CardTier[] } = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="sm" class="gap-2">
        <IconChartBar size={16} />
        <span class="hidden sm:inline">Odds</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-64" align="end">
    <DropdownMenu.Label>Drop Rates</DropdownMenu.Label>
    <DropdownMenu.Separator />
    {#each tiers as tier (tier.id)}
      {@const percentage = (tier.probability * 100).toFixed(2)}
      {@const minVal = (tier.min_value_cents / 100).toFixed(2)}
      {@const maxVal = (tier.max_value_cents / 100).toFixed(2)}
      <DropdownMenu.Item
        class="flex items-center justify-between cursor-default"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-full"
            style="background-color: {tier.color_hex}"
          ></div>
          <span>{tier.name}</span>
        </div>
        <div class="text-right text-xs">
          <span class="font-semibold">{percentage}%</span>
          <span class="text-muted-foreground ml-1">${minVal}-${maxVal}</span>
        </div>
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
