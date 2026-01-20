# JustTheRip Documentation Index

Quick reference index for all documentation files in the project.

## 🚀 Quick Start

1. **Database Setup**: Execute migrations in [`database/migrations/`](./database/migrations/)
2. **Security**: Apply policies from [`database/policies/`](./database/policies/)
3. **Features**: Follow guides in [`guides/`](./guides/) for specific features

## 📑 Documentation Map

### Database (`/database`)

#### Migrations (Execute in order)
1. [`001_create_deck_folders_table.sql`](./database/migrations/001_create_deck_folders_table.sql) - Deck & folder structure
2. [`002_create_deck_cards_table.sql`](./database/migrations/002_create_deck_cards_table.sql) - Cards in decks

#### Policies
- [`avatar_policies.sql`](./database/policies/avatar_policies.sql) - Avatar storage RLS (SQL Editor)
- [`avatar_policies_ui.sql`](./database/policies/avatar_policies_ui.sql) - Avatar storage RLS (UI version)

#### Queries
- [`diagnostic_queries.sql`](./database/queries/diagnostic_queries.sql) - Debug queries
- [`verify_index.sql`](./database/queries/verify_index.sql) - Index verification
- [`fix_wildcard_search.sql`](./database/queries/fix_wildcard_search.sql) - Wildcard search optimization
- [`add_mtg_name_index.sql`](./database/queries/add_mtg_name_index.sql) - MTG name index

### Setup (`/setup`)
- [`avatar_setup.md`](./setup/avatar_setup.md) - Configure avatar storage bucket

### Guides (`/guides`)
- [`quick_instructions.md`](./guides/quick_instructions.md) - Quick reference
- [`bulk_import.md`](./guides/bulk_import.md) - Bulk card import feature
- [`pack_creation_agent.md`](./guides/pack_creation_agent.md) - AI pack creation guide

## 📋 By Task

### Setting Up a New Environment
1. Run database migrations (001, 002)
2. Apply avatar policies
3. Follow avatar setup guide
4. Verify with diagnostic queries

### Working with Decks
1. Database: Run `001_create_deck_folders_table.sql`
2. Database: Run `002_create_deck_cards_table.sql`
3. Frontend: Navigate to `/decks` route

### Working with Cards
1. Bulk Import: See [`bulk_import.md`](./guides/bulk_import.md)
2. Pack Creation: See [`pack_creation_agent.md`](./guides/pack_creation_agent.md)

### Troubleshooting
1. Run queries from [`diagnostic_queries.sql`](./database/queries/diagnostic_queries.sql)
2. Verify indexes with [`verify_index.sql`](./database/queries/verify_index.sql)
3. Fix search issues with [`fix_wildcard_search.sql`](./database/queries/fix_wildcard_search.sql)

## 🔗 External Links

- [Main Project README](../README.md)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [SvelteKit Docs](https://kit.svelte.dev/)

---

**Last Updated**: January 2026
