<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { IconCards, IconSparkles } from "@tabler/icons-svelte";
  import InventoryCard from "./inventory-card.svelte";

  interface CardData {
    id: string;
    tier_name: string;
    card_image_url: string | null;
    card_name: string | null;
    card_value_cents: number;
    created_at: string;
    is_sold?: boolean;
    is_shipped?: boolean;
    shipment_id?: string | null;
  }

  interface Props {
    cards: CardData[];
    loading: boolean;
    sellingCardId: string | null;
    shippingCardId: string | null;
    onSell: (cardId: string) => void;
    onShip: (cardId: string) => void;
  }

  let { cards, loading, sellingCardId, shippingCardId, onSell, onShip }: Props = $props();
</script>

{#if loading}
  <div class="grid grid-cols-4 gap-4">
    {#each Array(8) as _}
      <Card.Root>
        <Card.Header>
          <Skeleton class="h-5 w-20 mb-3" />
          <Skeleton class="w-full aspect-square rounded-lg" />
          <Skeleton class="h-6 w-24 mt-4" />
          <Skeleton class="h-4 w-32 mt-2" />
          <Skeleton class="h-3 w-28 mt-2" />
        </Card.Header>
        <Card.Footer class="flex-col gap-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-9 w-full" />
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
{:else if cards.length === 0}
  <Empty.Root class="py-16 border rounded-xl">
    <Empty.Header>
      <Empty.Media variant="icon" class="size-16 rounded-full">
        <IconCards size={32} />
      </Empty.Media>
      <Empty.Title>No Cards Yet</Empty.Title>
      <Empty.Description>
        Open some packs to start building your collection!
      </Empty.Description>
    </Empty.Header>
    <Empty.Content>
      <Button href="/packs">
        <IconSparkles class="mr-2" size={18} />
        Open Packs
      </Button>
    </Empty.Content>
  </Empty.Root>
{:else}
  <div class="grid grid-cols-4 gap-4">
    {#each cards as card (card.id)}
      <InventoryCard
        {card}
        isSelling={sellingCardId === card.id}
        isShipping={shippingCardId === card.id}
        onSell={onSell}
        onShip={onShip}
      />
    {/each}
  </div>
{/if}

