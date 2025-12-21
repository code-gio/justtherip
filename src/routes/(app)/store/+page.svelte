<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import { IconCoin, IconSparkles, IconLoader2 } from "@tabler/icons-svelte";

  let { data } = $props();
  let { bundles, balance } = $derived(data);

  let loadingBundleId = $state<string | null>(null);

  async function purchaseBundle(bundleId: string) {
    try {
      loadingBundleId = bundleId;

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bundle_id: bundleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      );
    } finally {
      loadingBundleId = null;
    }
  }
</script>

<div class="max-w-6xl space-y-6">
  <!-- Balance Display -->
  <Card.Root>
    <Card.Content class="p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-full bg-muted">
            <IconCoin size={32} class="text-foreground" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Your Balance</p>
            <p class="text-3xl font-bold">{balance.toFixed(2)} Rips</p>
          </div>
        </div>
        <IconSparkles size={48} class="text-muted-foreground/20" />
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Bundles Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {#each bundles as bundle (bundle.id)}
      {@const discountPercent = bundle.discount_percent || 0}
      {@const isLoading = loadingBundleId === bundle.id}

      <Card.Root
        class="relative overflow-hidden transition-all hover:shadow-lg hover:scale-105 {discountPercent > 0 ? 'border-primary/50' : ''}"
      >
        {#if discountPercent > 0}
          <Badge class="absolute top-3 right-3">
            Save {discountPercent.toFixed(0)}%
          </Badge>
        {/if}

        <Card.Header class="text-center pb-4">
          <div class="mb-4">
            <div class="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <IconCoin size={32} class="text-primary-foreground" />
            </div>
          </div>
          <Card.Title class="text-2xl">{bundle.rips} Rips</Card.Title>
          <Card.Description class="text-xl font-bold text-primary">
            ${bundle.price_usd.toFixed(2)}
          </Card.Description>
          {#if discountPercent > 0}
            <p class="text-xs text-muted-foreground mt-1">
              ${(bundle.price_usd / bundle.rips).toFixed(2)} per Rip
            </p>
          {/if}
        </Card.Header>

        <Card.Footer class="pt-4">
          <Button
            class="w-full"
            variant={discountPercent > 0 ? "default" : "outline"}
            onclick={() => purchaseBundle(bundle.id)}
            disabled={isLoading}
          >
            {#if isLoading}
              <IconLoader2 class="mr-2 animate-spin" size={16} />
              Processing...
            {:else}
              Purchase
            {/if}
          </Button>
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>

  <!-- Info Section -->
  <Card.Root class="bg-muted/50">
    <Card.Header>
      <Card.Title>How it works</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-background flex-shrink-0">
          <span class="text-foreground font-bold">1</span>
        </div>
        <div>
          <h3 class="font-semibold mb-1">Purchase Rips</h3>
          <p class="text-sm text-muted-foreground">
            Select a bundle above to purchase Rips. Larger bundles offer better
            value!
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-background flex-shrink-0">
          <span class="text-foreground font-bold">2</span>
        </div>
        <div>
          <h3 class="font-semibold mb-1">Open Packs</h3>
          <p class="text-sm text-muted-foreground">
            Use your Rips to open card packs and win valuable cards worth up to
            $500!
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-background flex-shrink-0">
          <span class="text-foreground font-bold">3</span>
        </div>
        <div>
          <h3 class="font-semibold mb-1">Sell Back Cards</h3>
          <p class="text-sm text-muted-foreground">
            Sell cards back for 85% of their value in Rips and keep opening
            packs!
          </p>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</div>
