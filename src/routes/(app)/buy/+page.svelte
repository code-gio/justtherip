<script lang="ts">
  import { toast } from "svelte-sonner";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import {
    IconLoader2,
    IconShieldCheck,
    IconBolt,
    IconCreditCard,
    IconCoin,
  } from "@tabler/icons-svelte";

  interface Bundle {
    id: string;
    name: string;
    rips: number;
    price_usd: number;
    discount_percent: number;
  }

  let { data } = $props();
  let { bundles, balance } = $derived(data);

  let purchasingBundleId = $state<string | null>(null);

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

  onMount(() => {
    const canceled = $page.url.searchParams.get("canceled");
    if (canceled) {
      toast.info("Purchase canceled. No charges were made.");
      const url = new URL(window.location.href);
      url.searchParams.delete("canceled");
      window.history.replaceState({}, "", url.toString());
    }
  });

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

<svelte:head>
  <title>Buy Rips | justtherip.gg</title>
</svelte:head>

<div class="container mx-auto max-w-5xl">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Buy Rips</h1>
        <p class="text-muted-foreground mt-1">
          Choose a bundle that fits your needs. Bigger bundles = better savings!
        </p>
      </div>

      <div
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border"
      >
        <IconCoin size={20} class="text-primary" />
        <div class="text-sm">
          <span class="text-muted-foreground">Current Balance:</span>
          <span class="font-semibold ml-1">{balance.toLocaleString()} Rips</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Bundles Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {#each bundles as bundle (bundle.id)}
      {@const discountPercent = bundle.discount_percent || 0}
      {@const isPurchasing = purchasingBundleId === bundle.id}
      {@const isBestValue = bestValueBundleId() === bundle.id}
      {@const isDisabled = purchasingBundleId !== null}

      <button
        class="group relative flex flex-col text-center rounded-2xl p-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
          {isBestValue
          ? 'border-2 border-primary bg-gradient-to-b from-primary/10 to-primary/5 shadow-xl shadow-primary/10 ring-1 ring-primary/20'
          : 'border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'}"
        onclick={() => handlePurchase(bundle.id)}
        disabled={isDisabled}
      >
        {#if isBestValue}
          <span
            class="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 py-1.5 px-4 rounded-full text-xs font-semibold uppercase bg-primary text-primary-foreground shadow-lg"
          >
            Best Value
          </span>
        {/if}

        <div class="flex-1 space-y-5 pt-2">
          <h4
            class="font-medium text-sm text-muted-foreground uppercase tracking-wide"
          >
            {bundle.name}
          </h4>

          <div class="space-y-1">
            <p class="text-3xl font-bold text-primary">
              {bundle.rips.toLocaleString()}
            </p>
            <p class="text-xs text-muted-foreground font-medium">Rips</p>
          </div>

          <div>
            <span class="font-bold text-4xl tracking-tight">
              <span class="text-lg align-top">$</span>{Math.floor(
                bundle.price_usd
              )}<span class="text-lg text-muted-foreground"
                >{(bundle.price_usd % 1).toFixed(2).slice(1)}</span
              >
            </span>
            <p class="text-xs text-muted-foreground mt-1">
              ${getPricePerRip(bundle)} per rip
            </p>
          </div>

          {#if discountPercent > 0}
            <span
              class="inline-block py-1.5 px-3 rounded-full text-xs font-semibold bg-green-500/15 text-green-600 dark:text-green-400"
            >
              Save {discountPercent.toFixed(0)}%
            </span>
          {:else}
            <span class="inline-block py-1.5 px-3 text-xs text-transparent">
              &nbsp;
            </span>
          {/if}
        </div>

        <div
          class="mt-6 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all
            {isBestValue
            ? 'bg-primary text-primary-foreground group-hover:bg-primary/90 shadow-md'
            : 'bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground'}"
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

  <!-- Trust Badges -->
  <div class="rounded-xl border bg-muted/30 p-6">
    <div
      class="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
    >
      <span class="inline-flex items-center gap-2">
        <div class="p-2 rounded-full bg-green-500/10">
          <IconShieldCheck size={18} class="text-green-500" />
        </div>
        <span>Secure checkout</span>
      </span>
      <span class="inline-flex items-center gap-2">
        <div class="p-2 rounded-full bg-amber-500/10">
          <IconBolt size={18} class="text-amber-500" />
        </div>
        <span>Instant delivery</span>
      </span>
      <span class="inline-flex items-center gap-2">
        <div class="p-2 rounded-full bg-blue-500/10">
          <IconCreditCard size={18} class="text-blue-500" />
        </div>
        <span>Powered by Stripe</span>
      </span>
    </div>

    <div class="mt-6 pt-6 border-t text-center">
      <p class="text-xs text-muted-foreground max-w-lg mx-auto">
        Rips are non-refundable and non-withdrawable. By purchasing, you agree
        to our terms of service. All transactions are processed securely through
        Stripe.
      </p>
    </div>
  </div>
</div>

