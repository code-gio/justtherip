<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import {
    IconSparkles,
    IconLoader2,
    IconPackage,
    IconTrophy,
  } from "@tabler/icons-svelte";
  import { invalidateAll } from "$app/navigation";

  let { data } = $props();
  let { balance, tiers } = $derived(data);

  let isOpening = $state(false);
  let pulledCard = $state<any>(null);
  let showCardReveal = $state(false);

  async function openPack() {
    try {
      if (balance < 1) {
        toast.error("Insufficient Rips! Purchase more from the store.");
        return;
      }

      isOpening = true;
      pulledCard = null;
      showCardReveal = false;

      const response = await fetch("/api/packs/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open pack");
      }

      const result = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 1500));

      pulledCard = result.card;
      showCardReveal = true;

      await invalidateAll();

      toast.success(
        `You pulled a ${result.card.tier_name} worth $${result.card.value_usd}!`
      );
    } catch (error) {
      console.error("Pack opening error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to open pack"
      );
    } finally {
      isOpening = false;
    }
  }
</script>

<div class="max-w-6xl space-y-6">
  <div class="grid md:grid-cols-2 gap-8">
    <!-- Pack Opening Section -->
    <div>
      <Card.Root class="relative overflow-hidden">
        <Card.Header class="text-center">
          <div class="mb-4">
            <div class="mx-auto w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <IconPackage size={48} class="text-primary-foreground" />
            </div>
          </div>
          <Card.Title class="text-2xl">Standard Pack</Card.Title>
          <Card.Description class="text-xl font-bold text-primary">
            1 Rip per pack
          </Card.Description>
        </Card.Header>

        <Card.Content class="space-y-4">
          <div class="text-center text-sm text-muted-foreground">
            <p>Open a pack to receive 1 random card</p>
            <p>Card values range from $0.01 to $500</p>
          </div>

          <Button
            class="w-full"
            onclick={openPack}
            disabled={isOpening || balance < 1}
            size="lg"
          >
            {#if isOpening}
              <IconLoader2 class="mr-2 animate-spin" size={20} />
              Opening Pack...
            {:else}
              <IconSparkles class="mr-2" size={20} />
              Open Pack (1 Rip)
            {/if}
          </Button>

          {#if balance < 1}
            <p class="text-center text-sm text-destructive">
              Insufficient Rips. <a
                href="/store"
                class="underline hover:text-destructive/80">Purchase more</a
              >
            </p>
          {/if}
        </Card.Content>
      </Card.Root>

      <!-- Tier Probabilities -->
      <Card.Root class="mt-6">
        <Card.Header>
          <Card.Title>Tier Probabilities</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-2">
          {#each tiers as tier (tier.id)}
            {@const percentage = (tier.probability * 100).toFixed(2)}
            {@const valueRange = `$${(tier.min_value_cents / 100).toFixed(2)} - $${(tier.max_value_cents / 100).toFixed(2)}`}

            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  style="background-color: {tier.color_hex}"
                ></div>
                <span class="font-medium">{tier.name}</span>
              </div>
              <div class="text-right text-sm">
                <div class="font-bold">{percentage}%</div>
                <div class="text-muted-foreground text-xs">{valueRange}</div>
              </div>
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Card Reveal Section -->
    <div>
      {#if showCardReveal && pulledCard}
        <Card.Root class="relative overflow-hidden animate-in fade-in zoom-in duration-500">
          <Card.Header class="text-center relative z-10">
            <Badge class="mx-auto mb-4 text-lg px-4 py-2">
              {pulledCard.tier_name}
            </Badge>

            <div class="mb-6">
              <div class="mx-auto w-32 h-32 rounded-full bg-primary flex items-center justify-center">
                <IconTrophy size={64} class="text-primary-foreground" />
              </div>
            </div>

            <Card.Title class="text-3xl mb-2">
              ${pulledCard.value_usd}
            </Card.Title>

            {#if pulledCard.card_name}
              <Card.Description class="text-lg">
                {pulledCard.card_name}
              </Card.Description>
            {/if}
          </Card.Header>

          <Card.Content class="space-y-4 relative z-10">
            {#if pulledCard.set_name || pulledCard.rarity}
              <div class="text-center text-sm text-muted-foreground">
                {#if pulledCard.set_name}
                  <p>{pulledCard.set_name}</p>
                {/if}
                {#if pulledCard.rarity}
                  <p>{pulledCard.rarity}</p>
                {/if}
              </div>
            {/if}

            <div class="flex gap-2">
              <Button class="flex-1" variant="outline" onclick={openPack}>
                Open Another
              </Button>
              <Button class="flex-1" href="/inventory">
                View Inventory
              </Button>
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root class="mt-6">
          <Card.Header>
            <Card.Title>What's Next?</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-3 text-sm text-muted-foreground">
            <div class="flex items-start gap-2">
              <span class="text-primary font-bold">•</span>
              <p>
                View your full collection in the <a
                  href="/inventory"
                  class="underline hover:text-primary">Inventory</a
                >
              </p>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-primary font-bold">•</span>
              <p>
                Sell cards back for 85% of their value to get more Rips
              </p>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-primary font-bold">•</span>
              <p>
                Keep opening packs to build your collection and win big!
              </p>
            </div>
          </Card.Content>
        </Card.Root>
      {:else}
        <Card.Root>
          <Card.Header>
            <Card.Title>How It Works</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full bg-muted flex-shrink-0">
                <span class="text-foreground font-bold">1</span>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Open a Pack</h3>
                <p class="text-sm text-muted-foreground">
                  Click "Open Pack" to spend 1 Rip and receive a random card
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full bg-muted flex-shrink-0">
                <span class="text-foreground font-bold">2</span>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Win Valuable Cards</h3>
                <p class="text-sm text-muted-foreground">
                  Cards are drawn based on tier probabilities. Higher tiers
                  are rarer but more valuable!
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full bg-muted flex-shrink-0">
                <span class="text-foreground font-bold">3</span>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Sell or Collect</h3>
                <p class="text-sm text-muted-foreground">
                  Keep rare cards in your collection or sell them back for
                  85% of their value in Rips
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full bg-muted flex-shrink-0">
                <span class="text-foreground font-bold">4</span>
              </div>
              <div>
                <h3 class="font-semibold mb-1">Ultra Chase Limit</h3>
                <p class="text-sm text-muted-foreground">
                  You can only pull 1 Ultra Chase card per day to keep things
                  fair for everyone!
                </p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}
    </div>
  </div>
</div>
