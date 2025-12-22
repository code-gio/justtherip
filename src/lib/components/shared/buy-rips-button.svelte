<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import PurchaseRipsDialog from "./purchase-rips-dialog.svelte";
  import { IconCoin } from "@tabler/icons-svelte";
  import { onMount } from "svelte";

  let {
    variant = "default",
    size = "default",
    class: className = "",
  }: {
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    class?: string;
  } = $props();

  let showDialog = $state(false);
  let bundles = $state<any[]>([]);

  async function loadBundles() {
    try {
      const response = await fetch("/api/rips/bundles");
      if (response.ok) {
        const data = await response.json();
        bundles = data.bundles || [];
      }
    } catch (error) {
      console.error("Failed to load bundles:", error);
    }
  }

  onMount(() => {
    loadBundles();
  });
</script>

<Button {variant} {size} class={className} onclick={() => (showDialog = true)}>
  <IconCoin size={18} class="mr-2" />
  Buy Rips
</Button>

<PurchaseRipsDialog bind:open={showDialog} {bundles} />
