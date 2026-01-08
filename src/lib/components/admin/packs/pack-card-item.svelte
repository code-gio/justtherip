<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { IconEdit, IconCopy, IconEye, IconEyeOff } from "@tabler/icons-svelte";

  interface Pack {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    game: {
      name: string;
      code: string;
    } | null;
    rip_cost: number;
    total_openings: number;
  }

  interface Props {
    pack: Pack;
    onEdit: (packId: string) => void;
    onDuplicate: (packId: string) => void;
    onToggleActive: (packId: string) => void;
  }

  let { pack, onEdit, onDuplicate, onToggleActive }: Props = $props();
</script>

<Card.Root>
  <Card.Header>
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <Card.Title class="text-lg">{pack.name}</Card.Title>
        <Card.Description class="mt-1 line-clamp-2">
          {pack.description || "No description"}
        </Card.Description>
      </div>
      <Badge variant={pack.is_active ? "default" : "secondary"}>
        {pack.is_active ? "Active" : "Inactive"}
      </Badge>
    </div>
  </Card.Header>
  <Card.Content class="space-y-4">
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">Game:</span>
      <span class="font-medium">{pack.game?.name || "Unknown"}</span>
    </div>
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">Rip Cost:</span>
      <span class="font-medium">{pack.rip_cost} Rips</span>
    </div>
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">Total Openings:</span>
      <span class="font-medium">{pack.total_openings.toLocaleString()}</span>
    </div>
  </Card.Content>
  <Card.Footer class="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      class="flex-1"
      onclick={() => onEdit(pack.id)}
    >
      <IconEdit size={16} class="mr-1" />
      Edit
    </Button>
    <Button
      variant="outline"
      size="sm"
      class="flex-1"
      onclick={() => onToggleActive(pack.id)}
    >
      {#if pack.is_active}
        <IconEyeOff size={16} class="mr-1" />
        Deactivate
      {:else}
        <IconEye size={16} class="mr-1" />
        Activate
      {/if}
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => onDuplicate(pack.id)}
    >
      <IconCopy size={16} />
    </Button>
  </Card.Footer>
</Card.Root>
