<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import type { PageData } from "./$types";
  import {
    IconCoin,
    IconTrendingUp,
    IconTrendingDown,
    IconCreditCard,
    IconPackage,
  } from "@tabler/icons-svelte";

  let { data }: { data: PageData } = $props();

  let transactions = $state(data.transactions || []);

  const typeFilter = $derived(
    ($page.url.searchParams.get("type") as string) || "all"
  );
  const userSearch = $derived($page.url.searchParams.get("user") || "");

  // Update transactions when data changes
  $effect(() => {
    transactions = data.transactions || [];
  });

  function handleTypeChange(type: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    params.set("page", "1");
    goto(`?${params.toString()}`);
  }

  function handleUserSearch(query: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (query.trim()) {
      params.set("user", query);
    } else {
      params.delete("user");
    }
    params.set("page", "1");
    goto(`?${params.toString()}`);
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "purchase":
        return IconCreditCard;
      case "pack_open":
        return IconPackage;
      case "card_sellback":
        return IconCoin;
      default:
        return IconCoin;
    }
  }

  function getTypeColor(type: string): string {
    switch (type) {
      case "purchase":
        return "text-green-600 dark:text-green-400";
      case "pack_open":
        return "text-blue-600 dark:text-blue-400";
      case "card_sellback":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-muted-foreground";
    }
  }

  function formatJewels(amount: number): string {
    return amount.toLocaleString();
  }

</script>

<div class="container mx-auto px-4 py-8 space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-4xl font-bold">Transactions</h1>
    <p class="text-muted-foreground mt-2">
      View all transactions including purchases, pack openings, and card sellbacks.
    </p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Revenue</p>
            <p class="text-2xl font-bold mt-2">
              {formatJewels(data.stats.totalRevenue)}
            </p>
            <p class="text-xs text-muted-foreground mt-1">Jewels purchased</p>
          </div>
          <div class="p-3 bg-green-500/10 rounded-lg">
            <IconTrendingUp class="size-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Spent</p>
            <p class="text-2xl font-bold mt-2">
              {formatJewels(data.stats.totalSpent)}
            </p>
            <p class="text-xs text-muted-foreground mt-1">On pack openings</p>
          </div>
          <div class="p-3 bg-blue-500/10 rounded-lg">
            <IconTrendingDown class="size-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Transactions</p>
            <p class="text-2xl font-bold mt-2">
              {data.stats.totalTransactions.toLocaleString()}
            </p>
            <p class="text-xs text-muted-foreground mt-1">All time</p>
          </div>
          <div class="p-3 bg-purple-500/10 rounded-lg">
            <IconCoin class="size-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Filters -->
  <div class="flex flex-col sm:flex-row gap-4">
    <div class="flex-1">
      <Input
        placeholder="Search by user name or email..."
        value={userSearch}
        oninput={(e) => handleUserSearch(e.currentTarget.value)}
        class="w-full"
      />
    </div>
    <Select.Root
      selected={{
        value: typeFilter,
        label:
          typeFilter === "all"
            ? "All Types"
            : typeFilter
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
      }}
      onSelectedChange={(selected) => {
        if (selected) handleTypeChange(selected.value);
      }}
    >
      <Select.Trigger class="w-[180px]">
        <Select.Value placeholder="Filter by type" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">All Types</Select.Item>
        <Select.Item value="purchase">Purchase</Select.Item>
        <Select.Item value="pack_open">Pack Open</Select.Item>
        <Select.Item value="card_sellback">Card Sellback</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <!-- Transactions Table -->
  {#if transactions.length === 0}
    <Card.Root>
      <Card.Content class="p-12 text-center">
        <p class="text-muted-foreground">No transactions found.</p>
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root>
      <Card.Content class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-4 font-semibold">Date</th>
                <th class="text-left p-4 font-semibold">User</th>
                <th class="text-left p-4 font-semibold">Type</th>
                <th class="text-left p-4 font-semibold">Amount</th>
                <th class="text-left p-4 font-semibold">Balance After</th>
                <th class="text-left p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {#each transactions as tx}
                <tr class="border-b hover:bg-muted/50">
                  <td class="p-4 text-sm">{tx.formattedDate}</td>
                  <td class="p-4">
                    <div>
                      <div class="font-medium">{tx.userName}</div>
                      {#if tx.userEmail}
                        <div class="text-sm text-muted-foreground">
                          {tx.userEmail}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td class="p-4">
                    <Badge variant="outline" class={getTypeColor(tx.type)}>
                      <svelte:component
                        this={getTypeIcon(tx.type)}
                        class="size-3 mr-1"
                      />
                      {tx.type.replace("_", " ")}
                    </Badge>
                  </td>
                  <td class="p-4">
                    <span
                      class="font-semibold {tx.type === 'purchase' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}"
                    >
                      {tx.type === "purchase" ? "+" : "-"}
                      {formatJewels(Math.abs(tx.amount))}
                    </span>
                  </td>
                  <td class="p-4 text-sm text-muted-foreground">
                    {formatJewels(tx.balanceAfter || 0)}
                  </td>
                  <td class="p-4 text-sm text-muted-foreground">
                    {tx.reason || "-"}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card.Root>
  {/if}

  <!-- Pagination -->
  {#if data.hasMore || data.page > 1}
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Page {data.page} of {Math.ceil(data.total / data.limit)}
      </p>
      <div class="flex gap-2">
        {#if data.page > 1}
          <Button
            variant="outline"
            onclick={() => {
              const params = new URLSearchParams($page.url.searchParams);
              params.set("page", String(data.page - 1));
              goto(`?${params.toString()}`);
            }}
          >
            Previous
          </Button>
        {/if}
        {#if data.hasMore}
          <Button
            variant="outline"
            onclick={() => {
              const params = new URLSearchParams($page.url.searchParams);
              params.set("page", String(data.page + 1));
              goto(`?${params.toString()}`);
            }}
          >
            Next
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</div>
