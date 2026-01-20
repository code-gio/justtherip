# Just The Rip — Jewels-Only Pack Opening Platform (MVP)

## Overview

**justtherip** is a Jewels-only digital pack-opening platform for collectible trading cards (e.g. Magic: The Gathering, Pokémon). Users purchase non-withdrawable site credits ("Jewels"), open randomized digital packs, and receive physical cards shipped on-demand from third-party marketplaces.

This repository contains the **Phase 1 MVP** implementation.

> ⚠️ This project intentionally excludes cash-out, withdrawals, P2P trading, and inventory warehousing.

---

## Tech Stack

### Frontend

- **SvelteKit** (file-based routing)
- TypeScript
- Tailwind / CSS utilities (optional)

### Backend

- **Node.js API** (authoritative logic layer)
- Secure server-side RNG
- Idempotent transactional endpoints

### Database & Auth

- **Supabase**

  - PostgreSQL
  - Supabase Auth (JWT)
  - Row Level Security (RLS)

### Payments

- Stripe (Jewels purchase only)

---

## Core Concepts

### Jewels

- Non-withdrawable
- Non-transferable
- Purchased with fiat
- Spent only on packs

### Packs

- Digitally opened
- Odds-based
- RNG-driven
- Results logged immutably

### Cards

- Digital representation of physical cards
- Physical cards are sourced and shipped on-demand

---

## Project Structure (High Level)

```
.
├── src/
│   ├── routes/          # SvelteKit pages
│   ├── lib/             # UI components & helpers
│   ├── stores/          # Client-side state (read-only)
│   └── hooks.server.ts  # Auth/session handling
│
├── api/                 # Node.js API (server-side logic)
│   ├── routes/          # REST endpoints
│   ├── services/        # Business logic (packs, wallets, RNG)
│   └── utils/           # Idempotency, logging, helpers
│
├── docs/                # 📚 Project documentation
│   ├── database/        # Database migrations, policies & queries
│   ├── setup/           # Configuration guides
│   └── guides/          # Feature-specific documentation
│
├── supabase/            # SQL, RLS policies, migrations
└── README.md
```

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs/) folder:

- **[Database Documentation](./docs/database/)** - Migrations, policies, and queries
- **[Setup Guides](./docs/setup/)** - Configuration and setup instructions
- **[Feature Guides](./docs/guides/)** - Detailed feature documentation

### Quick Links

- [Database Migrations](./docs/database/migrations/) - SQL scripts for schema setup
- [Avatar Setup](./docs/setup/avatar_setup.md) - Configure avatar storage
- [Quick Instructions](./docs/guides/quick_instructions.md) - Common tasks reference

---

## Development Rules (Important)

- ❌ Frontend must **never** mutate wallets, packs, or cards directly
- ✅ All state changes happen via Node.js API
- ✅ All money-like operations are transactional
- ✅ All pack opens are idempotent
- ✅ Wallet balances must never go negative

If a feature violates any of the above, it does not belong in Phase 1.

---

## Environment Variables

Create a `.env` file with the following:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Never expose the service role key to the client.

---

## Local Development

Install dependencies:

```sh
npm install
```

Start the dev server:

```sh
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## Build

To create a production build:

```sh
npm run build
```

To preview the build:

```sh
npm run preview
```

---

## Security Notes

- All wallet mutations are server-side only
- Supabase RLS restricts user access to their own data
- Logs are append-only
- No deletes on financial tables

---

## Non-Goals (Explicit)

- No withdrawals
- No cash-out
- No P2P trading
- No inventory warehousing
- No gambling terminology in UI

---

## Phase 2 (Future)

- Additional pack types
- Multi-game expansion
- Automated fulfillment
- Advanced EV tuning
- Fraud detection tooling

---

## License / Usage

This repository is proprietary and intended for internal development of **justtherip** only.

---

## Final Note

This README reflects the **architectural and contractual constraints** defined in the Scope of Work. Any deviation should be reviewed carefully before implementation.
