<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import type { PageData } from "./$types";
  import {
    IconTrendingUp,
    IconPackage,
    IconCoin,
    IconUsers,
    IconCards,
    IconChartLine,
  } from "@tabler/icons-svelte";

  let { data }: { data: PageData } = $props();

  function formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatJewels(amount: number): string {
    return amount.toLocaleString();
  }

  function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }
</script>

<div class="container mx-auto px-4 py-8 space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-4xl font-bold">Analytics & Reports</h1>
    <p class="text-muted-foreground mt-2">
      Comprehensive analytics including pack performance, revenue, user engagement, and card analytics.
    </p>
    <p class="text-sm text-muted-foreground mt-1">
      Date Range: {new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()}
    </p>
  </div>

  <!-- Pack Performance -->
  <div>
    <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">
      <IconPackage class="size-6" />
      Pack Performance
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Most Opened Packs -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Most Opened Packs</Card.Title>
          <Card.Description>Top packs by opening count</Card.Description>
        </Card.Header>
        <Card.Content>
          {#if data.packPerformance.mostOpened.length === 0}
            <p class="text-muted-foreground text-center py-4">No pack openings in this period</p>
          {:else}
            <div class="space-y-3">
              {#each data.packPerformance.mostOpened as pack}
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <p class="font-medium">{pack.packName}</p>
                    <p class="text-sm text-muted-foreground">
                      {pack.openings} openings
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{formatJewels(pack.totalRipsSpent)}</p>
                    <p class="text-xs text-muted-foreground">Rips spent</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>

      <!-- Highest Value Packs -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Highest Value Packs</Card.Title>
          <Card.Description>Top packs by average value</Card.Description>
        </Card.Header>
        <Card.Content>
          {#if data.packPerformance.highestValue.length === 0}
            <p class="text-muted-foreground text-center py-4">No pack openings in this period</p>
          {:else}
            <div class="space-y-3">
              {#each data.packPerformance.highestValue as pack}
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <p class="font-medium">{pack.packName}</p>
                    <p class="text-sm text-muted-foreground">
                      {pack.openings} openings
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{formatCurrency(pack.avgValueCents)}</p>
                    <p class="text-xs text-muted-foreground">Avg value</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  </div>

  <!-- Revenue Analytics -->
  <div>
    <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">
      <IconTrendingUp class="size-6" />
      Revenue Analytics
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Summary -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Revenue Summary</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Total Revenue</span>
            <span class="text-2xl font-bold">{formatCurrency(data.revenue.total)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Avg Transaction</span>
            <span class="text-lg font-semibold">{formatCurrency(data.revenue.avgTransaction)}</span>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Top Spenders -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Top Spending Users</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if data.revenue.topSpenders.length === 0}
            <p class="text-muted-foreground text-center py-4">No purchases in this period</p>
          {:else}
            <div class="space-y-3">
              {#each data.revenue.topSpenders as spender}
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <p class="font-medium">{spender.userName}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{formatJewels(spender.amount)}</p>
                    <p class="text-xs text-muted-foreground">Jewels</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  </div>

  <!-- User Engagement -->
  <div>
    <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">
      <IconUsers class="size-6" />
      User Engagement
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card.Root>
        <Card.Content class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Users</p>
              <p class="text-3xl font-bold mt-2">{data.userEngagement.totalUsers}</p>
            </div>
            <div class="p-3 bg-blue-500/10 rounded-lg">
              <IconUsers class="size-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Content class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Active Users</p>
              <p class="text-3xl font-bold mt-2">{data.userEngagement.activeUsers}</p>
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
              <p class="text-sm text-muted-foreground">Avg Packs/User</p>
              <p class="text-3xl font-bold mt-2">{data.userEngagement.avgPacksPerUser.toFixed(1)}</p>
            </div>
            <div class="p-3 bg-purple-500/10 rounded-lg">
              <IconPackage class="size-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>

  <!-- Card Analytics -->
  <div>
    <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">
      <IconCards class="size-6" />
      Card Analytics
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Most Pulled Cards -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Most Pulled Cards</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if data.cardAnalytics.mostPulled.length === 0}
            <p class="text-muted-foreground text-center py-4">No cards pulled in this period</p>
          {:else}
            <div class="space-y-3">
              {#each data.cardAnalytics.mostPulled as card}
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <p class="font-medium">{card.name}</p>
                    <p class="text-sm text-muted-foreground">
                      Pulled {card.count} times
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{formatCurrency(card.avgValueCents)}</p>
                    <p class="text-xs text-muted-foreground">Avg value</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>

      <!-- Highest Value Cards -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Highest Value Cards</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if data.cardAnalytics.highestValue.length === 0}
            <p class="text-muted-foreground text-center py-4">No cards pulled in this period</p>
          {:else}
            <div class="space-y-3">
              {#each data.cardAnalytics.highestValue as card}
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <p class="font-medium">{card.name}</p>
                    <p class="text-sm text-muted-foreground">
                      Pulled {card.count} times
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{formatCurrency(card.avgValueCents)}</p>
                    <p class="text-xs text-muted-foreground">Avg value</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Sellback Stats -->
    <Card.Root class="mt-6">
      <Card.Header>
        <Card.Title>Sellback Statistics</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 border rounded-lg">
            <p class="text-sm text-muted-foreground">Total Cards Pulled</p>
            <p class="text-2xl font-bold mt-2">{data.cardAnalytics.totalPulled}</p>
          </div>
          <div class="p-4 border rounded-lg">
            <p class="text-sm text-muted-foreground">Cards Sold Back</p>
            <p class="text-2xl font-bold mt-2">{data.cardAnalytics.totalSold}</p>
          </div>
          <div class="p-4 border rounded-lg">
            <p class="text-sm text-muted-foreground">Sellback Rate</p>
            <p class="text-2xl font-bold mt-2">{formatPercent(data.cardAnalytics.sellbackRate)}</p>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>
