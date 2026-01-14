<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { IconCopy, IconTrophy, IconPackage, IconCoin, IconChartLine } from "@tabler/icons-svelte";
  import type { UserWithStats } from "./types";

  interface Props {
    open?: boolean;
    user: UserWithStats | null;
    onClose?: () => void;
  }

  let { open = $bindable(false), user, onClose }: Props = $props();

  let recentTransactions = $state<any[]>([]);
  let loadingTransactions = $state(false);

  async function loadUserTransactions() {
    if (!user) return;

    try {
      loadingTransactions = true;
      const response = await fetch(`/api/admin/users/${user.id}/transactions`);
      if (response.ok) {
        const data = await response.json();
        recentTransactions = data.transactions || [];
      }
    } catch (error) {
      console.error("Error loading user transactions:", error);
    } finally {
      loadingTransactions = false;
    }
  }

  $effect(() => {
    if (open && user) {
      loadUserTransactions();
    }
  });

  function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(cents / 100);
  }

  function formatCurrencyFromRips(rips: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(rips);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  const netProfitLoss = $derived(
    user ? user.inventory_value_cents + (user.current_balance * 100) - (user.total_spent * 100) : 0
  );

  const roiPercentage = $derived(
    user && user.total_spent > 0
      ? ((netProfitLoss / (user.total_spent * 100)) * 100)
      : 0
  );

</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
    {#if user}
      <Dialog.Header>
        <Dialog.Title class="flex items-center gap-3">
          {#if user.avatar_url}
            <img src={user.avatar_url} alt={user.display_name || user.username} class="size-12 rounded-full" />
          {:else}
            <div class="size-12 rounded-full bg-muted flex items-center justify-center">
              <span class="text-lg font-medium">{(user.display_name || user.username).charAt(0).toUpperCase()}</span>
            </div>
          {/if}
          <div>
            <div class="text-xl font-semibold">{user.display_name || user.username}</div>
            <div class="text-sm text-muted-foreground">@{user.username}</div>
          </div>
          {#if user.is_admin}
            <Badge variant="default">Admin</Badge>
          {/if}
        </Dialog.Title>
        <Dialog.Description>
          User profile and statistics
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-6 mt-4">
        <!-- Profile Section -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Profile Information</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm font-medium text-muted-foreground">Email</div>
                <div class="flex items-center gap-2">
                  <span>{user.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-6"
                    onclick={() => copyToClipboard(user.email)}
                  >
                    <IconCopy class="size-3" />
                  </Button>
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-muted-foreground">User ID</div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs">{user.id}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-6"
                    onclick={() => copyToClipboard(user.id)}
                  >
                    <IconCopy class="size-3" />
                  </Button>
                </div>
              </div>
              {#if user.display_name}
                <div>
                  <div class="text-sm font-medium text-muted-foreground">Display Name</div>
                  <div>{user.display_name}</div>
                </div>
              {/if}
              <div>
                <div class="text-sm font-medium text-muted-foreground">Profile Visibility</div>
                <Badge variant="outline">{user.profile_visibility}</Badge>
              </div>
              {#if user.bio}
                <div class="col-span-2">
                  <div class="text-sm font-medium text-muted-foreground">Bio</div>
                  <div>{user.bio}</div>
                </div>
              {/if}
              {#if user.stripe_customer_id}
                <div class="col-span-2">
                  <div class="text-sm font-medium text-muted-foreground">Stripe Customer ID</div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs">{user.stripe_customer_id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="size-6"
                      onclick={() => copyToClipboard(user.stripe_customer_id!)}
                    >
                      <IconCopy class="size-3" />
                    </Button>
                  </div>
                </div>
              {/if}
              <div>
                <div class="text-sm font-medium text-muted-foreground">Created</div>
                <div class="text-sm">{formatDate(user.created_at)}</div>
              </div>
              <div>
                <div class="text-sm font-medium text-muted-foreground">Last Updated</div>
                <div class="text-sm">{formatDate(user.updated_at)}</div>
              </div>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Statistics Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card.Root>
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <IconPackage class="size-5" />
                Pack Statistics
              </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Total Packs Opened</span>
                <span class="font-medium">{user.total_packs_opened.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Best Pull Value</span>
                <span class="font-medium">{formatCurrency(user.best_pull_value_cents)}</span>
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <IconTrophy class="size-5" />
                Inventory
              </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Cards Owned</span>
                <span class="font-medium">{user.inventory_card_count.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Total Value</span>
                <span class="font-medium">{formatCurrency(user.inventory_value_cents)}</span>
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <IconCoin class="size-5" />
                Wallet
              </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Current Balance</span>
                <span class="font-medium">{formatCurrencyFromRips(user.current_balance)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Total Purchased</span>
                <span class="font-medium">{formatCurrencyFromRips(user.total_purchased)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Total Spent</span>
                <span class="font-medium">{formatCurrencyFromRips(user.total_spent)}</span>
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <IconChartLine class="size-5" />
                ROI Metrics
              </Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Net P&L</span>
                <span class="font-medium" class:text-destructive={netProfitLoss < 0} class:text-emerald-600={netProfitLoss >= 0}>
                  {formatCurrency(netProfitLoss)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">ROI Percentage</span>
                <span class="font-medium" class:text-destructive={roiPercentage < 0} class:text-emerald-600={roiPercentage >= 0}>
                  {roiPercentage.toFixed(1)}%
                </span>
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        <!-- Recent Activity -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Recent Transactions</Card.Title>
          </Card.Header>
          <Card.Content>
            {#if loadingTransactions}
              <div class="text-center py-4 text-muted-foreground">Loading...</div>
            {:else if recentTransactions.length === 0}
              <div class="text-center py-4 text-muted-foreground">No transactions found</div>
            {:else}
              <div class="space-y-2">
                {#each recentTransactions as transaction (transaction.id)}
                  <div class="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div class="font-medium capitalize">{transaction.type}</div>
                      <div class="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-medium" class:text-destructive={transaction.amount < 0} class:text-emerald-600={transaction.amount >= 0}>
                        {transaction.amount >= 0 ? '+' : ''}{formatCurrencyFromRips(transaction.amount)}
                      </div>
                      <div class="text-sm text-muted-foreground">Balance: {formatCurrencyFromRips(transaction.balance_after)}</div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => { open = false; onClose?.(); }}>
          Close
        </Button>
      </Dialog.Footer>
    {:else}
      <Dialog.Header>
        <Dialog.Title>User Details</Dialog.Title>
      </Dialog.Header>
      <Dialog.Description>No user selected</Dialog.Description>
      <Dialog.Footer>
        <Button variant="outline" onclick={() => { open = false; onClose?.(); }}>
          Close
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
