<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button";
  import { IconLoader2, IconExternalLink } from "@tabler/icons-svelte";
  import type { AdminShipment } from "$lib/components/shipments/types";

  interface PurchaseOptionCard {
    product_id: number;
    name: string;
    clean_name: string;
    image_url: string | null;
    url: string | null;
    card_number?: string | null;
    rarity?: string | null;
    sub_type?: string | null;
  }

  interface Props {
    open?: boolean;
    shipment: AdminShipment | null;
    onClose: () => void;
  }

  let { open = $bindable(false), shipment, onClose }: Props = $props();

  let isLoading = $state(false);
  let purchaseOptions = $state<PurchaseOptionCard[]>([]);
  let purchaseOptionsTotal = $state(0);

  async function fetchPurchaseOptions() {
    const gameCode = shipment?.inventory?.game_code;
    const cardName = shipment?.cardName;
    const params = new URLSearchParams({
      game_code: gameCode || "",
      card_name: cardName || "",
    });

    const apiUrl = `/api/admin/shipments/purchase-options?${params.toString()}`;
    isLoading = true;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      purchaseOptions = (data.purchaseOptions ?? []) as PurchaseOptionCard[];
      purchaseOptionsTotal = data.total ?? purchaseOptions.length;
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    if (open && shipment) {
      fetchPurchaseOptions();
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
    <Dialog.Header>
      <Dialog.Title>View Purchase Options</Dialog.Title>
      <Dialog.Description>
        Cards found for this shipment. Open the link to view on TCGPlayer.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 flex-1 min-h-0 overflow-hidden flex flex-col">
      <div class="p-3 rounded-lg bg-muted/50 border shrink-0">
        <p class="text-sm text-muted-foreground">
          <span class="font-medium text-foreground">{shipment?.cardName}</span>
          {#if shipment?.inventory?.game_code}
            <span> · {shipment.inventory.game_code}</span>
          {/if}
        </p>
      </div>

      {#if isLoading}
        <div
          class="flex items-center justify-center py-12 text-muted-foreground"
        >
          <IconLoader2 size={24} class="animate-spin mr-2" />
          <span>Searching options...</span>
        </div>
      {:else}
        <div class="shrink-0">
          <p class="text-sm font-medium text-foreground">
            {purchaseOptionsTotal}
            {purchaseOptionsTotal === 1 ? "card found" : "cards found"}
          </p>
        </div>

        {#if purchaseOptions.length === 0}
          <div
            class="py-8 text-center text-muted-foreground text-sm rounded-lg border border-dashed"
          >
            No cards found for this shipment.
          </div>
        {:else}
          <ul class="space-y-2 overflow-y-auto pr-1 -mr-1 min-h-0">
            {#each purchaseOptions as card (card.product_id)}
              <li
                class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div
                  class="shrink-0 w-12 h-[68px] rounded overflow-hidden bg-muted flex items-center justify-center"
                >
                  {#if card.image_url}
                    <img
                      src={card.image_url}
                      alt={card.clean_name}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <span class="text-xs text-muted-foreground">No image</span>
                  {/if}
                </div>
                <div class="min-w-0 flex-1">
                  <p
                    class="font-medium text-foreground truncate"
                    title={card.name}
                  >
                    {card.name}
                  </p>
                  {#if card.card_number || card.rarity}
                    <p class="text-xs text-muted-foreground">
                      {#if card.card_number}#{card.card_number}{/if}
                      {#if card.card_number && card.rarity}
                        ·
                      {/if}
                      {#if card.rarity}{card.rarity}{/if}
                    </p>
                  {/if}
                </div>
                {#if card.url}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="shrink-0"
                    onclick={() =>
                      window.open(card.url!, "_blank", "noopener,noreferrer")}
                  >
                    <IconExternalLink size={14} class="mr-1.5" />
                    View on TCGPlayer
                  </Button>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>

    <!-- <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (open = false)}>
        Close
      </Button>
    </Dialog.Footer> -->
  </Dialog.Content>
</Dialog.Root>
