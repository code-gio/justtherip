# Bulk Card Import - Documentation

## Overview

Bulk card import system for packs. Allows users to import multiple cards at once through direct text input or CSV/TXT files.

## Features

### 1. Bulk Import Modal

- Full-screen modal that covers the entire application
- Collapsible sections for better organization
- Intuitive interface with visual feedback

### 2. Supported Input Formats

#### Manual Entry

Users can type card names directly, one per line:

```
Sensei's Divining Top
Sol Ring
Path to Exile
```

#### CSV/TXT File

Supports files exported from Archidekt and other common formats. Maximum size: 1MB.

### 3. Smart Parsing

The system automatically cleans and processes card names, removing:

- **Quantities**: `2x Sol Ring` → `Sol Ring`
- **Parentheses**: `Wrath of God (Finisher)` → `Wrath of God`
- **Brackets**: `Island [Sideboard]` → `Island`
- **Hashtags**: `# Sideboard` → (ignored)
- **Special markers**: `^To Remove,#FF0000^` → (removed)

### 4. Card Verification

The system performs a two-step search:

1. **Exact Search**: Looks for exact name match (case-insensitive)
2. **Fuzzy Search**: If no exact match found, searches for similarities with ILIKE

**Price Validation**:

- For MTG: Verifies it has USD or USD Foil price > 0
- For other games: Verifies it has market_value_cents > 0

### 5. Verification Results

The modal displays two lists:

**Found Cards** (green):

- Shows name and set
- Ready to import

**Not Found Cards** (yellow):

- Shows names that couldn't be found
- Allows users to verify spelling errors

### 6. Import

- Only imports cards not already assigned to the pack
- Avoids duplicates by checking `card_uuid`
- Shows toast with operation result

## Created/Modified Files

### New Files:

1. `src/lib/components/admin/packs/card-assignment/bulk-import-modal.svelte`

   - Main bulk import modal

2. `src/routes/api/admin/cards/bulk-verify/+server.ts`

   - Endpoint for bulk card verification

3. `src/lib/components/ui/collapsible/*`
   - UI components for collapsible sections

### Modified Files:

1. `src/lib/components/admin/packs/card-assignment-panel.svelte`
   - Added "Bulk Import Cards" button
   - Integration of import modal
   - Handler for verified cards

## Usage

1. User clicks "Bulk Import Cards"
2. Full-screen modal opens
3. User can:
   - View format examples
   - Upload CSV/TXT file
   - Type names manually
4. Click "Verify Cards"
5. System shows results (found/not found)
6. Click "Import X Cards"
7. Cards are automatically added to the pack

## Limitations

- Maximum 500 cards per import
- Maximum file size 1MB
- Only searches by name (not by set or collector number)
- Doesn't handle quantities (always adds 1 card)

## Possible Future Improvements

- Search by specific set: `Sol Ring [CMM]`
- Search by collector number
- Import quantities
- Image preview in results
- Export list of cards not found
- Cache recent searches
