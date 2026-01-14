<script lang="ts">
  import { IconDots } from "@tabler/icons-svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { toast } from "svelte-sonner";
  import type { UserWithStats } from "$lib/components/admin/users/types";

  interface Props {
    userId: string;
    user: UserWithStats;
    onViewDetails?: (user: UserWithStats) => void;
  }

  let { userId, user, onViewDetails }: Props = $props();

  function handleViewDetails() {
    onViewDetails?.(user);
  }

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success("User ID copied to clipboard");
    } catch (error) {
      console.error("Failed to copy user ID:", error);
      toast.error("Failed to copy user ID");
    }
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="relative size-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <IconDots />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Group>
      <DropdownMenu.Label>Actions</DropdownMenu.Label>
      <DropdownMenu.Item onclick={handleViewDetails}>
        View Details
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={handleCopyId}>
        Copy User ID
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
