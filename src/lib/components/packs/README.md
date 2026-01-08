# Packs Components

Organized pack-related components in a grouped directory structure.

## Directory Structure

```
packs/
├── card/           # Pack card display component
├── grid/           # Grid layout for packs
├── filter/         # Filter and search components
├── hero/           # Hero section component
├── stats/          # Statistics display component
├── opening/        # Pack opening animation component
├── types.ts        # Shared TypeScript types
└── index.ts        # Main exports
```

## Components

### Card
- **PackCard**: Displays a single pack card with image, name, price, and open button

### Grid
- **PacksGrid**: Grid layout component that displays multiple pack cards

### Filter
- **PacksFilter**: Search and filter interface for packs

### Hero
- **PacksHero**: Hero section with balance display and promotional content

### Stats
- **PacksStats**: Statistics display (total prizes, packs opened, etc.)

### Opening
- **PackOpeningAnimation**: Animated pack opening component with card reveal

## Usage

### Basic Import
```svelte
<script>
  import { PackCard, PacksGrid, PackOpeningAnimation } from "$lib/components/packs";
</script>
```

### Using Pack Opening Animation

```svelte
<script>
  import { PackOpeningAnimation } from "$lib/components/packs";
  
  let isOpening = $state(false);
  let pulledCard = $state(null);
  
  async function openPack() {
    isOpening = true;
    
    // Make API call to open pack
    const response = await fetch("/api/packs/open", {
      method: "POST",
      body: JSON.stringify({ pack_id: packId })
    });
    
    const result = await response.json();
    pulledCard = result.card;
    isOpening = false;
  }
  
  function closeReveal() {
    pulledCard = null;
  }
</script>

<PackOpeningAnimation
  bind:isOpening={isOpening}
  card={pulledCard}
  onClose={closeReveal}
  onOpenAnother={openPack}
/>
```

### Card Interface

The `PackOpeningAnimation` component expects a card object with:

```typescript
interface Card {
  id: string;
  card_name: string;
  card_image_url?: string | null;
  value_cents: number;
  set_name?: string | null;
  rarity?: string | null;
}
```

## Features

- **Opening Animation**: Spinning pack with glow effects during opening
- **Card Reveal**: Beautiful card reveal with tier-based gradients
- **Tier Colors**: Automatic gradient colors based on card tier
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation

