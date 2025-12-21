<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import {
    IconCoin,
    IconSparkles,
    IconPlus,
    IconMinus,
    IconInfoCircle,
    IconReceipt,
  } from "@tabler/icons-svelte";

  // Mock state
  let balance = $state(42.5);
  let isLoading = $state(true);

  // Buy Rips options
  const buyOptions = $state([
    { id: "5", rips: 5, price: 5.0, popular: false },
    { id: "10", rips: 10, price: 9.5, popular: true, discount: 5 },
    { id: "25", rips: 25, price: 22.5, popular: false, discount: 10 },
  ]);

  // Mock transaction history
  const transactions = $state([
    {
      id: "1",
      date: "Dec 20, 2025",
      action: "Pack Purchase",
      description: "Pokémon Scarlet & Violet Pack",
      amount: -1.0,
      type: "debit",
    },
    {
      id: "2",
      date: "Dec 20, 2025",
      action: "Card Sell-Back",
      description: "Sold Pikachu VMAX",
      amount: 8.5,
      type: "credit",
    },
    {
      id: "3",
      date: "Dec 19, 2025",
      action: "Pack Purchase",
      description: "MTG Modern Horizons Pack",
      amount: -1.0,
      type: "debit",
    },
    {
      id: "4",
      date: "Dec 19, 2025",
      action: "Pack Purchase",
      description: "Pokémon Base Set Pack",
      amount: -1.0,
      type: "debit",
    },
    {
      id: "5",
      date: "Dec 18, 2025",
      action: "Rips Purchase",
      description: "25 Rips Bundle",
      amount: 25.0,
      type: "credit",
    },
    {
      id: "6",
      date: "Dec 17, 2025",
      action: "Card Sell-Back",
      description: "Sold Charizard EX",
      amount: 12.5,
      type: "credit",
    },
    {
      id: "7",
      date: "Dec 16, 2025",
      action: "Pack Purchase",
      description: "Pokémon Crown Zenith Pack",
      amount: -1.0,
      type: "debit",
    },
    {
      id: "8",
      date: "Dec 15, 2025",
      action: "Sign-Up Bonus",
      description: "Welcome to Just the Rip!",
      amount: 5.0,
      type: "credit",
    },
  ]);

  // Simulate loading
  $effect(() => {
    const timer = setTimeout(() => {
      isLoading = false;
    }, 600);
    return () => clearTimeout(timer);
  });

  function handleBuyRips(optionId: string) {
    const option = buyOptions.find((o) => o.id === optionId);
    if (option) {
      alert(`Demo: Would purchase ${option.rips} Rips for $${option.price.toFixed(2)}`);
    }
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
  <Card.Root>
    <Card.Header>
      <Card.Title class="flex items-center gap-2">
        <IconPlus size={20} />
        Buy Rips
      </Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {#each buyOptions as option (option.id)}
          <button
            class="relative p-6 rounded-xl border-2 transition-all hover:border-primary hover:shadow-md text-left {option.popular ? 'border-primary bg-primary/5' : 'border-border'}"
            onclick={() => handleBuyRips(option.id)}
          >
            {#if option.popular}
              <Badge class="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            {/if}

            <div class="text-center space-y-3">
              <div class="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <IconCoin size={24} class="text-primary-foreground" />
              </div>

              <div>
                <p class="text-2xl font-bold">{option.rips} Rips</p>
                <p class="text-xl font-semibold text-primary">
                  ${option.price.toFixed(2)}
                </p>
              </div>

              {#if option.discount}
                <Badge variant="secondary">
                  Save {option.discount}%
                </Badge>
              {/if}
            </div>
          </button>
        {/each}
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
              <Table.Row>
                <Table.Cell class="font-medium text-muted-foreground">
                  {tx.date}
                </Table.Cell>
                <Table.Cell>
                  <div class="flex items-center gap-2">
                    {#if tx.type === "credit"}
                      <div class="p-1 rounded bg-primary/20">
                        <IconPlus size={14} class="text-primary" />
                      </div>
                    {:else}
                      <div class="p-1 rounded bg-destructive/20">
                        <IconMinus size={14} class="text-destructive" />
                      </div>
                    {/if}
                    <span class="font-medium">{tx.action}</span>
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell text-muted-foreground">
                  {tx.description}
                </Table.Cell>
                <Table.Cell class="text-right">
                  <span class="font-bold {tx.type === 'credit' ? 'text-primary' : 'text-destructive'}">
                    {tx.type === "credit" ? "+" : ""}{tx.amount.toFixed(2)} Rips
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
