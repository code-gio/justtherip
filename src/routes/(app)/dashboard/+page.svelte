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
    IconArrowRight,
    IconActivity,
  } from "@tabler/icons-svelte";

  // Mock state data
  let packsOpened = $state(127);
  let cardsOwned = $state(89);
  let pendingShipments = $state(3);
  let isLoading = $state(true);

  // Mock recent activity
  const recentActivity = $state([
    {
      id: "1",
      type: "pack_open",
      description: "Opened Pokémon Scarlet & Violet Pack",
      timestamp: "2 hours ago",
      icon: IconPackage,
      value: "+1 Rare Card",
    },
    {
      id: "2",
      type: "sell",
      description: "Sold Charizard EX for Rips",
      timestamp: "5 hours ago",
      icon: IconCoin,
      value: "+12.50 Rips",
    },
    {
      id: "3",
      type: "shipment",
      description: "Shipment #1234 marked as shipped",
      timestamp: "1 day ago",
      icon: IconTruck,
      value: "In Transit",
    },
    {
      id: "4",
      type: "pack_open",
      description: "Opened MTG Modern Horizons Pack",
      timestamp: "2 days ago",
      icon: IconPackage,
      value: "+1 Common Card",
    },
    {
      id: "5",
      type: "purchase",
      description: "Purchased 25 Rips Bundle",
      timestamp: "3 days ago",
      icon: IconCoin,
      value: "+25.00 Rips",
    },
  ]);

  // Stats configuration
  const stats = $derived([
    {
      title: "Packs Opened",
      value: packsOpened.toString(),
      suffix: "total",
      icon: IconPackage,
      trend: "+12 this week",
      trendUp: true,
    },
    {
      title: "Cards Owned",
      value: cardsOwned.toString(),
      suffix: "cards",
      icon: IconCards,
      trend: "8 rare+",
      trendUp: true,
    },
    {
      title: "Pending Shipments",
      value: pendingShipments.toString(),
      suffix: "active",
      icon: IconTruck,
      trend: "2 shipped",
      trendUp: false,
    },
  ]);

  // Simulate loading
  $effect(() => {
    const timer = setTimeout(() => {
      isLoading = false;
    }, 800);
    return () => clearTimeout(timer);
  });
</script>

<div class="space-y-6">
  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {#each stats as stat (stat.title)}
      <Card.Root>
        <Card.Content class="p-6">
          {#if isLoading}
            <div class="space-y-3">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-8 w-32" />
              <Skeleton class="h-3 w-20" />
            </div>
          {:else}
            <div class="flex items-start justify-between">
              <div class="space-y-1">
                <p class="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </span>
                  <span class="text-sm text-muted-foreground">
                    {stat.suffix}
                  </span>
                </div>
                <div
                  class="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <IconTrendingUp size={14} />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div class="p-3 rounded-xl bg-muted">
                <stat.icon size={24} class="text-foreground" />
              </div>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    {/each}
  </div>

  <div class="grid lg:grid-cols-3 gap-6">
    <!-- Recent Activity -->
    <div class="lg:col-span-2">
      <Card.Root>
        <Card.Header class="flex flex-row items-center justify-between pb-2">
          <Card.Title>Recent Activity</Card.Title>
          <Button variant="ghost" size="sm" class="gap-1">
            View All
            <IconArrowRight size={16} />
          </Button>
        </Card.Header>
        <Card.Content class="space-y-1">
          {#if isLoading}
            {#each Array(5) as _, i}
              <div class="flex items-center gap-4 p-3">
                <Skeleton class="h-10 w-10 rounded-full" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="h-4 w-3/4" />
                  <Skeleton class="h-3 w-1/4" />
                </div>
                <Skeleton class="h-5 w-20" />
              </div>
            {/each}
          {:else if recentActivity.length === 0}
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
            {#each recentActivity as activity (activity.id)}
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
    </div>

    <!-- Quick Actions -->
    <div class="space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-3">
          <Button class="w-full justify-start gap-3 h-12" href="/packs">
            <div class="p-1.5 rounded-md bg-muted">
              <IconSparkles size={18} />
            </div>
            <div class="text-left">
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
                {cardsOwned} cards
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
              <div class="text-xs text-muted-foreground">Add more balance</div>
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
                {pendingShipments} pending
              </div>
            </div>
          </Button>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
