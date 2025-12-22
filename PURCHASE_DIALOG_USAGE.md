# Purchase Rips Dialog - Usage Guide

## ✨ What Changed

Instead of a separate `/store` route, we now have a **reusable dialog component** that can be triggered from anywhere in your app!

## 🎯 Benefits

✅ **Better UX** - Users don't navigate away from current page
✅ **Reusable** - Use anywhere in your app
✅ **Consistent** - Same purchase experience everywhere
✅ **Fast** - Modal loads instantly, no page navigation

## 📦 Components Created

### 1. `PurchaseRipsDialog` (Main Dialog)
**Location:** `src/lib/components/shared/purchase-rips-dialog.svelte`

The core dialog component that shows bundle options and handles Stripe checkout.

**Usage:**
```svelte
<script>
  import PurchaseRipsDialog from "$lib/components/shared/purchase-rips-dialog.svelte";

  let showDialog = $state(false);
  let bundles = []; // Load from your page data
</script>

<button onclick={() => showDialog = true}>Buy Rips</button>

<PurchaseRipsDialog bind:open={showDialog} {bundles} />
```

### 2. `BuyRipsButton` (Convenience Component)
**Location:** `src/lib/components/shared/buy-rips-button.svelte`

A pre-built button that loads bundles automatically and opens the dialog.

**Usage:**
```svelte
<script>
  import BuyRipsButton from "$lib/components/shared/buy-rips-button.svelte";
</script>

<!-- Simple usage -->
<BuyRipsButton />

<!-- With custom styling -->
<BuyRipsButton variant="outline" size="lg" class="w-full" />
```

## 🎨 Where It's Already Integrated

### 1. **Navbar Balance Dropdown**
**File:** `src/lib/components/nav/header-rips.svelte`

Click your Rip balance in the navbar → "Buy More Rips" → Dialog opens!

### 2. **Wallet Page**
**File:** `src/routes/(app)/wallet/+page.svelte`

Big "Buy Rips" button in the wallet section opens the dialog.

## 💡 How to Use Elsewhere

### Example 1: In Pack Opening Page
```svelte
<!-- src/routes/(app)/packs/[id]/+page.svelte -->
<script>
  import PurchaseRipsDialog from "$lib/components/shared/purchase-rips-dialog.svelte";

  let { data } = $props();
  let { balance, bundles } = $derived(data);
  let showDialog = $state(false);

  async function openPack() {
    if (balance < 1) {
      showDialog = true; // Open purchase dialog instead of error
      return;
    }
    // ... open pack logic
  }
</script>

{#if balance < 1}
  <p>Not enough Rips!</p>
  <button onclick={() => showDialog = true}>Buy More</button>
{/if}

<PurchaseRipsDialog bind:open={showDialog} {bundles} />
```

### Example 2: Quick Button Anywhere
```svelte
<!-- Any component -->
<script>
  import BuyRipsButton from "$lib/components/shared/buy-rips-button.svelte";
</script>

<BuyRipsButton variant="outline" />
```

### Example 3: Custom Trigger
```svelte
<script>
  import PurchaseRipsDialog from "$lib/components/shared/purchase-rips-dialog.svelte";

  let showDialog = $state(false);
  let bundles = $state([]);

  async function loadBundles() {
    const res = await fetch("/api/rips/bundles");
    const data = await res.json();
    bundles = data.bundles;
  }

  onMount(loadBundles);
</script>

<!-- Custom trigger element -->
<div class="sale-banner" onclick={() => showDialog = true}>
  🎉 50% Off Bundles! Click to Buy
</div>

<PurchaseRipsDialog bind:open={showDialog} {bundles} />
```

## 🔌 API Endpoint

The `BuyRipsButton` component uses this endpoint to load bundles:

**GET** `/api/rips/bundles`

Returns:
```json
{
  "bundles": [
    {
      "id": "uuid",
      "name": "5 Rips",
      "rips": 5,
      "price_usd": 5.00,
      "discount_percent": 0
    },
    // ... more bundles
  ]
}
```

## 🎨 Customization

### Dialog Props
```typescript
{
  open: boolean;              // Control visibility (bindable)
  bundles: Bundle[];          // Array of bundle objects
  onPurchaseComplete?: () => void; // Callback after purchase
}
```

### Button Props
```typescript
{
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  class?: string;             // Additional CSS classes
}
```

## 🚀 What About /store Route?

You can either:
1. **Delete it** - Dialog is better UX
2. **Redirect to /wallet** - Keep one place for purchase management
3. **Keep both** - Some users might prefer a dedicated page

Recommendation: Redirect `/store` to `/wallet`:

```typescript
// src/routes/(app)/store/+page.server.ts
import { redirect } from "@sveltejs/kit";

export const load = async () => {
  throw redirect(303, "/wallet");
};
```

## ✅ Setup Complete!

Your purchase dialog is ready to use anywhere! Just:
1. Make sure database has bundles (run SQL from QUICKSTART.md)
2. Configure Stripe webhook
3. Test by clicking your Rip balance in navbar

Now users can buy Rips from anywhere without leaving their flow! 🎉
