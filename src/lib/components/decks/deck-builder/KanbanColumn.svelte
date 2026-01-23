<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { IconEdit, IconTrash, IconDotsVertical, IconLoader2 } from "@tabler/icons-svelte";
  import StackedCard from "./StackedCard.svelte";

  interface Props {
    category: string;
    cards: any[];
    count: number;
    isFixed: boolean;
    isDragOver: boolean;
    isRenaming: boolean;
    renamingValue?: string;
    hoveredCard: string | null;
    loadingCards: Set<string>;
    isLoading: boolean;
    onDragOver: (e: DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: DragEvent) => void;
    onRenameStart: (category: string) => void;
    onRenameSave: (category: string) => void;
    onDelete: (category: string) => void;
    onCardDragStart: (e: DragEvent, card: any, category: string) => void;
    onCardDragEnd: (e: DragEvent) => void;
    onCardHover: (cardId: string | null) => void;
    onCardTogglePin: (cardId: string, isPinned: boolean) => void;
    onCardRemove: (
      deckCardId: string,
      cardId: string,
      category: string,
    ) => void;
  }

  let {
    category,
    cards,
    count,
    isFixed = false,
    isDragOver,
    isRenaming,
    renamingValue = $bindable(""),
    hoveredCard,
    loadingCards,
    isLoading,
    onDragOver,
    onDragLeave,
    onDrop,
    onRenameStart,
    onRenameSave,
    onDelete,
    onCardDragStart,
    onCardDragEnd,
    onCardHover,
    onCardTogglePin,
    onCardRemove,
  }: Props = $props();

  const cardHeight = 335;
  const overlapSpacing = 40;
  const calculatedHeight = $derived(
    cards.length > 0 ? cardHeight + (cards.length - 1) * overlapSpacing : 240,
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex-shrink-0 w-full flex flex-col rounded-lg p-3 border-2 transition-all relative 
		{isFixed ? 'bg-muted/50' : 'bg-muted/30'}
		{isDragOver
    ? 'border-primary bg-primary/5'
    : isFixed
      ? 'border-border'
      : 'border-transparent'}"
  ondragover={onDragOver}
  ondragleave={onDragLeave}
  ondrop={onDrop}
>
  <!-- Loading Overlay for Column -->
  {#if isLoading}
    <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm rounded-lg z-20 flex items-center justify-center border-2 border-primary">
      <div class="flex flex-col items-center gap-2 bg-background/90 rounded-lg p-4 shadow-lg">
        <IconLoader2 class="h-8 w-8 animate-spin text-primary" />
        <p class="text-sm font-medium text-primary">Processing...</p>
      </div>
    </div>
  {/if}

  <!-- Category Header -->
  <div class="flex items-center justify-between mb-3 ">
    {#if isRenaming && !isFixed}
      <div class="flex-1 flex gap-2">
        <Input
          bind:value={renamingValue}
          class="flex-1 h-8 text-sm"
          onkeypress={(e) => {
            if (e.key === "Enter") onRenameSave(category);
            if (e.key === "Escape") {
              renamingValue = "";
              onRenameStart("");
            }
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          class="h-8 w-8"
          onclick={() => onRenameSave(category)}
        >
          <IconEdit class="h-3 w-3" />
        </Button>
      </div>
    {:else}
      <div class="flex-1">
        <h3 class="font-semibold text-sm">{category}</h3>
        <p class="text-xs text-muted-foreground">
          {count} card{count !== 1 ? "s" : ""}
        </p>
      </div>
      {#if !isFixed}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <IconDotsVertical class="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onclick={() => onRenameStart(category)}>
              <IconEdit class="mr-2 h-3 w-3" />
              <span>Rename</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onclick={() => onDelete(category)}
              class="text-destructive"
            >
              <IconTrash class="mr-2 h-3 w-3" />
              <span>Delete</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
    {/if}
  </div>

  <!-- Cards Container -->
  <div
    class="relative"
    style={`height: ${calculatedHeight}px;`}
  >
    {#if cards.length > 0}
      {#each cards as card, index}
        {@const isHovered = hoveredCard === card.id}
        {@const cardsBelow = cards.slice(0, index)}
        {@const isAnyCardBelowHovered = cardsBelow.some(
          (c) => hoveredCard === c.id,
        )}

        <StackedCard
          {card}
          {index}
          {category}
          {isHovered}
          {isAnyCardBelowHovered}
          isLoading={loadingCards.has(card.id)}
          onMouseEnter={() => onCardHover(card.id)}
          onMouseLeave={() => onCardHover(null)}
          onDragStart={(e) => onCardDragStart(e, card, category)}
          onDragEnd={onCardDragEnd}
          onTogglePin={onCardTogglePin}
          onRemove={onCardRemove}
        />
      {/each}
    {:else}
      <div
        class="w-full  h-full bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
      >
        <p class="text-xs text-muted-foreground text-center px-2">
          {isFixed ? "Drop cards here" : "No cards yet"}
        </p>
      </div>
    {/if}
  </div>
</div>
