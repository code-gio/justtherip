<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import { IconCoin, IconLoader2, IconX } from "@tabler/icons-svelte";

  interface Bundle {
    id: string;
    name: string;
    rips: number;
    price_usd: number;
    discount_percent: number;
  }

  let {
    open = $bindable(false),
    bundles = [],
    onPurchaseComplete,
  }: {
    open?: boolean;
    bundles: Bundle[];
    onPurchaseComplete?: () => void;
  } = $props();

  let purchasingBundleId = $state<string | null>(null);

  async function handlePurchase(bundleId: string) {
    try {
      purchasingBundleId = bundleId;

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

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      );
      purchasingBundleId = null;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-4xl">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-2xl">
        <IconCoin size={28} class="text-primary" />
        Purchase Rips
      </Dialog.Title>
      <Dialog.Description>
        Select a bundle to purchase Rips. Larger bundles offer better value!
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid grid-cols-2 gap-4 py-4">
      {#each bundles as bundle (bundle.id)}
        {@const discountPercent = bundle.discount_percent || 0}
        {@const isPurchasing = purchasingBundleId === bundle.id}
        {@const isPopular = discountPercent >= 10}

        <button
          class="relative p-6 rounded-xl border-2 transition-all hover:border-primary hover:shadow-md text-left disabled:opacity-50 disabled:cursor-not-allowed {isPopular ? 'border-primary bg-primary/5' : 'border-border'}"
          onclick={() => handlePurchase(bundle.id)}
          disabled={isPurchasing || purchasingBundleId !== null}
        >
          {#if isPopular}
            <Badge class="absolute -top-2.5 left-1/2 -translate-x-1/2">
              Best Value
            </Badge>
          {/if}

          <div class="text-center space-y-3">
            <div class="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              {#if isPurchasing}
                <IconLoader2 size={24} class="text-primary-foreground animate-spin" />
              {:else}
                <IconCoin size={24} class="text-primary-foreground" />
              {/if}
            </div>

            <div>
              <p class="text-2xl font-bold">{bundle.rips} Rips</p>
              <p class="text-xl font-semibold text-primary">
                ${bundle.price_usd.toFixed(2)}
              </p>
            </div>

            {#if discountPercent > 0}
              <Badge variant="secondary">
                Save {discountPercent.toFixed(0)}%
              </Badge>
            {/if}
          </div>
        </button>
      {/each}
    </div>

    <div class="bg-muted/50 rounded-lg p-4 text-sm">
      <p class="font-medium mb-2">What happens next?</p>
      <ol class="space-y-1 text-muted-foreground">
        <li>1. You'll be redirected to Stripe's secure checkout</li>
        <li>2. Complete your payment with card or other methods</li>
        <li>3. Rips will be added to your account instantly</li>
        <li>4. Start opening packs and winning cards!</li>
      </ol>
    </div>
  </Dialog.Content>
</Dialog.Root>
