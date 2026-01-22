# Documentation

This folder contains all project documentation, database migrations, policies, and setup guides.

## 📁 Structure

```
docs/
├── database/           # Database related files
│   ├── migrations/    # SQL migration scripts (numbered for execution order)
│   ├── policies/      # RLS policies and security configurations
│   └── queries/       # Utility queries and database maintenance scripts
├── setup/             # Setup and configuration guides
└── guides/            # Feature-specific guides and instructions
```

## 🗄️ Database

### Migrations (`database/migrations/`)
Migration scripts should be executed in order. Each file is prefixed with a number indicating execution order:

- `001_create_deck_folders_table.sql` - Creates the deck_folders table with recursive folder structure
- `002_create_deck_cards_table.sql` - Creates the deck_cards table for managing cards within decks
- `003_add_categories_to_deck_folders.sql` - Adds explicit categories array for better card organization

### Policies (`database/policies/`)
Row Level Security (RLS) policies for Supabase:

- `avatar_policies.sql` - RLS policies for avatar storage and access
- `avatar_policies_ui.sql` - UI-friendly version of avatar policies

### Documentation
- `PERMISSIONS.md` - Detailed permission matrix for deck folders (private/unlisted/public)
- `README.md` - Complete database schema and setup guide

### Queries (`database/queries/`)
Utility and maintenance queries:

- `diagnostic_queries.sql` - Queries for debugging and diagnostics
- `verify_index.sql` - Index verification queries
- `fix_wildcard_search.sql` - Fixes for wildcard search functionality
- `add_mtg_name_index.sql` - Adds search index for MTG card names

## 🔧 Setup

Setup and configuration guides:

- `avatar_setup.md` - Complete guide for setting up avatar storage in Supabase

## 📖 Guides

Feature-specific documentation:

- `quick_instructions.md` - Quick reference for common tasks
- `bulk_import.md` - Guide for bulk importing cards
- `deck_categories.md` - Complete guide to deck categories system
- `pack_creation_agent.md` - Instructions for the pack creation agent

## 🚀 Quick Start

### Database Setup

1. Execute migrations in order:
   ```bash
   # In Supabase SQL Editor, run in this order:
   # 1. database/migrations/001_create_deck_folders_table.sql
   # 2. database/migrations/002_create_deck_cards_table.sql
   # 3. database/migrations/003_add_categories_to_deck_folders.sql (if upgrading)
   ```

2. Apply RLS policies:
   ```bash
   # Execute policy files in database/policies/ folder
   ```

3. Run utility queries as needed from `database/queries/`

### Feature Setup

Refer to specific guides in the `guides/` folder for detailed instructions on:
- Setting up avatars
- Bulk importing cards
- Using the pack creation agent
- And more...

## 📝 Contributing

When adding new documentation:

1. **Migrations**: Add to `database/migrations/` with sequential numbering
2. **Policies**: Add to `database/policies/` with descriptive names
3. **Queries**: Add to `database/queries/` for reusable queries
4. **Setup Guides**: Add to `setup/` for one-time configuration
5. **Feature Guides**: Add to `guides/` for feature documentation

## 🔗 Related Files

- Main project README: `../README.md`
- Component-specific READMEs are located within their respective folders in `/src`
