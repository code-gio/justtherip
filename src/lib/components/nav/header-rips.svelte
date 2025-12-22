<script lang="ts">
  import { goto } from "$app/navigation";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import PurchaseRipsDialog from "$lib/components/shared/purchase-rips-dialog.svelte";
  import {
    IconCoin,
    IconPlus,
    IconHistory,
    IconWallet,
  } from "@tabler/icons-svelte";
  import { onMount } from "svelte";

  let { balance = 0 }: { balance?: number } = $props();

  let showPurchaseDialog = $state(false);
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

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" size="sm" class="gap-2">
        <IconCoin size={16} class="text-amber-500" />
        <span class="font-semibold">{balance.toFixed(2)}</span>
        <span class="text-muted-foreground text-xs">Rips</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-48" align="end">
    <DropdownMenu.Label>Your Balance</DropdownMenu.Label>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item onSelect={() => (showPurchaseDialog = true)}>
        <IconPlus size={16} />
        Buy More Rips
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => goto("/wallet")}>
        <IconWallet size={16} />
        Wallet
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => goto("/wallet")}>
        <IconHistory size={16} />
        Transaction History
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<PurchaseRipsDialog bind:open={showPurchaseDialog} {bundles} />

