<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import { IconCheck, IconAlertTriangle } from "@tabler/icons-svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";

  let {
    data,
    onPublish,
  }: {
    data: {
      name: string;
      slug: string;
      description: string;
      image_url: string;
      game: "mtg" | "pokemon";
      rip_cost: number;
      is_active: boolean;
      cards_per_pack: number;
      tierProbabilities: Array<{ tierId: string; tierName: string; probability: number }>;
      tierCards: Record<string, Array<{ cardId: string; weight: number; condition: string; isFoil: boolean }>>;
    };
    onPublish: () => void;
  } = $props();

  // Calculate EV (Estimated Value) - simplified calculation
  function calculateEV(): { floor: number; ceiling: number; estimated: number } {
    // TODO: Calculate based on actual card values and probabilities
    // For now, return mock values
    return {
      floor: 2.50,
      ceiling: 500.00,
      estimated: 15.75,
    };
  }

  const ev = $derived(calculateEV());
  const totalCards = $derived(
    Object.values(data.tierCards).reduce((sum, cards) => sum + cards.length, 0)
  );
</script>

<div class="space-y-6 max-w-3xl mx-auto">
  <div>
    <h2 class="text-xl font-semibold mb-1">Review & Summary</h2>
    <p class="text-sm text-muted-foreground">
      Review your pack configuration before publishing. EV calculations are informational only.
    </p>
  </div>

  <!-- Pack Overview -->
  <Card.Root>
    <Card.Header>
      <div class="flex items-start gap-4">
        {#if data.image_url}
          <img
            src={data.image_url}
            alt={data.name}
            class="w-24 h-24 object-cover rounded-lg"
          />
        {:else}
          <div class="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
            <span class="text-muted-foreground text-xs">No Image</span>
          </div>
        {/if}
        <div class="flex-1">
          <Card.Title class="text-2xl">{data.name}</Card.Title>
          <Card.Description class="mt-2">
            {data.description || "No description"}
          </Card.Description>
          <div class="flex items-center gap-4 mt-4">
            <Badge variant="outline" class="uppercase">{data.game}</Badge>
            <span class="text-sm text-muted-foreground">
              {data.rip_cost} Rips per pack
            </span>
            <Badge variant={data.is_active ? "default" : "secondary"}>
              {data.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>
    </Card.Header>
  </Card.Root>

  <!-- Tier Breakdown -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Tier Structure</Card.Title>
      <Card.Description>
        Probability distribution and card counts per tier
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="space-y-3">
        {#each data.tierProbabilities as tier (tier.tierId)}
          {@const cardCount = data.tierCards[tier.tierId]?.length || 0}
          <div class="flex items-center justify-between p-3 border rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-primary"></div>
              <div>
                <p class="font-medium">{tier.tierName} Tier</p>
                <p class="text-xs text-muted-foreground">
                  {cardCount} {cardCount === 1 ? "card" : "cards"}
                </p>
              </div>
            </div>
            <Badge variant="outline">{tier.probability}%</Badge>
          </div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- EV Summary -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Estimated Value (EV) Summary</Card.Title>
      <Card.Description>
        Informational only - not editable
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-4 border rounded-lg">
          <p class="text-sm text-muted-foreground mb-1">Floor Value</p>
          <p class="text-2xl font-bold">${ev.floor.toFixed(2)}</p>
        </div>
        <div class="text-center p-4 border rounded-lg">
          <p class="text-sm text-muted-foreground mb-1">Estimated EV</p>
          <p class="text-2xl font-bold text-primary">${ev.estimated.toFixed(2)}</p>
        </div>
        <div class="text-center p-4 border rounded-lg">
          <p class="text-sm text-muted-foreground mb-1">Ceiling Value</p>
          <p class="text-2xl font-bold">${ev.ceiling.toFixed(2)}</p>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Statistics -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Pack Statistics</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-muted-foreground">Total Cards in Pool</p>
          <p class="text-2xl font-bold">{totalCards}</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Cards per Pack</p>
          <p class="text-2xl font-bold">{data.cards_per_pack}</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Number of Tiers</p>
          <p class="text-2xl font-bold">{data.tierProbabilities.length}</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Total Probability</p>
          <p class="text-2xl font-bold">
            {data.tierProbabilities.reduce((sum, t) => sum + t.probability, 0).toFixed(1)}%
          </p>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Important Notice -->
  <Alert>
    <IconAlertTriangle size={16} />
    <AlertDescription>
      <strong>Important:</strong> Once published, tier probabilities and card pools cannot be edited.
      To make changes, duplicate the pack and create a new version.
    </AlertDescription>
  </Alert>

  <Separator />

  <div class="flex items-center justify-between">
    <p class="text-sm text-muted-foreground">
      Review all information carefully before publishing.
    </p>
    <Button onclick={onPublish} size="lg" class="gap-2">
      <IconCheck size={18} />
      Publish Pack
    </Button>
  </div>
</div>

