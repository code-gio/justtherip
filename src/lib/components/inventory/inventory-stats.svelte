<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { IconCoin } from "@tabler/icons-svelte";

  interface Props {
    stats: {
      total_value_usd: string;
    } | null;
  }

  let { stats }: Props = $props();
</script>

{#if stats}
  <Card.Root>
    <Card.Content class="p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-full bg-muted">
          <IconCoin size={24} class="text-foreground" />
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Collection Value</p>
          <p class="text-2xl font-bold">${stats.total_value_usd}</p>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
{/if}

