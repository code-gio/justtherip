<script lang="ts">
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { IconAlertTriangle, IconLogout, IconLoader2 } from "@tabler/icons-svelte";

  let loading = $state(false);

  const handleSignOut: SubmitFunction = () => {
    loading = true;
    return async ({ update }) => {
      loading = false;
      update();
    };
  };
</script>

<Card.Root class="border-destructive/50">
  <Card.Header>
    <Card.Title class="flex items-center gap-2 text-destructive">
      <IconAlertTriangle size={20} />
      Danger Zone
    </Card.Title>
    <Card.Description>
      Irreversible and destructive actions.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" action="?/signout" use:enhance={handleSignOut}>
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm font-medium">Sign Out</p>
          <p class="text-xs text-muted-foreground">
            Sign out of your account on this device.
          </p>
        </div>
        <Button
          variant="destructive"
          type="submit"
          disabled={loading}
          class="gap-2"
        >
          {#if loading}
            <IconLoader2 size={16} class="animate-spin" />
          {:else}
            <IconLogout size={16} />
          {/if}
          Sign Out
        </Button>
      </div>
    </form>
  </Card.Content>
</Card.Root>

