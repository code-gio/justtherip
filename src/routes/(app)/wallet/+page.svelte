<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import PurchaseRipsDialog from "$lib/components/shared/purchase-rips-dialog.svelte";
  import { invalidateAll } from "$app/navigation";
  import {
    IconCoin,
    IconSparkles,
    IconPlus,
    IconMinus,
    IconInfoCircle,
    IconReceipt,
  } from "@tabler/icons-svelte";

  let { data } = $props();
  let { balance, bundles, transactions } = $derived(data);

  let isLoading = $state(false);
  let showPurchaseDialog = $state(false);

  function formatTransactionType(transaction: any): { action: string; description: string; type: "credit" | "debit" } {
    const amount = transaction.amount;

    if (transaction.type === "purchase") {
      return {
        action: "Rips Purchase",
        description: transaction.metadata?.bundle_id ? `${Math.abs(amount)} Rips Bundle` : "Rips purchased",
        type: "credit",
      };
    } else if (transaction.type === "pack_open") {
      return {
        action: "Pack Purchase",
        description: transaction.metadata?.pack_id || "Pack opened",
        type: "debit",
      };
    } else if (transaction.type === "card_sellback") {
      return {
        action: "Card Sell-Back",
        description: `Sold for ${amount.toFixed(2)} Rips`,
        type: "credit",
      };
    } else {
      return {
        action: "Transaction",
        description: transaction.type,
        type: amount >= 0 ? "credit" : "debit",
      };
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }
</script>

<div class="space-y-6 max-w-5xl">
  <!-- Balance Display -->
  <Card.Root>
    <Card.Content class="p-8">
      {#if isLoading}
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left space-y-2">
            <Skeleton class="h-4 w-32 mx-auto md:mx-0" />
            <Skeleton class="h-16 w-48 mx-auto md:mx-0" />
          </div>
          <Skeleton class="h-10 w-32" />
        </div>
      {:else}
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <p class="text-sm font-medium text-muted-foreground mb-2">
              Your Rip Balance
            </p>
            <div class="flex items-baseline gap-3 justify-center md:justify-start">
              <IconCoin size={40} class="text-primary" />
              <span class="text-6xl font-bold tracking-tight">
                {balance.toFixed(2)}
              </span>
              <span class="text-2xl text-muted-foreground">Rips</span>
            </div>
          </div>
          <Button size="lg" href="/packs" class="gap-2">
            <IconSparkles size={20} />
            Open Packs
          </Button>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Important Notice -->
  <Card.Root class="border-destructive/30 bg-destructive/5">
    <Card.Content class="p-4 flex items-start gap-3">
      <IconInfoCircle size={20} class="text-destructive flex-shrink-0 mt-0.5" />
      <div class="text-sm">
        <p class="font-medium text-destructive">Important Information</p>
        <p class="text-muted-foreground">
          Rips are a non-withdrawable virtual currency used exclusively for
          opening card packs on Just the Rip. They cannot be converted to cash
          or transferred to other users.
        </p>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Buy Rips Section -->
  <Card.Root class="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
    <Card.Content class="p-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="text-center md:text-left">
          <h3 class="text-2xl font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
            <IconPlus size={24} class="text-primary" />
            Need More Rips?
          </h3>
          <p class="text-muted-foreground">
            Purchase Rips to open packs and win valuable cards. Larger bundles save you more!
          </p>
        </div>
        <Button size="lg" onclick={() => (showPurchaseDialog = true)} class="gap-2">
          <IconCoin size={20} />
          Buy Rips
        </Button>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Transaction History -->
  <Card.Root>
    <Card.Header>
      <Card.Title class="flex items-center gap-2">
        <IconReceipt size={20} />
        Transaction History
      </Card.Title>
    </Card.Header>
    <Card.Content>
      {#if isLoading}
        <div class="space-y-3">
          {#each Array(5) as _}
            <div class="flex items-center justify-between p-3">
              <div class="space-y-2">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
              </div>
              <Skeleton class="h-5 w-20" />
            </div>
          {/each}
        </div>
      {:else if transactions.length === 0}
        <Empty.Root class="py-12">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconReceipt size={24} />
            </Empty.Media>
            <Empty.Title>No Transactions Yet</Empty.Title>
            <Empty.Description>
              Your transaction history will appear here once you purchase Rips or open packs.
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button href="/store">
              <IconCoin size={18} class="mr-2" />
              Buy Rips
            </Button>
          </Empty.Content>
        </Empty.Root>
      {:else}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Date</Table.Head>
              <Table.Head>Action</Table.Head>
              <Table.Head class="hidden md:table-cell">Description</Table.Head>
              <Table.Head class="text-right">Amount</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each transactions as tx (tx.id)}
              {@const formatted = formatTransactionType(tx)}

              <Table.Row>
                <Table.Cell class="font-medium text-muted-foreground">
                  {formatDate(tx.created_at)}
                </Table.Cell>
                <Table.Cell>
                  <div class="flex items-center gap-2">
                    {#if formatted.type === "credit"}
                      <div class="p-1 rounded bg-primary/20">
                        <IconPlus size={14} class="text-primary" />
                      </div>
                    {:else}
                      <div class="p-1 rounded bg-destructive/20">
                        <IconMinus size={14} class="text-destructive" />
                      </div>
                    {/if}
                    <span class="font-medium">{formatted.action}</span>
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell text-muted-foreground">
                  {formatted.description}
                </Table.Cell>
                <Table.Cell class="text-right">
                  <span class="font-bold {formatted.type === 'credit' ? 'text-primary' : 'text-destructive'}">
                    {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(2)} Rips
                  </span>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      {/if}
    </Card.Content>
  </Card.Root>
</div>

<!-- Purchase Dialog -->
<PurchaseRipsDialog bind:open={showPurchaseDialog} {bundles} />
