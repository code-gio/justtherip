<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { IconPlus } from "@tabler/icons-svelte";

  interface Props {
    onCreatePack: () => void;
  }

  let { onCreatePack }: Props = $props();
</script>

<div class="flex items-center justify-between">
  <div>
    <h1 class="text-4xl font-bold">Pack Management</h1>
    <p class="text-muted-foreground mt-2">
      Create and edit packs, set prices in Rips, configure card tiers
      with odds, and activate/deactivate packs.
    </p>
  </div>
  <Button onclick={onCreatePack} class="text-white">
    <IconPlus size={18} class="mr-2" />
    Create New Pack
  </Button>
</div>
