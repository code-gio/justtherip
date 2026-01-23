<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { IconCheck, IconSparkles, IconLoader2 } from "@tabler/icons-svelte";

  let sessionId = $state($page.url.searchParams.get("session_id"));
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    // Give the webhook a moment to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify the session was successful
    if (!sessionId) {
      error = "No session ID provided";
      loading = false;
      return;
    }

    loading = false;

    // Redirect to wallet after 3 seconds
    setTimeout(() => {
      goto("/wallet");
    }, 3000);
  });
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <Card.Root class="max-w-md w-full">
    {#if loading}
      <Card.Content class="p-12 text-center">
        <div class="mb-6">
          <IconLoader2 size={64} class="mx-auto text-primary animate-spin" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Processing Payment...</h2>
        <p class="text-muted-foreground">
          Please wait while we confirm your purchase
        </p>
      </Card.Content>
    {:else if error}
      <Card.Content class="p-12 text-center">
        <div class="mb-6">
          <div
            class="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <span class="text-3xl">❌</span>
          </div>
        </div>
        <h2 class="text-2xl font-bold mb-2 text-destructive">
          Something Went Wrong
        </h2>
        <p class="text-muted-foreground mb-6">{error}</p>
        <Button onclick={() => goto("/wallet")}>Go to Wallet</Button>
      </Card.Content>
    {:else}
      <Card.Content class="p-12 text-center">
        <div class="mb-6">
          <div
            class="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-500"
          >
            <IconCheck size={40} class="text-primary" />
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-2">Payment Successful! 🎉</h2>
        <p class="text-muted-foreground mb-6">
          Your Rips have been added to your account
        </p>

        <div
          class="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6 mb-6"
        >
          <IconSparkles size={32} class="mx-auto text-primary mb-2" />
          <p class="text-sm text-muted-foreground">
            You can now use your Rips to open packs and win valuable cards!
          </p>
        </div>

        <div class="flex gap-3">
          <Button variant="outline" onclick={() => goto("/wallet")} class="flex-1">
            View Wallet
          </Button>
          <Button onclick={() => goto("/packs")} class="flex-1 text-white">
            <IconSparkles size={18} class="mr-2" />
            Open Packs
          </Button>
        </div>

        <p class="text-xs text-muted-foreground mt-4">
          Redirecting to wallet in 3 seconds...
        </p>
      </Card.Content>
    {/if}
  </Card.Root>
</div>
