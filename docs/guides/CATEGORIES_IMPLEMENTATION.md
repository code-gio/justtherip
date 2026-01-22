# Deck Categories System Implementation

## Summary

Implemented an **explicit categories system** for deck management, replacing the implicit category creation with a managed array stored in the database.

## Changes Made

### 1. Database Schema

#### Modified Tables
- **`deck_folders`**: Added `categories text[]` column
  - Default: `['Uncategorized']`
  - Stores ordered list of category names
  - Only used when `type = 'deck'`

#### Migration Script
- **`003_add_categories_to_deck_folders.sql`**
  - Adds `categories` column
  - Migrates existing categories from `deck_cards`
  - Ensures backward compatibility

### 2. TypeScript Types

Updated `src/lib/types/decks.ts`:
```typescript
export interface DeckFolder {
  // ... other fields
  categories: string[] | null;
}

export interface CreateDeckFolderInput {
  categories?: string[] | null;
}

export interface UpdateDeckFolderInput {
  categories?: string[] | null;
}
```

### 3. Server-Side Logic

Updated `src/routes/(app)/decks/[id]/+page.server.ts`:

#### Load Function
- Uses `deck.categories` array instead of deriving from cards
- Initializes empty categories in the UI
- Defaults to `['Uncategorized']` if empty

#### New Actions
- **`createCategory`**: Adds new category to array
- **`renameCategory`**: Updates category in array AND all card references
- **`deleteCategory`**: Removes category, moves cards to 'Uncategorized'
- **`reorderCategories`**: Updates category order in array

#### Updated Actions
- **`addCards`**: Validates category exists in deck
- **`moveCard`**: Validates target category exists

### 4. Frontend UI

Updated `src/routes/(app)/decks/[id]/+page.svelte`:

#### New Features
- ✅ Inline category renaming
- ✅ Category creation with validation
- ✅ Category deletion with card migration
- ✅ Empty categories remain visible
- ✅ Loading states for all operations

#### New State Variables
```typescript
let renamingCategory = $state<string | null>(null);
let renameCategoryValue = $state("");
```

#### Updated Functions
- `handleCreateCategory()`: Now creates real category in database
- `handleDeleteCategory()`: Moves cards instead of deleting them
- `handleRenameCategory()`: New function for renaming
- `startRenamingCategory()`: New function for initiating rename

#### UI Improvements
- Category header shows rename input when editing
- Dropdown menu includes "Rename" option
- Better error messages from server validation

### 5. Documentation

#### New Files
- **`docs/guides/deck_categories.md`**: Complete guide to categories system
- **`docs/database/migrations/003_add_categories_to_deck_folders.sql`**: Migration script

#### Updated Files
- **`docs/database/README.md`**: Added migration 003 and categories field
- **`docs/README.md`**: Added deck_categories.md to guides section

## Benefits

### ✅ Better UX
- Create categories before adding cards
- Empty categories visible in Kanban
- Rename categories without losing data
- Reorder categories (structure in place)

### ✅ Data Integrity
- Categories validated at database level
- No orphaned cards
- Consistent category references
- Safe deletion with card migration

### ✅ Performance
- Categories loaded once per deck
- No complex queries to derive categories
- Efficient updates with single array operation

### ✅ Flexibility
- Easy to add category metadata (future)
- Support for category templates
- Foundation for advanced features

## Migration Path

### For New Installations
1. Run migration 001
2. Run migration 002
3. Categories work out of the box

### For Existing Installations
1. Run migration 003
2. Existing categories automatically migrated
3. No data loss or downtime

## API Changes

### Before (Implicit)
```typescript
// Categories were derived from existing cards
// Empty categories not possible
// No validation
```

### After (Explicit)
```typescript
// Categories defined in deck
// Empty categories supported
// Server-side validation
// CRUD operations for categories
```

## Example Usage

### Creating a Deck with Categories
```typescript
// 1. Create deck (has default 'Uncategorized')
const deck = await createDeck({ name: 'My Deck', type: 'deck' });

// 2. Add categories
await createCategory('Lands');
await createCategory('Creatures');
await createCategory('Spells');

// 3. Categories array: ['Uncategorized', 'Lands', 'Creatures', 'Spells']

// 4. Add cards to any category (including empty ones)
```

### Renaming a Category
```typescript
// Rename affects deck.categories AND all deck_cards.category
await renameCategory('Spells', 'Instants & Sorceries');
```

### Deleting a Category
```typescript
// Cards moved to 'Uncategorized', then category removed
await deleteCategory('Lands');
```

## Testing Checklist

- [x] Create new category
- [x] Rename existing category
- [x] Delete category with cards
- [x] Delete empty category
- [x] Add cards to specific category
- [x] Move cards between categories (drag & drop)
- [x] Filter cards within categories
- [x] Loading states during operations
- [x] Error handling and validation
- [x] Migration script (existing decks)

## Future Enhancements

### Planned Features
1. **Drag & Drop Column Reordering**
   - Visual reordering of categories
   - Uses `reorderCategories` action

2. **Category Metadata**
   - Colors, icons, rules
   - Stored as JSON in categories array

3. **Category Templates**
   - Preset category sets (e.g., "MTG Standard")
   - Quick deck setup

4. **Category Statistics**
   - Card count, total value per category
   - Visual indicators

5. **Advanced Validation**
   - Category name patterns
   - Max categories per deck
   - Reserved category names

## Technical Notes

### Key Decision: Array vs. Separate Table
**Chosen:** Array in `deck_folders`

**Reasoning:**
- Simpler schema
- Better performance (one query)
- Easier ordering
- Good for small lists (<50 categories)
- PostgreSQL array functions sufficient

**Alternative:** Separate `deck_categories` table
- Would be better for 100+ categories per deck
- Would allow more complex metadata
- Not needed for current use case

### Key Decision: Delete vs. Move Cards
**Chosen:** Move cards to 'Uncategorized'

**Reasoning:**
- No data loss
- Reversible operation
- User-friendly
- Prevents accidents

**Alternative:** Delete cards with category
- Would require confirmation dialog
- Risk of data loss
- Not recommended

## Deployment Notes

1. **Database Migration**
   ```sql
   -- Run in Supabase SQL Editor
   -- Execute 003_add_categories_to_deck_folders.sql
   ```

2. **Code Deployment**
   - No breaking changes
   - Backward compatible
   - Graceful fallback to 'Uncategorized'

3. **Rollback Plan**
   - Categories can be set to NULL
   - App falls back to implicit mode
   - No data loss

## Related Issues

- Fixes: Infinite loop when creating categories
- Fixes: Categories not persisting between sessions
- Fixes: Unable to create empty categories
- Improves: Category management UX
- Enables: Future category features

## Contributors

- Fixed infinite loop by using `$derived` instead of `$effect`
- Added explicit category management
- Improved loading states and error handling
- Created comprehensive documentation
