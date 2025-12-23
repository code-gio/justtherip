<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import {
    IconLoader2,
    IconCheck,
    IconShieldCheck,
    IconBolt,
    IconCreditCard,
  } from "@tabler/icons-svelte";

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

  // Find the bundle with the highest discount for "Best Value" badge
  const bestValueBundleId = $derived(() => {
    if (bundles.length === 0) return null;
    const sorted = [...bundles].sort(
      (a, b) => (b.discount_percent || 0) - (a.discount_percent || 0)
    );
    return sorted[0]?.discount_percent > 0 ? sorted[0].id : null;
  });

  function getPricePerRip(bundle: Bundle): string {
    return (bundle.price_usd / bundle.rips).toFixed(3);
  }

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
  <Dialog.Content class="p-0 overflow-hidden w-full">
    <div
      class="bg-gradient-to-br from-primary/10 via-background to-background p-6 pb-4"
    >
      <Dialog.Header>
        <Dialog.Title class="text-2xl font-bold">Get More Rips</Dialog.Title>
        <Dialog.Description class="text-muted-foreground">
          Choose a bundle that fits your needs. Bigger bundles = better savings!
        </Dialog.Description>
      </Dialog.Header>
    </div>

    <div class="px-6 pb-2">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {#each bundles as bundle, index (bundle.id)}
          {@const discountPercent = bundle.discount_percent || 0}
          {@const isPurchasing = purchasingBundleId === bundle.id}
          {@const isBestValue = bestValueBundleId() === bundle.id}
          {@const isDisabled = purchasingBundleId !== null}

          <button
            class="group relative flex flex-col text-center rounded-xl p-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
              {isBestValue
              ? 'border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]'
              : 'border border-border hover:border-primary/50 hover:shadow-md'}"
            onclick={() => handlePurchase(bundle.id)}
            disabled={isDisabled}
          >
            {#if isBestValue}
              <span
                class="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-semibold uppercase bg-primary text-primary-foreground"
              >
                Best Value
              </span>
            {/if}

            <div class="flex-1 space-y-4">
              <h4 class="font-medium text-base text-muted-foreground">
                {bundle.name}
              </h4>

              <div>
                <span class="font-bold text-4xl tracking-tight">
                  <span class="text-xl align-top">$</span>{Math.floor(
                    bundle.price_usd
                  )}<span class="text-xl"
                    >{(bundle.price_usd % 1).toFixed(2).slice(1)}</span
                  >
                </span>
              </div>

              <div class="space-y-1">
                <p class="text-2xl font-semibold text-primary">
                  {bundle.rips.toLocaleString()} Rips
                </p>
                <p class="text-xs text-muted-foreground">
                  ${getPricePerRip(bundle)} per rip
                </p>
              </div>

              {#if discountPercent > 0}
                <span
                  class="inline-block py-1 px-2.5 rounded-md text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  Save {discountPercent.toFixed(0)}%
                </span>
              {:else}
                <span
                  class="inline-block py-1 px-2.5 rounded-md text-xs font-medium text-transparent"
                >
                  &nbsp;
                </span>
              {/if}
            </div>

            <div
              class="mt-6 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
              {isBestValue
                ? 'bg-primary text-primary-foreground group-hover:bg-primary/90'
                : 'bg-secondary text-secondary-foreground group-hover:bg-secondary/80'}"
            >
              {#if isPurchasing}
                <IconLoader2 size={18} class="inline animate-spin" />
              {:else}
                Purchase
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </div>

    <div class="px-6 py-4 mt-2 border-t bg-muted/30">
      <div
        class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
      >
        <span class="inline-flex items-center gap-1.5">
          <IconShieldCheck size={14} class="text-green-500" />
          Secure checkout
        </span>
        <span class="inline-flex items-center gap-1.5">
          <IconBolt size={14} class="text-amber-500" />
          Instant delivery
        </span>
        <span class="inline-flex items-center gap-1.5">
          <IconCreditCard size={14} class="text-blue-500" />
          Powered by Stripe
        </span>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
