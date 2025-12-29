<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Label } from "$lib/components/ui/label";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Separator } from "$lib/components/ui/separator";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import PackStatusSidebar from "$lib/components/admin/packs/pack-status-sidebar.svelte";
  import CardAssignmentPanel from "$lib/components/admin/packs/card-assignment-panel.svelte";
  import { toast } from "svelte-sonner";
  import {
    IconArrowLeft,
    IconAlertCircle,
  } from "@tabler/icons-svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const packId = $page.params.id;

  // Database types
  interface CardTier {
    id: string;
    name: string;
    min_value_cents: number;
    max_value_cents: number;
    default_probability: number;
    sort_order: number;
  }

  interface PackTier {
    tier_id: string;
    probability: number;
  }

  interface PackCard {
    card_uuid: string;
    tier_id: string;
    odds: number;
    market_value: number;
    is_foil: boolean;
    condition: string;
    cardData?: {
      id: string;
      name?: string;
      image_uri?: {
        small?: string;
        normal?: string;
        large?: string;
        png?: string;
        art_crop?: string;
        border_crop?: string;
      } | string | null;
      prices?: {
        usd?: string;
        usd_foil?: string;
        eur?: string;
      };
      market_value_cents?: number;
      set_code?: string;
      set_name?: string;
      rarity?: string;
    } | null;
  }

  // Initialize from server data
  let packData = $state({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    game_code: "",
    rip_cost: 1,
    is_active: false,
  });

  let cardTiers = $state<CardTier[]>([]);
  let packTiers = $state<PackTier[]>([]);
  let packCards = $state<PackCard[]>([]);

  // Initialize from server data
  $effect(() => {
    if (data.pack) {
      packData.name = data.pack.name || "";
      packData.slug = data.pack.slug || "";
      packData.description = data.pack.description || "";
      packData.image_url = data.pack.image_url || "";
      packData.game_code = data.pack.game_code || "";
      packData.rip_cost = data.pack.rip_cost || 1;
      packData.is_active = data.pack.is_active || false;
    }

    if (data.cardTiers) {
      cardTiers = data.cardTiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        min_value_cents: tier.min_value_cents,
        max_value_cents: tier.max_value_cents,
        default_probability: tier.default_probability,
        sort_order: tier.sort_order,
      }));
    }

    if (data.packTiers) {
      packTiers = data.packTiers.map(pt => ({
        tier_id: pt.tier_id,
        probability: pt.probability,
      }));
    }

    if (data.packCards) {
      packCards = data.packCards.map(pc => ({
        card_uuid: pc.card_uuid,
        tier_id: pc.tier_id,
        odds: pc.odds,
        market_value: pc.market_value,
        is_foil: pc.is_foil,
        condition: pc.condition,
        cardData: pc.cardData || null,
      }));
    }
  });

  let selectedTierId = $state<string>("");
  let errors = $state<Record<string, string>>({});
  let isLoading = $state(false);

  // Initialize packTiers with default probabilities if empty
  $effect(() => {
    if (packTiers.length === 0 && cardTiers.length > 0) {
      packTiers = cardTiers.map(tier => ({
        tier_id: tier.id,
        probability: tier.default_probability,
      }));
    }

    // Set initial selected tier to first enabled tier
    const firstEnabledTier = packTiers.find(pt => pt.probability > 0);
    if (firstEnabledTier && !selectedTierId) {
      selectedTierId = firstEnabledTier.tier_id;
    }
  });

  // Computed states
  const enabledTiers = $derived(packTiers.filter(pt => pt.probability > 0));

  const totalProbability = $derived(
    packTiers.reduce((sum, pt) => sum + pt.probability, 0)
  );

  const validation = $derived({
    generalInfoComplete: !!packData.name && !!packData.slug && packData.rip_cost > 0,
    ripCostValid: packData.rip_cost > 0 && Number.isInteger(packData.rip_cost),
    tiersSelected: enabledTiers.length >= 1,
    tierProbabilitiesValid: Math.abs(totalProbability - 1.0) < 0.0001,
    cardsAssigned: enabledTiers.every(tier =>
      packCards.some(pc => pc.tier_id === tier.tier_id)
    ),
  });

  const canPublish = $derived(
    validation.generalInfoComplete &&
    validation.ripCostValid &&
    validation.tiersSelected &&
    validation.tierProbabilitiesValid &&
    validation.cardsAssigned
  );

  // Ensure selectedTierId is always valid
  $effect(() => {
    if (enabledTiers.length > 0) {
      const isSelectedTierEnabled = enabledTiers.some(tier => tier.tier_id === selectedTierId);
      if (!isSelectedTierEnabled) {
        selectedTierId = enabledTiers[0].tier_id;
      }
    } else if (selectedTierId) {
      selectedTierId = "";
    }
  });

  // Tier management
  function getTierProbability(tierId: string): number {
    const packTier = packTiers.find(pt => pt.tier_id === tierId);
    return packTier ? packTier.probability * 100 : 0; // Convert to percentage for display
  }

  function setTierProbability(tierId: string, percentage: number) {
    const probability = percentage / 100; // Convert from percentage to decimal
    const existing = packTiers.find(pt => pt.tier_id === tierId);

    if (existing) {
      existing.probability = probability;
    } else {
      packTiers.push({ tier_id: tierId, probability });
    }
  }

  function toggleTier(tierId: string) {
    const packTier = packTiers.find(pt => pt.tier_id === tierId);
    const tier = cardTiers.find(t => t.id === tierId);

    if (!tier) return;

    if (packTier && packTier.probability > 0) {
      // Disable tier
      packTier.probability = 0;
    } else if (packTier) {
      // Re-enable with default
      packTier.probability = tier.default_probability;
    } else {
      // Add tier with default
      packTiers.push({
        tier_id: tierId,
        probability: tier.default_probability,
      });
    }
  }

  // Card assignment handlers
  function handleAddCard(card: any, tierId: string) {
    const tier = cardTiers.find(t => t.id === tierId);
    if (!tier) return;

    // Check if card already assigned to ANY tier
    const existingCard = packCards.find(pc => pc.card_uuid === card.id);
    if (existingCard) {
      errors.general = "Card is already assigned to another tier";
      return;
    }

    // Get price from card (handle both MTG JSONB and other games)
    let priceCents = 0;
    if (packData.game_code === "mtg" && card.prices) {
      const usd = parseFloat(card.prices.usd || "0");
      const usdFoil = parseFloat(card.prices.usd_foil || "0");
      priceCents = Math.max(usd, usdFoil) * 100;
    } else {
      priceCents = card.market_value_cents || 0;
    }

    packCards.push({
      card_uuid: card.id,
      tier_id: tierId,
      odds: 1,
      market_value: priceCents,
      is_foil: packData.game_code === "mtg" && !!card.prices?.usd_foil,
      condition: "NM",
    });

    errors.general = "";
  }

  function handleRemoveCard(cardId: string) {
    packCards = packCards.filter(pc => pc.card_uuid !== cardId);
  }

  function handleUpdateCardOdds(cardId: string, odds: number) {
    const card = packCards.find(pc => pc.card_uuid === cardId);
    if (card) {
      card.odds = Math.max(1, Math.floor(odds));
    }
  }

  function getTierCards(tierId: string) {
    return packCards.filter(pc => pc.tier_id === tierId);
  }


  // Save pack (draft)
  async function handleSave() {
    isLoading = true;
    errors = {};

    const formData = new FormData();
    formData.append("name", packData.name);
    formData.append("slug", packData.slug);
    formData.append("description", packData.description);
    formData.append("image_url", packData.image_url);
    formData.append("game_code", packData.game_code);
    formData.append("rip_cost", packData.rip_cost.toString());

    // Include enabled tiers with display order
    const enabledPackTiers = packTiers
      .filter(pt => pt.probability > 0)
      .map((pt, index) => ({
        tier_id: pt.tier_id,
        probability: pt.probability,
        display_order: index,
      }));
    formData.append("pack_tiers", JSON.stringify(enabledPackTiers));

    // Include pack cards
    formData.append("pack_cards", JSON.stringify(packCards));

    try {
      const response = await fetch(`?/save`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.type === "success") {
        toast.success("Pack saved successfully", {
          description: "Your draft has been saved to the database.",
        });
      } else {
        const errorMessage = (result.data as { error?: string })?.error || "Failed to save pack";
        errors.general = errorMessage;
        toast.error("Failed to save pack", {
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save pack";
      errors.general = errorMessage;
      toast.error("Failed to save pack", {
        description: errorMessage,
      });
    } finally {
      isLoading = false;
    }
  }

  // Publish pack
  async function handlePublish() {
    if (!canPublish) return;

    isLoading = true;

    try {
      const formData = new FormData();
      formData.append("name", packData.name);
      formData.append("slug", packData.slug);
      formData.append("description", packData.description);
      formData.append("image_url", packData.image_url);
      formData.append("game_code", packData.game_code);
      formData.append("rip_cost", packData.rip_cost.toString());

      // Include enabled tiers with display order
      const enabledPackTiers = packTiers
        .filter(pt => pt.probability > 0)
        .map((pt, index) => ({
          tier_id: pt.tier_id,
          probability: pt.probability,
          display_order: index,
        }));
      formData.append("pack_tiers", JSON.stringify(enabledPackTiers));

      // Include pack cards
      formData.append("pack_cards", JSON.stringify(packCards));

      const response = await fetch(`?/publish`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.type === "success") {
        packData.is_active = true;
        toast.success("Pack published successfully", {
          description: "Your pack is now live and available to users.",
        });
      } else {
        const errorMessage = result.data?.error || "Failed to publish pack";
        errors.general = errorMessage;
        toast.error("Failed to publish pack", {
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to publish pack";
      errors.general = errorMessage;
      toast.error("Failed to publish pack", {
        description: errorMessage,
      });
    } finally {
      isLoading = false;
    }
  }

  // Unpublish pack
  async function handleUnpublish() {
    isLoading = true;

    try {
      const formData = new FormData();
      const response = await fetch(`?/unpublish`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.type === "success") {
        packData.is_active = false;
        toast.success("Pack unpublished successfully", {
          description: "Your pack is no longer available to users.",
        });
      } else {
        const errorMessage = result.data?.error || "Failed to unpublish pack";
        errors.general = errorMessage;
        toast.error("Failed to unpublish pack", {
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unpublish pack";
      errors.general = errorMessage;
      toast.error("Failed to unpublish pack", {
        description: errorMessage,
      });
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container mx-auto ">
  <!-- Header -->
  <div class="flex items-center gap-4 mb-6">
    <Button variant="outline" size="icon" onclick={() => goto("/admin/packs")}>
      <IconArrowLeft size={18} />
    </Button>
    <div class="flex-1">
      <h1 class="text-2xl font-bold">Pack Editor</h1>
      <p class="text-muted-foreground ">
        Configure all pack settings, tiers, and card assignments
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- LEFT SIDEBAR - Status & Validation -->
    <div class="lg:col-span-1">
      <PackStatusSidebar
        packName={packData.name}
        isDraft={!packData.is_active}
        {validation}
        {canPublish}
        {isLoading}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    </div>

    <!-- MAIN CONTENT -->
    <div class="lg:col-span-3 space-y-6">
      <!-- SECTION A - General Info -->
      <Card.Root>
        <Card.Header>
          <Card.Title>General Information</Card.Title>
          <Card.Description>Basic pack details</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Pack Name *</Label>
              <Input
                id="name"
                bind:value={packData.name}
                placeholder="e.g., Standard Pack"
                class={errors.name ? "border-destructive" : ""}
              />
              {#if errors.name}
                <p class="text-sm text-destructive">{errors.name}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="slug">Slug *</Label>
              <Input
                id="slug"
                bind:value={packData.slug}
                placeholder="e.g., standard-pack"
                class={errors.slug ? "border-destructive" : ""}
              />
              {#if errors.slug}
                <p class="text-sm text-destructive">{errors.slug}</p>
              {/if}
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              bind:value={packData.description}
              rows={3}
              placeholder="Describe what makes this pack special..."
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="image_url">Pack Image URL</Label>
              <Input
                id="image_url"
                bind:value={packData.image_url}
                type="url"
                placeholder="https://example.com/pack-image.jpg"
              />
            </div>

            <div class="space-y-2">
              <Label for="rip_cost">Rip Cost *</Label>
              <Input
                id="rip_cost"
                type="number"
                min="1"
                step="1"
                bind:value={packData.rip_cost}
                class={errors.rip_cost ? "border-destructive" : ""}
              />
              {#if errors.rip_cost}
                <p class="text-sm text-destructive">{errors.rip_cost}</p>
              {/if}
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- SECTION B - Tier Configuration -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Tier Structure</Card.Title>
          <Card.Description>
            Configure tier probabilities. Total must equal 100%.
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            {#each cardTiers as tier}
              {@const probability = getTierProbability(tier.id)}
              {@const enabled = probability > 0}
              <div
                class="border rounded-lg p-4"
                class:opacity-50={!enabled}
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <Checkbox
                      checked={enabled}
                      onCheckedChange={() => toggleTier(tier.id)}
                    />
                    <div>
                      <p class="font-semibold">{tier.name}</p>
                      <p class="text-xs text-muted-foreground">
                        ${(tier.min_value_cents / 100).toFixed(2)} - ${(tier.max_value_cents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {#if enabled}
                  <div class="flex items-center gap-2 pl-8">
                    <Label class="w-24">Probability:</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={probability.toFixed(2)}
                      oninput={(e) => setTierProbability(tier.id, parseFloat(e.currentTarget.value) || 0)}
                      class="w-24"
                    />
                    <span class="text-sm text-muted-foreground">%</span>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <Separator />

          <div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <span class="font-semibold">Total Probability:</span>
            <span class="text-lg font-bold" class:text-green-600={validation.tierProbabilitiesValid} class:text-destructive={!validation.tierProbabilitiesValid}>
              {(totalProbability * 100).toFixed(2)}%
            </span>
          </div>

          {#if !validation.tierProbabilitiesValid}
            <Alert variant="destructive">
              <IconAlertCircle size={16} />
              <AlertDescription>
                Total probability must equal 100%. Currently: {(totalProbability * 100).toFixed(2)}%
              </AlertDescription>
            </Alert>
          {/if}
        </Card.Content>
      </Card.Root>

      <!-- SECTION C - Card Assignment -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Card Assignment</Card.Title>
          <Card.Description>
            Assign cards to each enabled tier (filtered by value range)
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <Tabs.Root bind:value={selectedTierId}>
            <Tabs.List class="grid w-full" style="grid-template-columns: repeat({enabledTiers.length || 1}, 1fr);">
              {#each enabledTiers as packTier}
                {@const tier = cardTiers.find(t => t.id === packTier.tier_id)}
                {#if tier}
                  <Tabs.Trigger value={tier.id} class="text-xs">
                    {tier.name}
                    <span class="ml-1 text-muted-foreground">
                      ({getTierCards(tier.id).length})
                    </span>
                  </Tabs.Trigger>
                {/if}
              {/each}
            </Tabs.List>

            {#each enabledTiers as packTier}
              {@const tier = cardTiers.find(t => t.id === packTier.tier_id)}
              {#if tier}
                <Tabs.Content value={tier.id} class="space-y-4">
                  <CardAssignmentPanel
                    gameCode={packData.game_code || ""}
                    {tier}
                    packId={packId || ""}
                    assignedCards={getTierCards(tier.id)}
                    onAddCard={handleAddCard}
                    onRemoveCard={handleRemoveCard}
                    onUpdateCardOdds={handleUpdateCardOdds}
                  />

                  {#if errors.general}
                    <Alert variant="destructive">
                      <IconAlertCircle size={16} />
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  {/if}
                </Tabs.Content>
              {/if}
            {/each}
          </Tabs.Root>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
