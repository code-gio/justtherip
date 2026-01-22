# Database Documentation

## Overview

This directory contains all database-related files including migrations, policies, and utility queries for the Supabase database.

## 📂 Directory Structure

### `/migrations`
Sequential SQL scripts for database schema creation and updates. Execute in numerical order.

| File | Description | Dependencies |
|------|-------------|--------------|
| `001_create_deck_folders_table.sql` | Creates deck_folders table with recursive structure for organizing decks in folders | Requires `profiles` table |
| `002_create_deck_cards_table.sql` | Creates deck_cards table for managing cards within decks | Requires `deck_folders` table |
| `003_add_categories_to_deck_folders.sql` | Adds explicit categories array to deck_folders for better column management | Run after 001 and 002 |

### `/policies`
Row Level Security (RLS) policies for data access control.

| File | Description | Tables Affected |
|------|-------------|-----------------|
| `avatar_policies.sql` | RLS policies for avatar storage bucket | `storage.objects` |
| `avatar_policies_ui.sql` | UI-optimized version of avatar policies | `storage.objects` |

### `/queries`
Utility queries for maintenance, debugging, and optimization.

| File | Purpose |
|------|---------|
| `diagnostic_queries.sql` | Debugging and system diagnostics |
| `verify_index.sql` | Verify database indexes are properly set up |
| `fix_wildcard_search.sql` | Repair wildcard search functionality |
| `add_mtg_name_index.sql` | Add full-text search index for MTG cards |

## 🚀 Getting Started

### 1. Initial Setup

Execute migrations in order using Supabase SQL Editor:

```sql
-- Step 1: Execute migration 001
-- Copy and paste content from 001_create_deck_folders_table.sql

-- Step 2: Execute migration 002
-- Copy and paste content from 002_create_deck_cards_table.sql

-- Step 3: Execute migration 003 (if upgrading existing database)
-- Copy and paste content from 003_add_categories_to_deck_folders.sql
```

### 2. Apply Policies

After migrations, apply RLS policies:

```sql
-- Execute policy files from /policies folder
```

### 3. Verify Setup

Run diagnostic queries to ensure everything is set up correctly:

```sql
-- Use queries from diagnostic_queries.sql
```

## 📋 Database Schema

### Tables Created by Migrations

#### `deck_folders` (Migration 001)
Stores folders and decks in a recursive tree structure.

**Key Features:**
- Recursive parent-child relationships
- Support for both folders and decks
- Visibility controls (private/unlisted/public)
- Package filtering system
- Position-based ordering for drag & drop

**Fields:**
- `id` - UUID primary key
- `name` - Folder/deck name
- `type` - 'folder' or 'deck'
- `status` - 'private', 'unlisted', or 'public'
- `packages` - Array of package types (null = all packages)
- `categories` - Array of category names for organizing cards (deck type only)
- `user_id` - Owner reference
- `parent_id` - Self-referencing FK for hierarchy
- `position` - Display order

#### `deck_cards` (Migration 002)
Manages cards within decks with categorization and pinning.

**Key Features:**
- One card per deck (unique constraint)
- Category tagging
- Card pinning system
- Position-based ordering
- Cascade delete with parent deck

**Fields:**
- `id` - UUID primary key
- `deck_id` - Reference to deck_folders
- `card_id` - Reference to card
- `category` - Optional category tag
- `is_pinned` - Pin important cards
- `position` - Display order

## 🔒 Security

### Row Level Security (RLS) Policies

#### deck_folders Table

**Visibility Rules:**
- **private**: Only the creator has read and write access
- **unlisted**: Creator has full access, others have read-only access
- **public**: Creator has full access, others have read-only access

**Policies:**
- ✅ SELECT: Creator always has access; others can read `public` and `unlisted` items
- ✅ INSERT: Only authenticated users can create their own folders/decks
- ✅ UPDATE: Only the creator can modify their folders/decks
- ✅ DELETE: Only the creator can delete their folders/decks

#### deck_cards Table

**Access Control:**
- ✅ Users can only access cards within decks they have permission to view
- ✅ Only deck owner can add, modify, or remove cards
- ✅ Cascade delete protection: cards are removed when parent deck is deleted

All tables include:
- ✅ Row Level Security (RLS) enabled
- ✅ User-based access policies
- ✅ Cascade delete protection

## 🔍 Indexes

Performance indexes are automatically created for:
- User lookups
- Parent-child relationships
- Type filtering
- Position ordering
- Pinned items
- Categories

## 📝 Notes

- **Migration Order Matters**: Always execute migrations in numerical order
- **Backup First**: Always backup your database before running queries from `/queries`
- **RLS Required**: Ensure RLS is enabled for security
- **Testing**: Test policies in a development environment first

## 🆘 Troubleshooting

If you encounter issues:

1. Check migration execution order
2. Verify RLS policies are active: `SELECT * FROM pg_policies;`
3. Run diagnostic queries to identify problems
4. Check Supabase logs for detailed error messages

## 🔗 Related Documentation

- [Setup Guides](../setup/)
- [Feature Guides](../guides/)
- [Main Documentation](../README.md)
