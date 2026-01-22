# Deck Categories System

## Overview

The deck builder now uses an **explicit categories system** where each deck maintains an ordered array of category names. This provides better control over the organization of cards within a deck.

## Features

### ✅ Explicit Category Management
- Categories are defined in the `deck_folders.categories` array
- Categories persist even when empty
- Default category: `['Uncategorized']`

### ✅ Category Operations

#### Create Category
```typescript
// Frontend
const form = new FormData();
form.append('name', 'Creatures');
await fetch('?/createCategory', { method: 'POST', body: form });

// Backend validates and updates deck_folders.categories
```

#### Rename Category
```typescript
const form = new FormData();
form.append('oldName', 'Creatures');
form.append('newName', 'Monsters');
await fetch('?/renameCategory', { method: 'POST', body: form });

// Updates both deck_folders.categories AND deck_cards.category
```

#### Delete Category
```typescript
const form = new FormData();
form.append('name', 'Creatures');
await fetch('?/deleteCategory', { method: 'POST', body: form });

// Moves all cards to 'Uncategorized' before removing category
```

#### Reorder Categories
```typescript
const form = new FormData();
form.append('categories', JSON.stringify(['Lands', 'Creatures', 'Spells']));
await fetch('?/reorderCategories', { method: 'POST', body: form });

// Updates the order of columns in the Kanban view
```

## Database Schema

### deck_folders Table
```sql
CREATE TABLE deck_folders (
  ...
  categories text[] NULL DEFAULT array['Uncategorized']::text[],
  ...
);
```

**When type = 'deck':**
- `categories` contains ordered list of category names
- Always has at least one category
- Categories are case-sensitive

**When type = 'folder':**
- `categories` should be NULL (not used)

### deck_cards Table
```sql
CREATE TABLE deck_cards (
  ...
  category varchar(50) NULL,
  ...
);
```

- `category` references a value in parent deck's `categories` array
- Should always match a category in `deck_folders.categories`
- Validation enforced at application level

## UI/UX Benefits

### 🎨 Better Organization
- Create categories before adding cards
- Plan deck structure in advance
- Empty columns visible in Kanban view

### 🔄 Flexible Ordering
- Drag columns to reorder (future feature)
- Maintain consistent category order
- Personal category preferences

### ✏️ Easy Renaming
- Rename categories without losing cards
- Bulk update all cards in category
- No orphaned cards

### 🗑️ Safe Deletion
- Cards moved to 'Uncategorized' instead of deleted
- No data loss
- Always maintains at least one category

## Example Workflow

### Creating a New Deck

1. **Create Deck**
   ```typescript
   // Deck created with default: ['Uncategorized']
   ```

2. **Add Categories**
   ```typescript
   await createCategory('Lands');
   await createCategory('Creatures');
   await createCategory('Spells');
   // Result: ['Uncategorized', 'Lands', 'Creatures', 'Spells']
   ```

3. **Add Cards**
   ```typescript
   // Cards added to specific categories
   // Empty categories remain visible
   ```

4. **Reorganize**
   ```typescript
   // Reorder categories
   await reorderCategories(['Lands', 'Creatures', 'Spells', 'Uncategorized']);
   
   // Rename category
   await renameCategory('Spells', 'Instants & Sorceries');
   ```

### Migration from Implicit System

If you have existing decks using the old implicit system:

```sql
-- Run migration 003
-- This will automatically populate categories array
-- based on existing deck_cards.category values
```

## Best Practices

### ✅ Do's
- Create meaningful category names
- Use consistent naming conventions
- Keep category names short for better UI
- Plan categories before adding cards

### ❌ Don'ts
- Don't create duplicate category names
- Don't delete 'Uncategorized' if it has cards
- Don't use special characters in category names
- Don't create too many categories (affects UI)

## API Reference

### Server Actions

#### `createCategory`
**Input:**
- `name: string` - Category name

**Validation:**
- Name is required and non-empty
- Name doesn't already exist
- User owns the deck

**Output:**
- `success: true, category: string`

#### `renameCategory`
**Input:**
- `oldName: string` - Current name
- `newName: string` - New name

**Validation:**
- Both names required
- New name doesn't already exist
- User owns the deck

**Side Effects:**
- Updates all `deck_cards.category` values

#### `deleteCategory`
**Input:**
- `name: string` - Category to delete

**Validation:**
- Category exists
- User owns the deck

**Side Effects:**
- Moves cards to 'Uncategorized'
- Ensures at least one category remains

#### `reorderCategories`
**Input:**
- `categories: string[]` - New order

**Validation:**
- Array is valid
- User owns the deck

## Troubleshooting

### Cards not appearing in category
**Problem:** Cards exist but don't show in any column

**Solution:**
```sql
-- Check if card category exists in deck
SELECT c.category, df.categories
FROM deck_cards c
JOIN deck_folders df ON c.deck_id = df.id
WHERE c.category NOT IN (SELECT unnest(df.categories));

-- Fix: Add missing category or move cards
UPDATE deck_cards 
SET category = 'Uncategorized'
WHERE category NOT IN (
  SELECT unnest(categories) 
  FROM deck_folders 
  WHERE id = deck_cards.deck_id
);
```

### Empty deck shows no categories
**Problem:** Deck has no columns in Kanban view

**Solution:**
```sql
-- Ensure deck has default category
UPDATE deck_folders
SET categories = array['Uncategorized']::text[]
WHERE type = 'deck' AND (categories IS NULL OR array_length(categories, 1) = 0);
```

## Future Enhancements

- 🎯 Category metadata (color, icon, rules)
- 🔀 Drag & drop column reordering
- 📊 Category-level statistics
- 🎨 Custom category styling
- 📋 Category templates
- 🔍 Category-based filtering
