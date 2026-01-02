<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";

  interface Props {
    tierBreakdown: Record<string, number> | null;
  }

  let { tierBreakdown }: Props = $props();
</script>

{#if tierBreakdown && Object.keys(tierBreakdown).length > 0}
  <Card.Root>
    <Card.Header>
      <Card.Title>Cards by Tier</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-wrap gap-3">
        {#each Object.entries(tierBreakdown) as [tierName, count]}
          <Badge variant="secondary">
            {tierName}: {count}
          </Badge>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>
{/if}

