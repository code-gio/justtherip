<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import {
    IconCoin,
    IconReceipt,
    IconArrowUpRight,
    IconArrowDownLeft,
    IconPackage,
    IconCards,
  } from "@tabler/icons-svelte";
  import type { Transaction, FormattedTransaction } from "./types.js";

  let {
    transactions,
    isLoading = false,
  }: {
    transactions: Transaction[];
    isLoading?: boolean;
  } = $props();

  type FilterType = "all" | "purchase" | "pack_open";
  let activeFilter = $state<FilterType>("all");

  function formatTransactionType(
    transaction: Transaction
  ): FormattedTransaction & {
    icon: "purchase" | "pack" | "sellback" | "default";
    initial: string;
  } {
    const amount = transaction.amount;

    if (transaction.type === "purchase") {
      return {
        action: "Rips Purchase",
        description: transaction.metadata?.bundle_id
          ? `${Math.abs(amount)} Rips Bundle`
          : "Rips purchased",
        type: "credit",
        icon: "purchase",
        initial: "R",
      };
    } else if (transaction.type === "pack_open") {
      return {
        action: "Pack Opened",
        description: transaction.metadata?.pack_id || "Pack opened",
        type: "debit",
        icon: "pack",
        initial: "P",
      };
    } else if (transaction.type === "card_sellback") {
      return {
        action: "Card Sold",
        description: `Sold back to store`,
        type: "credit",
        icon: "sellback",
        initial: "C",
      };
    } else {
      return {
        action: "Transaction",
        description: transaction.type,
        type: amount >= 0 ? "credit" : "debit",
        icon: "default",
        initial: "T",
      };
    }
  }

  function formatDateGroup(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Group transactions by date
  function groupByDate(txs: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>();
    for (const tx of txs) {
      const dateKey = new Date(tx.created_at).toDateString();
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(tx);
    }
    return groups;
  }

  // Filter transactions based on selected filter
  let filteredTransactions = $derived(
    activeFilter === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === activeFilter)
  );

  let groupedTransactions = $derived(groupByDate(filteredTransactions));
</script>

<div>
  <!-- Header -->
  <div class="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
    <h2 class="font-semibold text-lg md:text-xl">Transactions</h2>

    <div class="sm:ms-auto">
      <ButtonGroup.Root>
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          class="text-white"
          onclick={() => (activeFilter = "all")}
        >
          All
        </Button>
        <Button
          variant={activeFilter === "purchase" ? "default" : "outline"}
          size="sm"
          class="text-white"
          onclick={() => (activeFilter = "purchase")}
        >
          Purchases
        </Button>
        <Button
          variant={activeFilter === "pack_open" ? "default" : "outline"}
          size="sm"
          class="text-white"
          onclick={() => (activeFilter = "pack_open")}
        >
          Packs Opened
        </Button>
      </ButtonGroup.Root>
    </div>
  </div>

  <!-- Content -->
  {#if isLoading}
    <div class="space-y-6">
      {#each Array(2) as _}
        <div>
          <Skeleton class="h-4 w-32 mb-3" />
          <div class="space-y-2">
            {#each Array(3) as __}
              <div class="flex items-center gap-4 p-3">
                <Skeleton class="size-11 rounded-full" />
                <div class="grow space-y-2">
                  <Skeleton class="h-4 w-32" />
                  <Skeleton class="h-3 w-24" />
                </div>
                <Skeleton class="h-5 w-20" />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else if filteredTransactions.length === 0}
    <Empty.Root class="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconReceipt size={24} />
        </Empty.Media>
        <Empty.Title>
          {activeFilter === "all"
            ? "No Transactions Yet"
            : activeFilter === "purchase"
              ? "No Purchases Yet"
              : "No Packs Opened Yet"}
        </Empty.Title>
        <Empty.Description>
          {activeFilter === "all"
            ? "Your transaction history will appear here once you purchase Rips or open packs."
            : activeFilter === "purchase"
              ? "You haven't purchased any Rips yet."
              : "You haven't opened any packs yet."}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button href={activeFilter === "pack_open" ? "/packs" : "/wallet"}>
          <IconCoin size={18} class="mr-2" />
          {activeFilter === "pack_open" ? "Browse Packs" : "Buy Rips"}
        </Button>
      </Empty.Content>
    </Empty.Root>
  {:else}
    <div class="space-y-6">
      {#each [...groupedTransactions.entries()] as [dateKey, txs] (dateKey)}
        <div>
          <div class="py-2 text-sm text-muted-foreground">
            {formatDateGroup(txs[0].created_at)}
          </div>

          <!-- Transaction List -->
          <div class="-mx-3">
            {#each txs as tx (tx.id)}
              {@const formatted = formatTransactionType(tx)}

              <div
                class="p-3 flex gap-x-4 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <!-- Icon -->
                <span class="shrink-0 relative size-11">
                  <span
                    class="flex shrink-0 justify-center items-center size-11 font-medium uppercase rounded-full {formatted.type ===
                    'credit'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'}"
                  >
                    {#if formatted.icon === "purchase"}
                      <IconCoin size={20} />
                    {:else if formatted.icon === "pack"}
                      <IconPackage size={20} />
                    {:else if formatted.icon === "sellback"}
                      <IconCards size={20} />
                    {:else}
                      {formatted.initial}
                    {/if}
                  </span>

                  <!-- Direction indicator -->
                  <span
                    class="absolute flex shrink-0 justify-center items-center size-5 bottom-0 -end-1 rounded-full {formatted.type ===
                    'credit'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground text-background'}"
                  >
                    {#if formatted.type === "credit"}
                      <IconArrowDownLeft size={12} />
                    {:else}
                      <IconArrowUpRight size={12} />
                    {/if}
                  </span>
                </span>

                <!-- Details -->
                <div class="grow">
                  <div class="flex justify-between items-center gap-x-3">
                    <div>
                      <h4 class="font-medium">
                        {formatted.action}
                      </h4>
                      <ul class="flex flex-wrap text-sm text-muted-foreground">
                        <li
                          class="inline-block relative pe-4 last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:bg-muted-foreground before:rounded-full"
                        >
                          {formatted.type === "credit" ? "Received" : "Spent"}
                        </li>
                        <li
                          class="inline-block relative pe-4 last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:bg-muted-foreground before:rounded-full"
                        >
                          {formatTime(tx.created_at)}
                        </li>
                        {#if formatted.description}
                          <li
                            class="hidden sm:inline-block relative pe-4 last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:bg-muted-foreground before:rounded-full"
                          >
                            {formatted.description}
                          </li>
                        {/if}
                      </ul>
                    </div>

                    <div class="text-end">
                      <p
                        class="whitespace-nowrap font-medium sm:text-lg {formatted.type ===
                        'credit'
                          ? 'text-primary'
                          : ''}"
                      >
                        {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(2)} Rips
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
