<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import {
    IconCoin,
    IconPackage,
    IconCards,
    IconTruck,
    IconSparkles,
    IconTrendingUp,
    IconClock,
    IconActivity,
    IconTrophy,
    IconChartLine,
    IconTarget,
    IconFlame,
    IconTrendingDown,
  } from "@tabler/icons-svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { user, stats, balance, recentActivity } = $derived(data);

  // Map activity types to icons
  function getActivityIcon(type: string) {
    switch (type) {
      case "pack_open":
        return IconPackage;
      case "sell":
      case "purchase":
        return IconCoin;
      case "shipment":
        return IconTruck;
      default:
        return IconActivity;
    }
  }

  // Primary stats configuration
  const primaryStats = $derived([
    {
      title: "Packs Opened",
      value: stats?.packsOpened?.toLocaleString() || "0",
      suffix: "total",
      icon: IconPackage,
      trend: `+${stats?.packsThisWeek || 0} this week`,
      trendUp: (stats?.packsThisWeek || 0) > 0,
    },
    {
      title: "Cards Owned",
      value: stats?.cardsOwned?.toLocaleString() || "0",
      suffix: "cards",
      icon: IconCards,
      trend: `${stats?.rareCardsCount || 0} rare+`,
      trendUp: (stats?.rareCardsCount || 0) > 0,
    },
    {
      title: "Inventory Value",
      value: `$${((stats?.inventoryValue || 0) / 100).toFixed(2)}`,
      suffix: "",
      icon: IconTrophy,
      trend: `${stats?.cardsOwned || 0} cards`,
      trendUp: true,
    },
  ]);

  // ROI & Performance stats
  const performanceStats = $derived([
    {
      title: "Total Value Pulled",
      value: `$${((stats?.totalValuePulled || 0) / 100).toFixed(2)}`,
      suffix: "",
      icon: IconChartLine,
      trend: `${stats?.packsOpened || 0} packs`,
      trendUp: true,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Avg Pack Value",
      value: `$${((stats?.averagePackValue || 0) / 100).toFixed(2)}`,
      suffix: "",
      icon: IconTarget,
      trend: `${(stats?.winRate || 0).toFixed(1)}% win rate`,
      trendUp: (stats?.averagePackValue || 0) > 0,
    },
  ]);

  // Activity stats
  const activityStats = $derived([
    {
      title: "Cards Sold",
      value: (stats?.cardsSoldCount || 0).toLocaleString(),
      suffix: "cards",
      icon: IconCoin,
      trend: `+${((stats?.totalRipsFromSellbacks || 0) / 100).toFixed(2)} Rips earned`,
      trendUp: (stats?.cardsSoldCount || 0) > 0,
    },
    {
      title: "Opening Streak",
      value: (stats?.openingStreak || 0).toString(),
      suffix: "days",
      icon: IconFlame,
      trend: stats?.mostOpenedPack || "No favorite pack",
      trendUp: (stats?.openingStreak || 0) > 0,
    },
    {
      title: "Avg Per Week",
      value: (stats?.avgPacksPerWeek || 0).toFixed(1),
      suffix: "packs",
      icon: IconTrendingUp,
      trend: `${(stats?.avgPacksPerDay || 0).toFixed(1)} per day`,
      trendUp: (stats?.avgPacksPerWeek || 0) > 0,
    },
  ]);

  const allStatsList = $derived([
    ...primaryStats,
    ...performanceStats,
    ...activityStats,
  ]);

  const formattedActivity = $derived(
    (recentActivity || []).map((activity) => ({
      ...activity,
      icon: getActivityIcon(activity.type),
    }))
  );
</script>

<div class="space-y-6">
  <header class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-2xl font-semibold tracking-tight">
      Welcome, {user?.name ?? "there"}
    </h1>
    <div class="flex items-center gap-2">
      <Button variant="outline" href="/wallet">
        <IconCoin size={18} class="mr-2" />
        Buy Rips
      </Button>
      <Button href="/packs">
        <IconSparkles size={18} class="mr-2" />
        Start Ripping
      </Button>
    </div>
  </header>

  <div class="grid lg:grid-cols-[7fr_3fr] gap-6">
  <!-- Left (70%): Recent Activity, Rips Summary, Quick Actions -->
  <div class="space-y-6">
    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title>Recent Activity</Card.Title>
      </Card.Header>
      <Card.Content class="space-y-1">
        {#if !formattedActivity || formattedActivity.length === 0}
          <Empty.Root class="py-8">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconActivity size={24} />
              </Empty.Media>
              <Empty.Title>No Recent Activity</Empty.Title>
              <Empty.Description>
                Your recent actions will appear here. Start by opening a pack!
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button href="/packs" size="sm">
                <IconSparkles size={16} class="mr-2" />
                Open a Pack
              </Button>
            </Empty.Content>
          </Empty.Root>
        {:else}
          {#each formattedActivity as activity (activity.id)}
            <div
              class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div class="p-2.5 rounded-full bg-muted">
                <activity.icon size={20} class="text-muted-foreground" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{activity.description}</p>
                <div
                  class="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <IconClock size={14} />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
              <Badge variant="secondary">
                {activity.value}
              </Badge>
            </div>
          {/each}
        {/if}
      </Card.Content>
    </Card.Root>

    {#if stats?.totalRipsSpent || stats?.totalRipsPurchased}
      <Card.Root>
        <Card.Header>
          <Card.Title>Rips Summary</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Purchased</span>
            <span class="text-sm font-semibold">{(stats?.totalRipsPurchased || 0).toFixed(2)} Rips</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Spent on Packs</span>
            <span class="text-sm font-semibold">{(stats?.totalRipsSpent || 0).toFixed(2)} Rips</span>
          </div>
          {#if stats?.totalRipsFromSellbacks}
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">From Sellbacks</span>
              <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                +{(stats.totalRipsFromSellbacks / 100).toFixed(2)} Rips
              </span>
            </div>
          {/if}
          <div class="pt-2 border-t">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Current Balance</span>
              <span class="text-lg font-bold text-primary">{balance || 0} Rips</span>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    {/if}

    <Card.Root>
      <Card.Header>
        <Card.Title>Quick Actions</Card.Title>
      </Card.Header>
      <Card.Content class="space-y-3">
        <Button class="w-full justify-start gap-3 h-12" href="/packs">
          <div class="p-1.5 rounded-md bg-muted">
            <IconSparkles size={18} />
          </div>
          <div class="text-left  text-white">
            <div class="font-medium">Open a Pack</div>
            <div class="text-xs text-muted-foreground">Try your luck!</div>
          </div>
        </Button>

        <Button
          variant="outline"
          class="w-full justify-start gap-3 h-12"
          href="/inventory"
        >
          <div class="p-1.5 rounded-md bg-muted">
            <IconCards size={18} />
          </div>
          <div class="text-left">
            <div class="font-medium">View Inventory</div>
            <div class="text-xs text-muted-foreground">
              {stats?.cardsOwned || 0} cards
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          class="w-full justify-start gap-3 h-12"
          href="/wallet"
        >
          <div class="p-1.5 rounded-md bg-muted">
            <IconCoin size={18} />
          </div>
          <div class="text-left">
            <div class="font-medium">Buy Rips</div>
            <div class="text-xs text-muted-foreground">
              Balance: {balance || 0} Rips
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          class="w-full justify-start gap-3 h-12"
          href="/shipments"
        >
          <div class="p-1.5 rounded-md bg-muted">
            <IconTruck size={18} />
          </div>
          <div class="text-left">
            <div class="font-medium">Track Shipments</div>
            <div class="text-xs text-muted-foreground">
              {stats?.pendingShipments || 0} pending
            </div>
          </div>
        </Button>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Right (30%): Best Pull, Stats, Top Cards, By Game -->
  <div class="space-y-6">
    {#if stats?.bestPull}
      <Card.Root>
        <Card.Header>
          <Card.Title>Best Pull</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="space-y-2">
            <p class="text-lg font-semibold">{stats.bestPull.card_name}</p>
            <p class="text-2xl font-bold text-primary">
              ${((stats.bestPull.value_cents || 0) / 100).toFixed(2)}
            </p>
          </div>
        </Card.Content>
      </Card.Root>
    {/if}

    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title>Stats</Card.Title>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="max-h-[420px] overflow-y-auto">
          {#each allStatsList as stat, i (stat.title)}
            <div
              class="flex items-center gap-4 px-6 py-3 {i < allStatsList.length - 1
                ? 'border-b border-border'
                : ''}"
            >
              <div class="shrink-0 p-2.5 rounded-full bg-muted">
                <stat.icon size={20} class="text-foreground" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-foreground">{stat.title}</p>
                <p class="text-xs text-muted-foreground truncate">{stat.trend}</p>
              </div>
              <div class="shrink-0 text-right">
                <p
                  class="font-semibold tracking-tight {(stat as { color?: string }).color || 'text-foreground'}"
                >
                  {stat.value}{#if stat.suffix}
                    <span class="text-muted-foreground font-normal">
                      {stat.suffix}
                    </span>
                  {/if}
                </p>
                <div
                  class="flex items-center justify-end gap-1 text-xs {stat.trendUp
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'}"
                >
                  {#if stat.trendUp}
                    <IconTrendingUp size={14} />
                  {:else}
                    <IconTrendingDown size={14} />
                  {/if}
                  <span>{stat.trend}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    {#if stats?.topValuableCards && stats.topValuableCards.length > 0}
      <Card.Root>
        <Card.Header>
          <Card.Title>Top Cards</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-2">
          {#each stats.topValuableCards.slice(0, 3) as card}
            <div class="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{card.card_name}</p>
              </div>
              <p class="text-sm font-bold text-primary ml-2">
                ${((card.value_cents || 0) / 100).toFixed(2)}
              </p>
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    {/if}

    {#if stats?.cardsByGame && Object.keys(stats.cardsByGame).length > 0}
      <Card.Root>
        <Card.Header>
          <Card.Title>By Game</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-2">
          {#each Object.entries(stats.cardsByGame) as [game, count]}
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium uppercase">{game}</span>
              <span class="text-sm text-muted-foreground">{count} cards</span>
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    {/if}
  </div>
  </div>
</div>
