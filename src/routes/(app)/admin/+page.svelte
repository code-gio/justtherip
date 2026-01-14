<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import {
    IconUsers,
    IconPackages,
    IconCoin,
    IconTruck,
    IconTrendingUp,
    IconActivity,
    IconArrowRight,
    IconPackage,
    IconCreditCard,
    IconUserPlus,
  } from "@tabler/icons-svelte";
  import type { PageData } from "./$types";
  import { adminNav } from "$lib/config";

  let { data }: { data: PageData } = $props();

  const { kpis, recentActivity } = $derived(data);

  function formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatJewels(amount: number): string {
    return amount.toLocaleString();
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "pack_open":
        return IconPackage;
      case "purchase":
        return IconCreditCard;
      case "shipment":
        return IconTruck;
      case "signup":
        return IconUserPlus;
      default:
        return IconActivity;
    }
  }

  function getActivityColor(type: string): string {
    switch (type) {
      case "pack_open":
        return "text-blue-600 dark:text-blue-400";
      case "purchase":
        return "text-green-600 dark:text-green-400";
      case "shipment":
        return "text-orange-600 dark:text-orange-400";
      case "signup":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-muted-foreground";
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
</script>

<div class="container mx-auto px-4 py-8 space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-4xl font-bold">Admin Dashboard</h1>
    <p class="text-muted-foreground mt-2">
      Administrative KPIs including users, packs opened, Jewels spent, and
      pending fulfillment requests. Restricted access.
    </p>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Total Users -->
    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Users</p>
            <p class="text-3xl font-bold mt-2">
              {kpis.totalUsers.toLocaleString()}
            </p>
          </div>
          <div class="p-3 bg-primary/10 rounded-lg">
            <IconUsers class="size-6 text-primary" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Active Users -->
    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Active Users</p>
            <p class="text-3xl font-bold mt-2">
              {kpis.activeUsers7d.toLocaleString()}
              <span class="text-sm text-muted-foreground font-normal">
                / {kpis.activeUsers30d.toLocaleString()}</span
              >
            </p>
            <p class="text-xs text-muted-foreground mt-1">7d / 30d</p>
          </div>
          <div class="p-3 bg-green-500/10 rounded-lg">
            <IconTrendingUp class="size-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Total Packs Opened -->
    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Packs Opened</p>
            <p class="text-3xl font-bold mt-2">
              {kpis.totalPacksOpened.toLocaleString()}
            </p>
          </div>
          <div class="p-3 bg-blue-500/10 rounded-lg">
            <IconPackages class="size-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Total Jewels Spent -->
    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Jewels Spent</p>
            <p class="text-3xl font-bold mt-2">
              {formatJewels(kpis.totalJewelsSpent)}
            </p>
          </div>
          <div class="p-3 bg-purple-500/10 rounded-lg">
            <IconCoin class="size-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Total Revenue -->
    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Revenue</p>
            <p class="text-3xl font-bold mt-2">
              {formatCurrency(kpis.totalRevenue)}
            </p>
          </div>
          <div class="p-3 bg-green-500/10 rounded-lg">
            <IconCreditCard class="size-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Pending Fulfillments -->
    <Card.Root>
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Pending Fulfillments</p>
            <p class="text-3xl font-bold mt-2">{kpis.pendingFulfillments}</p>
            {#if kpis.pendingFulfillments > 0}
              <button
                onclick={() => goto("/admin/fulfillment?status=pending")}
                class="text-xs text-primary hover:underline mt-1"
              >
                View pending →
              </button>
            {/if}
          </div>
          <div class="p-3 bg-orange-500/10 rounded-lg">
            <IconTruck class="size-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Quick Links -->
  <div>
    <h2 class="text-2xl font-semibold mb-4">Quick Links</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each adminNav.filter((item) => item.url !== "/admin") as item}
        <Card.Root
          class="hover:border-primary/50 cursor-pointer transition-colors"
          onclick={() => goto(item.url)}
        >
          <Card.Content class="p-6">
            <div class="flex items-center gap-4">
              <div class="p-2 bg-primary/10 rounded-lg">
                <svelte:component
                  this={item.icon}
                  class="size-5 text-primary"
                />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold">{item.title}</h3>
              </div>
              <IconArrowRight class="size-4 text-muted-foreground" />
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>

  <!-- Recent Activity -->
  <div>
    <h2 class="text-2xl font-semibold mb-4">Recent Activity</h2>
    <Card.Root>
      <Card.Content class="p-6">
        {#if recentActivity.length === 0}
          <div class="text-center py-8 text-muted-foreground">
            <p>No recent activity</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each recentActivity as activity}
              <div
                class="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div class="p-2 bg-muted rounded-lg">
                  <svelte:component
                    this={getActivityIcon(activity.type)}
                    class="size-4 {getActivityColor(activity.type)}"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium">{activity.userName}</span>
                    <Badge variant="outline" class="text-xs">
                      {activity.type.replace("_", " ")}
                    </Badge>
                    <span class="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p class="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                </div>
                {#if activity.value}
                  <div
                    class="text-sm font-semibold {getActivityColor(
                      activity.type
                    )}"
                  >
                    {activity.value}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
