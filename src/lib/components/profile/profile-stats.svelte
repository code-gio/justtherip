<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { IconPackage, IconTrophy, IconChartBar } from "@tabler/icons-svelte";
  import type { Profile } from "./types";

  interface Props {
    profile: Profile | null;
  }

  let { profile }: Props = $props();

  const formatCurrency = (cents: number | null): string => {
    if (cents === null || cents === 0) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  let packsOpened = $derived(profile?.total_packs_opened ?? 0);
  let bestPullValue = $derived(profile?.best_pull_value_cents ?? 0);
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      <IconChartBar size={20} />
      Your Stats
    </Card.Title>
    <Card.Description>
      Your activity and achievements on the platform.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
        <div class="p-3 rounded-full bg-primary/10">
          <IconPackage size={24} class="text-primary" />
        </div>
        <div>
          <p class="text-2xl font-bold">{packsOpened.toLocaleString()}</p>
          <p class="text-sm text-muted-foreground">Packs Opened</p>
        </div>
      </div>

      <div class="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
        <div class="p-3 rounded-full bg-amber-500/10">
          <IconTrophy size={24} class="text-amber-500" />
        </div>
        <div>
          <p class="text-2xl font-bold">{formatCurrency(bestPullValue)}</p>
          <p class="text-sm text-muted-foreground">Best Pull Value</p>
        </div>
      </div>
    </div>
  </Card.Content>
</Card.Root>

