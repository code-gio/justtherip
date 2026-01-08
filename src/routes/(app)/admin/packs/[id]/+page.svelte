<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Separator } from "$lib/components/ui/separator";
  import CardAssignmentPanel from "$lib/components/admin/packs/card-assignment-panel.svelte";
  import PackEditorHeader from "$lib/components/admin/packs/pack-editor-header.svelte";
  import PackGeneralInfoForm from "$lib/components/admin/packs/pack-general-info-form.svelte";
  import { toast } from "svelte-sonner";
  import { IconAlertCircle } from "@tabler/icons-svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const packId = $page.params.id;

  interface PackCard {
    card_uuid: string;
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

    if (data.packCards) {
      packCards = data.packCards.map(pc => ({
        card_uuid: pc.card_uuid,
        market_value: pc.market_value,
        is_foil: pc.is_foil,
        condition: pc.condition,
        cardData: pc.cardData || null,
      }));
    }
  });

  let errors = $state<Record<string, string>>({});
  let isLoading = $state(false);

  const validation = $derived({
    generalInfoComplete: !!packData.name && !!packData.slug && packData.rip_cost > 0,
    ripCostValid: packData.rip_cost > 0 && Number.isInteger(packData.rip_cost),
    cardsAssigned: packCards.length > 0,
  });

  const canPublish = $derived(
    validation.generalInfoComplete &&
    validation.ripCostValid &&
    validation.cardsAssigned
  );

  // Card assignment handlers
  function handleAddCard(card: any) {
    // Check if card already assigned
    const existingCard = packCards.find(pc => pc.card_uuid === card.id);
    if (existingCard) {
      errors.general = "Card is already assigned to this pack";
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

    if (priceCents <= 0) {
      errors.general = "Card must have a valid market value";
      return;
    }

    packCards.push({
      card_uuid: card.id,
      market_value: priceCents,
      is_foil: packData.game_code === "mtg" && !!card.prices?.usd_foil,
      condition: "NM",
    });

    errors.general = "";
  }

  function handleRemoveCard(cardId: string) {
    packCards = packCards.filter(pc => pc.card_uuid !== cardId);
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

    // Include pack cards (no tier_id or odds needed)
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

<div class="container mx-auto">
  <PackEditorHeader
    isActive={packData.is_active}
    isLoading={isLoading}
    canPublish={canPublish}
    onBack={() => goto("/admin/packs")}
    onSave={handleSave}
    onPublish={handlePublish}
    onUnpublish={handleUnpublish}
  />

  <div class="space-y-6">
    <PackGeneralInfoForm packData={packData} errors={errors} />

    <Separator />

    <!-- SECTION B - Card Assignment -->
    <div class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold">Card Assignment</h2>
        <p class="text-sm text-muted-foreground">Add cards to this pack.</p>
      </div>
      <CardAssignmentPanel
        gameCode={packData.game_code || ""}
        packId={packId || ""}
        assignedCards={packCards}
        onAddCard={handleAddCard}
        onRemoveCard={handleRemoveCard}
      />

      {#if errors.general}
        <Alert variant="destructive">
          <IconAlertCircle size={16} />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      {/if}
    </div>
  </div>
</div>
