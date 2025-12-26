<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { IconAlertCircle, IconGripVertical, IconTrash } from "@tabler/icons-svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Badge } from "$lib/components/ui/badge";

  interface Step2Data {
    tierProbabilities: Array<{ tierId: string; tierName: string; probability: number }>;
  }

  let {
    data,
    onComplete,
  }: {
    data: {
      game: "mtg" | "pokemon";
      tierProbabilities: Array<{ tierId: string; tierName: string; probability: number }>;
    };
    onComplete: (data: Step2Data) => void;
  } = $props();

  // TODO: Fetch from API - card_tiers table
  const availableTiers = [
    { id: "1", name: "Chase", min_value_cents: 250000, max_value_cents: 1000000 },
    { id: "2", name: "High", min_value_cents: 50000, max_value_cents: 250000 },
    { id: "3", name: "Mid", min_value_cents: 15000, max_value_cents: 50000 },
    { id: "4", name: "Floor", min_value_cents: 2500, max_value_cents: 15000 },
  ];

  let selectedTiers = $state<Array<{
    tierId: string;
    tierName: string;
    probability: number;
    enabled: boolean;
  }>>(
    availableTiers.map((tier) => {
      const existing = data.tierProbabilities.find((tp) => tp.tierId === tier.id);
      return {
        tierId: tier.id,
        tierName: tier.name,
        probability: existing?.probability || 0,
        enabled: existing !== undefined,
      };
    })
  );

  function calculateTotal(): number {
    return selectedTiers
      .filter((t) => t.enabled)
      .reduce((sum, t) => sum + t.probability, 0);
  }

  // Derived errors - computed reactively without side effects
  const errors = $derived.by(() => {
    const errs: Record<string, string> = {};
    const enabledTiers = selectedTiers.filter((t) => t.enabled);

    if (enabledTiers.length < 2) {
      errs.general = "At least 2 tiers must be selected";
    }

    const total = calculateTotal();
    if (Math.abs(total - 100) > 0.01) {
      errs.total = `Total probability must equal 100% (currently ${total.toFixed(2)}%)`;
    }

    for (const tier of enabledTiers) {
      if (tier.probability <= 0) {
        errs[`tier-${tier.tierId}`] = "Probability must be greater than 0%";
      }
    }

    return errs;
  });

  function handleProbabilityChange(tierId: string, value: string) {
    const numValue = parseFloat(value) || 0;
    const tier = selectedTiers.find((t) => t.tierId === tierId);
    if (tier) {
      tier.probability = Math.max(0, Math.min(100, numValue));
    }
  }

  function handleTierToggle(tierId: string) {
    const tier = selectedTiers.find((t) => t.tierId === tierId);
    if (tier) {
      tier.enabled = !tier.enabled;
      if (!tier.enabled) {
        tier.probability = 0;
      }
    }
  }

  function handleRemoveTier(tierId: string) {
    const tier = selectedTiers.find((t) => t.tierId === tierId);
    if (tier) {
      tier.enabled = false;
      tier.probability = 0;
    }
  }

  function handleSubmit() {
    if (isValid) {
      const tierProbabilities = selectedTiers
        .filter((t) => t.enabled)
        .map((t) => ({
          tierId: t.tierId,
          tierName: t.tierName,
          probability: t.probability,
        }));
      onComplete({ tierProbabilities });
    }
  }

  const total = $derived(calculateTotal());
  const isValid = $derived(Object.keys(errors).length === 0);
  const enabledCount = $derived(selectedTiers.filter((t) => t.enabled).length);
</script>

<div class="space-y-6 max-w-2xl mx-auto">
  <div>
    <h2 class="text-xl font-semibold mb-1">Tier Structure</h2>
    <p class="text-sm text-muted-foreground">
      Select which tiers apply to this pack and assign probabilities. Total must equal 100%.
    </p>
  </div>

  <div class="space-y-4">
    {#each selectedTiers as tier (tier.tierId)}
      <div
        class="border rounded-lg p-4 space-y-3"
        class:bg-muted-foreground={tier.enabled}
        class:opacity-50={!tier.enabled}
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <IconGripVertical size={20} class="text-muted-foreground cursor-move" />
            <div class="flex items-center gap-2">
              <Checkbox
                id="tier-{tier.tierId}"
                checked={tier.enabled}
                onCheckedChange={() => handleTierToggle(tier.tierId)}
              />
              <Label for="tier-{tier.tierId}" class="font-semibold text-base cursor-pointer">
                {tier.tierName} Tier
              </Label>
            </div>
          </div>
          {#if tier.enabled}
            <Button
              variant="ghost"
              size="sm"
              onclick={() => handleRemoveTier(tier.tierId)}
            >
              <IconTrash size={16} />
            </Button>
          {/if}
        </div>

        {#if tier.enabled}
          <div class="space-y-2 pl-8">
            <div class="flex items-center gap-2">
              <Label for="prob-{tier.tierId}" class="w-32">Probability:</Label>
              <div class="flex-1 flex items-center gap-2">
                <Input
                  id="prob-{tier.tierId}"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tier.probability.toFixed(1)}
                  oninput={(e) =>
                    handleProbabilityChange(tier.tierId, e.currentTarget.value)}
                  class={errors[`tier-${tier.tierId}`] ? "border-destructive" : ""}
                />
                <span class="text-sm text-muted-foreground w-8">%</span>
              </div>
            </div>
            {#if errors[`tier-${tier.tierId}`]}
              <p class="text-sm text-destructive pl-32">
                {errors[`tier-${tier.tierId}`]}
              </p>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="border-t pt-4 space-y-4">
    <div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <span class="font-semibold">Total Probability:</span>
      <Badge
        variant={Math.abs(total - 100) < 0.01 ? "default" : "destructive"}
        class="text-lg px-3 py-1"
      >
        {total.toFixed(2)}%
      </Badge>
    </div>

    {#if errors.total}
      <Alert variant="destructive">
        <IconAlertCircle size={16} />
        <AlertDescription>{errors.total}</AlertDescription>
      </Alert>
    {/if}

    {#if errors.general}
      <Alert variant="destructive">
        <IconAlertCircle size={16} />
        <AlertDescription>{errors.general}</AlertDescription>
      </Alert>
    {/if}

    {#if enabledCount < 2}
      <Alert>
        <IconAlertCircle size={16} />
        <AlertDescription>
          At least 2 tiers must be enabled for a pack.
        </AlertDescription>
      </Alert>
    {/if}
  </div>

  <div class="flex justify-end pt-4">
    <Button onclick={handleSubmit} disabled={!isValid}>
      Save Tier Structure
    </Button>
  </div>
</div>

