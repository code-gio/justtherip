<script lang="ts">
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";
  import { IconLoader2 } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import CardSearchDialog from "$lib/components/decks/CardSearchDialog.svelte";
  import BulkImportDialog from "$lib/components/decks/BulkImportDialog.svelte";
  import {
    DeckBuilderHeader,
    DeckBuilderActions,
    CategoryCreationForm,
    KanbanBoard,
  } from "$lib/components/decks/deck-builder";

  let { data }: { data: PageData } = $props();

  let searchDialogOpen = $state(false);
  let bulkImportDialogOpen = $state(false);
  let localFilter = $state("");
  let newCategoryName = $state("");
  let isCreatingCategory = $state(false);

  // Granular loading states
  let loadingCards = $state<Set<string>>(new Set());
  let loadingCategories = $state<Set<string>>(new Set());
  let isCreatingCategoryLoading = $state(false);
  let isAddingCards = $state(false);

  let renamingCategory = $state<string | null>(null);
  let renameCategoryValue = $state("");

  // Drag and drop state
  let draggedCard = $state<any | null>(null);
  let draggedFromCategory = $state<string | null>(null);
  let dragOverCategory = $state<string | null>(null);

  // Hovered card for preview
  let hoveredCard = $state<string | null>(null);

  // Fixed columns
  const fixedColumns = $derived(
    () => data.fixedColumns || ["Sideboard", "Maybeboard"],
  );

  // Categories and cards derived from server data
  const categories = $derived(() => {
    const cats = data.categories || [];
    return cats.length === 0 ? ["Uncategorized"] : cats;
  });

  // All categories including fixed columns
  const allCategories = $derived(() => [...categories(), ...fixedColumns()]);

  const cardsByCategory = $derived(() => {
    const cards = data.cardsByCategory || {};
    // Ensure "Uncategorized" exists if there are no categories
    if (Object.keys(cards).length === 0) {
      return { Uncategorized: [] };
    }
    return cards;
  });

  // Get all card IDs that are already in the deck
  const existingCardIds = $derived(() => {
    const ids = new Set<string>();
    Object.values(cardsByCategory()).forEach((cards) => {
      cards.forEach((card) => ids.add(card.card_id));
    });
    return ids;
  });

  // Get total cards in deck
  const totalCards = $derived(() => {
    return Object.values(cardsByCategory()).reduce(
      (sum, cards) => sum + cards.length,
      0,
    );
  });

  // Get pinned cards count
  const pinnedCards = $derived(() => {
    let count = 0;
    Object.values(cardsByCategory()).forEach((cards) => {
      cards.forEach((card) => {
        if (card.is_pinned) count++;
      });
    });
    return count;
  });

  async function handleTogglePinned(
    deckCardId: string,
    currentPinned: boolean,
  ) {
    if (loadingCards.has(deckCardId)) return;
    
    // Add loading state
    loadingCards = new Set(loadingCards).add(deckCardId);

    const form = new FormData();
    form.append("deckCardId", deckCardId);
    form.append("isPinned", String(!currentPinned));

    try {
      const response = await fetch("?/togglePinned", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        await invalidateAll();
        toast.success(currentPinned ? "Card unpinned" : "Card pinned");
      } else {
        toast.error("Failed to update pin status");
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("An error occurred");
    } finally {
      // Remove loading state
      const newSet = new Set(loadingCards);
      newSet.delete(deckCardId);
      loadingCards = newSet;
    }
  }

  async function handleAddCardsFromSearch(cards: any[]) {
    if (cards.length === 0) return;
    if (isAddingCards) return;

    const targetCategory = categories()[0] || "Uncategorized";
    isAddingCards = true;

    const form = new FormData();
    form.append("cardIds", JSON.stringify(cards.map((c) => c.id)));
    form.append("category", targetCategory);

    try {
      const response = await fetch("?/addCards", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        await invalidateAll();
        toast.success(
          `Added ${cards.length} card${cards.length !== 1 ? "s" : ""}`,
        );
      } else {
        toast.error("Failed to add cards");
      }
    } catch (error) {
      console.error("Error adding cards:", error);
      toast.error("An error occurred");
    } finally {
      isAddingCards = false;
    }
  }

  async function handleRemoveCard(
    deckCardId: string,
    cardId: string,
    category: string,
  ) {
    if (loadingCards.has(deckCardId)) return;

    if (!confirm("Remove this card from the deck?")) return;

    // Add loading state
    loadingCards = new Set(loadingCards).add(deckCardId);

    const form = new FormData();
    form.append("cardId", cardId);

    try {
      const response = await fetch("?/removeCard", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        await invalidateAll();
        toast.success("Card removed");
      } else {
        toast.error("Failed to remove card");
      }
    } catch (error) {
      console.error("Error removing card:", error);
      toast.error("An error occurred");
    } finally {
      // Remove loading state
      const newSet = new Set(loadingCards);
      newSet.delete(deckCardId);
      loadingCards = newSet;
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (isCreatingCategoryLoading) return;
    isCreatingCategoryLoading = true;

    const form = new FormData();
    form.append("name", newCategoryName.trim());

    try {
      const response = await fetch("?/createCategory", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        await invalidateAll();
        newCategoryName = "";
        isCreatingCategory = false;
        toast.success("Category created");
      } else {
        const result = await response.json();
        toast.error(result?.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("An error occurred");
    } finally {
      isCreatingCategoryLoading = false;
    }
  }

  async function handleRenameCategory(oldName: string) {
    if (!renameCategoryValue.trim() || renameCategoryValue.trim() === oldName) {
      renamingCategory = null;
      renameCategoryValue = "";
      return;
    }

    if (loadingCategories.has(oldName)) return;
    
    // Add loading state
    loadingCategories = new Set(loadingCategories).add(oldName);

    const form = new FormData();
    form.append("oldName", oldName);
    form.append("newName", renameCategoryValue.trim());

    try {
      const response = await fetch("?/renameCategory", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        await invalidateAll();
        renamingCategory = null;
        renameCategoryValue = "";
        toast.success("Category renamed");
      } else {
        const result = await response.json();
        toast.error(result?.error || "Failed to rename category");
      }
    } catch (error) {
      console.error("Error renaming category:", error);
      toast.error("An error occurred");
    } finally {
      // Remove loading state
      const newSet = new Set(loadingCategories);
      newSet.delete(oldName);
      loadingCategories = newSet;
    }
  }

  function startRenamingCategory(category: string) {
    renamingCategory = category;
    renameCategoryValue = category;
  }

  async function handleDeleteCategory(category: string) {
    if (!confirm(`Delete category "${category}" and all its cards?`)) return;

    if (loadingCategories.has(category)) return;

    // Add loading state
    loadingCategories = new Set(loadingCategories).add(category);

    const form = new FormData();
    form.append("name", category);

    try {
      const response = await fetch("?/deleteCategory", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        await invalidateAll();
        toast.success("Category deleted");
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("An error occurred");
    } finally {
      // Remove loading state
      const newSet = new Set(loadingCategories);
      newSet.delete(category);
      loadingCategories = newSet;
    }
  }

  // Drag and Drop handlers
  function handleDragStart(e: DragEvent, card: any, fromCategory: string) {
    if (!e.dataTransfer) return;
    draggedCard = card;
    draggedFromCategory = fromCategory;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "0.5";
    }
  }

  function handleDragOver(e: DragEvent, category: string) {
    if (!draggedCard) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    dragOverCategory = category;
  }

  function handleDragLeave() {
    dragOverCategory = null;
  }

  async function handleDrop(e: DragEvent, targetCategory: string) {
    e.preventDefault();
    dragOverCategory = null;

    if (!draggedCard || !draggedFromCategory) return;
    if (draggedFromCategory === targetCategory) {
      draggedCard = null;
      draggedFromCategory = null;
      return;
    }

    if (loadingCategories.has(targetCategory)) return;

    // Calculate last position in target category
    const targetCards = cardsByCategory()[targetCategory] || [];
    const lastPosition = targetCards.length > 0 
      ? Math.max(...targetCards.map(c => c.position || 0)) + 1 
      : 0;

    // Add loading state
    loadingCategories = new Set(loadingCategories).add(targetCategory);

    const form = new FormData();
    form.append("deckCardId", draggedCard.id);
    form.append("targetCategory", targetCategory);
    form.append("targetPosition", lastPosition.toString());

    try {
      const response = await fetch("?/moveCard", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        await invalidateAll();
        toast.success("Card moved");
      } else {
        toast.error("Failed to move card");
      }
    } catch (error) {
      console.error("Error moving card:", error);
      toast.error("An error occurred");
    } finally {
      // Remove loading state
      const newSet = new Set(loadingCategories);
      newSet.delete(targetCategory);
      loadingCategories = newSet;
      
      draggedCard = null;
      draggedFromCategory = null;
    }
  }

  function handleDragEnd(e: DragEvent) {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
    draggedCard = null;
    draggedFromCategory = null;
    dragOverCategory = null;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="container mx-auto py-8 px-4 max-w-full">
  <!-- Header -->
  <DeckBuilderHeader deckName={data.deck.name} totalCards={totalCards()} />

  <!-- Action Bar -->
  <DeckBuilderActions
    bind:localFilter
    pinnedCount={pinnedCards()}
    {isCreatingCategory}
    onSearchOpen={() => (searchDialogOpen = true)}
    onBulkImportOpen={() => (bulkImportDialogOpen = true)}
    onNewCategory={() => (isCreatingCategory = true)}
  />

  <!-- New Category Input -->
  {#if isCreatingCategory}
    <CategoryCreationForm
      bind:newCategoryName
      onSave={handleCreateCategory}
      onCancel={() => {
        isCreatingCategory = false;
        newCategoryName = "";
      }}
    />
  {/if}

  <!-- Kanban Board -->
  <KanbanBoard
    categories={categories()}
    fixedColumns={fixedColumns()}
    cardsByCategory={cardsByCategory()}
    {localFilter}
    {dragOverCategory}
    {renamingCategory}
    bind:renameCategoryValue
    {hoveredCard}
    {loadingCards}
    {loadingCategories}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    onRenameStart={startRenamingCategory}
    onRenameSave={handleRenameCategory}
    onDeleteCategory={handleDeleteCategory}
    onCardDragStart={handleDragStart}
    onCardDragEnd={handleDragEnd}
    onCardHover={(id) => (hoveredCard = id)}
    onCardTogglePin={handleTogglePinned}
    onCardRemove={handleRemoveCard}
  />

  <!-- Dialogs -->
  <CardSearchDialog
    bind:open={searchDialogOpen}
    packages={data.deck.packages}
    selectedCardIds={existingCardIds()}
    onClose={() => (searchDialogOpen = false)}
    onSelect={handleAddCardsFromSearch}
  />

  <BulkImportDialog
    bind:open={bulkImportDialogOpen}
    packages={data.deck.packages}
    selectedCardIds={existingCardIds()}
    onClose={() => (bulkImportDialogOpen = false)}
    onCardsVerified={handleAddCardsFromSearch}
  />
</div>
