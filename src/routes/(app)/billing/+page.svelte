<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { IconLoader2, IconReceipt } from "@tabler/icons-svelte";

  let { data } = $props();
</script>

{#if data.error}
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card.Root class="max-w-md w-full">
      <Card.Content class="p-12 text-center">
        <div class="mb-6">
          <div
            class="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <span class="text-3xl">⚠️</span>
          </div>
        </div>
        <h2 class="text-2xl font-bold mb-2 text-destructive">
          Unable to Access Billing
        </h2>
        <p class="text-muted-foreground mb-6">{data.error}</p>
        <a
          href="/wallet"
          class="text-primary underline hover:text-primary/80"
        >
          Return to Wallet
        </a>
      </Card.Content>
    </Card.Root>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card.Root class="max-w-md w-full">
      <Card.Content class="p-12 text-center">
        <div class="mb-6">
          <IconLoader2 size={64} class="mx-auto text-primary animate-spin" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Redirecting to Billing Portal</h2>
        <p class="text-muted-foreground">
          Please wait while we redirect you to the Stripe Customer Portal...
        </p>
        <div class="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <IconReceipt size={16} />
          <span>Secure billing powered by Stripe</span>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
{/if}
