# Deck Builder Components

This folder contains all the components for the deck builder interface, separated for better maintainability.

## Components

### `DeckBuilderHeader.svelte`
Displays the deck name, back button, and total card count.

**Props:**
- `deckName: string` - Name of the deck
- `totalCards: number` - Total number of cards in the deck

### `DeckBuilderActions.svelte`
Action bar with filter input and action buttons.

**Props:**
- `localFilter: string` (bindable) - Filter text for cards
- `pinnedCount: number` - Number of pinned cards
- `isCreatingCategory: boolean` - Whether category creation is in progress
- `onSearchOpen: () => void` - Handler for opening search dialog
- `onBulkImportOpen: () => void` - Handler for opening bulk import dialog
- `onNewCategory: () => void` - Handler for creating new category

### `CategoryCreationForm.svelte`
Form for creating a new category.

**Props:**
- `newCategoryName: string` (bindable) - Name of the new category
- `onSave: () => void` - Handler for saving the category
- `onCancel: () => void` - Handler for canceling creation

### `KanbanBoard.svelte`
Main Kanban board with scrollable regular categories and fixed columns (Sideboard/Maybeboard).

**Props:**
- `categories: string[]` - List of regular categories
- `fixedColumns: string[]` - List of fixed columns
- `cardsByCategory: Record<string, any[]>` - Cards grouped by category
- `localFilter: string` - Filter text
- `dragOverCategory: string | null` - Category being dragged over
- `renamingCategory: string | null` - Category being renamed
- `renameCategoryValue: string` (bindable) - New name for category
- `hoveredCard: string | null` - ID of hovered card
- Various event handlers for drag & drop, renaming, deleting, etc.

### `KanbanColumn.svelte`
Individual Kanban column displaying cards for a category.

**Props:**
- `category: string` - Category name
- `cards: any[]` - Cards in this category
- `count: number` - Total number of cards
- `isFixed: boolean` - Whether this is a fixed column
- `isDragOver: boolean` - Whether something is being dragged over
- `isRenaming: boolean` - Whether the category is being renamed
- `hoveredCard: string | null` - ID of hovered card
- Event handlers for all card and category operations

### `StackedCard.svelte`
Individual card with solitaire-style stacking effect.

**Props:**
- `card: any` - Card data
- `index: number` - Position in stack
- `category: string` - Category name
- `isHovered: boolean` - Whether this card is hovered
- `isAnyCardBelowHovered: boolean` - Whether any card below is hovered
- Event handlers for drag & drop, pin toggle, and removal

## Features

- **Solitaire-style card stacking**: Cards stack with 40px overlap
- **Hover effect**: Cards below hovered card move down 300px to reveal it
- **Drag & drop**: Native HTML drag and drop for moving cards
- **Fixed columns**: Sideboard and Maybeboard are always visible on the right
- **Category management**: Create, rename, delete, and reorder categories
- **Pin cards**: Mark important cards with a pin icon
- **Responsive layout**: Scrollable horizontal layout for many categories

## Usage

```svelte
import {
  DeckBuilderHeader,
  DeckBuilderActions,
  CategoryCreationForm,
  KanbanBoard,
} from "$lib/components/decks/deck-builder";

<DeckBuilderHeader deckName="My Deck" totalCards={60} />
<DeckBuilderActions
  bind:localFilter
  pinnedCount={5}
  isCreatingCategory={false}
  onSearchOpen={() => {}}
  onBulkImportOpen={() => {}}
  onNewCategory={() => {}}
/>
<KanbanBoard
  categories={["Creatures", "Spells"]}
  fixedColumns={["Sideboard", "Maybeboard"]}
  cardsByCategory={{
    Creatures: [/* cards */],
    Spells: [/* cards */]
  }}
  {/* ...other props */}
/>
```
