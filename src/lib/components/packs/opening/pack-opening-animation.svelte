<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    IconSparkles,
    IconLoader2,
    IconCoin,
    IconPackage,
    IconX,
  } from "@tabler/icons-svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import type { Writable } from "svelte/store";
  import ConfettiCanvas from "./confetti-canvas.svelte";

  interface Card {
    id: string;
    card_name: string;
    card_image_url?: string | null;
    value_cents: number;
    set_name?: string | null;
    rarity?: string | null;
  }

  interface CardPoolItem {
    id: string;
    name: string;
    image_uri?: any;
    market_value?: number;
    rarity?: string | null;
  }

  type RarityCategory = "common" | "rare" | "epic" | "legendary";

  let {
    card,
    cardPool = [],
    sellbackRate = 85,
    isOpening = $bindable(false),
    onOpenAnother,
    onSell,
    onShip,
    onClose,
    isSelling = false,
    isShipping = false,
  }: {
    card: Card | null;
    cardPool?: CardPoolItem[];
    sellbackRate?: number;
    isOpening?: boolean;
    onOpenAnother: () => void;
    onSell: (cardId: string) => Promise<void>;
    onShip: (cardId: string) => void;
    onClose: () => void;
    isSelling?: boolean;
    isShipping?: boolean;
  } = $props();

  // Animation state
  let scrollPosition = $state(0);
  let animationPhase = $state<"idle" | "fast" | "decelerate" | "lock" | "reveal">("idle");
  let winningCardIndex = $state(-1);
  let shakeOffset = $state({ x: 0, y: 0 });
  let confettiActive = $state(false);
  let carouselContainer = $state<HTMLDivElement | null>(null);
  let cardWidth = 240;
  let cardGap = 32;
  let cardItemWidth = cardWidth + cardGap;
  let previousIsOpening = $state(false);
  let previousCard = $state<Card | null>(null);
  let scrollAnimationId: number | null = null;
  let scrollStartTime = $state(0);
  let shouldDecelerate = $state(false);
  let decelerationTarget = $state(0);
  let decelerationStartTime = $state(0);
  let decelerationStartPosition = $state(0);

  // Extract image URL from image_uri field
  function extractImageUrl(imageUri: any): string | null {
    if (!imageUri) return null;
    if (typeof imageUri === "string") {
      try {
        const parsed = JSON.parse(imageUri);
        if (typeof parsed === "object") {
          return parsed.normal || parsed.large || parsed.png || parsed.small || null;
        }
        return imageUri;
      } catch {
        return imageUri;
      }
    }
    if (typeof imageUri === "object") {
      return imageUri.normal || imageUri.large || imageUri.png || imageUri.small || null;
    }
    return null;
  }

  // Get rarity category based on value (value is in cents)
  function getRarityCategory(valueCents: number): RarityCategory {
    if (valueCents >= 50000) return "legendary";
    if (valueCents >= 5000) return "epic";
    if (valueCents >= 500) return "rare";
    return "common";
  }

  // Get value in cents from card pool item (market_value is already in cents)
  function getCardValueCents(cardItem: CardPoolItem): number {
    return (cardItem.market_value || 0);
  }

  // Get value gradient for styling
  function getValueGradient(valueCents: number): string {
    if (valueCents >= 10000) {
      return "from-rose-400 via-pink-500 to-purple-600";
    } else if (valueCents >= 5000) {
      return "from-amber-400 to-orange-500";
    } else if (valueCents >= 2000) {
      return "from-purple-400 to-purple-600";
    } else if (valueCents >= 1000) {
      return "from-blue-400 to-blue-600";
    } else if (valueCents >= 500) {
      return "from-emerald-400 to-emerald-600";
    } else {
      return "from-slate-400 to-slate-600";
    }
  }

  // Get rarity gradient for VFX
  function getRarityGradient(category: RarityCategory): string {
    switch (category) {
      case "legendary":
        return "from-rose-400 via-pink-500 to-purple-600";
      case "epic":
        return "from-amber-400 to-orange-500";
      case "rare":
        return "from-blue-400 to-blue-600";
      default:
        return "from-slate-400 to-slate-600";
    }
  }

  // Get rarity border color class
  function getRarityBorder(category: RarityCategory): string {
    switch (category) {
      case "legendary":
        return "border-rose-500";
      case "epic":
        return "border-amber-500";
      case "rare":
        return "border-blue-500";
      default:
        return "border-border";
    }
  }

  // Create duplicated card pool for infinite scroll
  function createDuplicatedPool(pool: CardPoolItem[], duplicates: number = 4): CardPoolItem[] {
    const duplicated: CardPoolItem[] = [];
    for (let i = 0; i < duplicates; i++) {
      duplicated.push(...pool);
    }
    return duplicated;
  }

  // Find winning card index in pool
  function findWinningCardIndex(pool: CardPoolItem[], winningCard: Card | null): number {
    if (!winningCard || !pool.length) return Math.floor(pool.length / 2);
    
    // Try multiple matching strategies
    // 1. Match by id
    let index = pool.findIndex((c) => c.id === winningCard.id);
    if (index >= 0) return index;
    
    // 2. Match by name (case insensitive)
    const cardNameLower = winningCard.card_name?.toLowerCase();
    if (cardNameLower) {
      index = pool.findIndex((c) => c.name?.toLowerCase() === cardNameLower);
      if (index >= 0) return index;
    }
    
    // 3. Match by value (within 10 cents tolerance)
    if (winningCard.value_cents) {
      index = pool.findIndex(
        (c) => Math.abs((c.market_value || 0) - winningCard.value_cents) < 10
      );
      if (index >= 0) return index;
    }
    
    // Fallback to middle
    return Math.floor(pool.length / 2);
  }

  // Calculate scroll position to center winning card
  function calculateWinningScrollPosition(
    cardIndex: number,
    poolLength: number,
    containerWidth: number
  ): number {
    const centerOffset = containerWidth / 2 - cardWidth / 2;
    const cardPosition = cardIndex * cardItemWidth;
    return cardPosition - centerOffset;
  }

  // Track changes and handle them with minimal effects
  $effect(() => {
    // Handle opening start - reset and start animation when opening begins
    if (isOpening && cardPool.length > 0) {
      // If we're starting a new opening (either first time or after reveal)
      if (!previousIsOpening || animationPhase === "reveal") {
        previousIsOpening = true;
        previousCard = null; // Clear previous card so new one can trigger VFX
        resetAnimation();
        // Small delay to ensure reset completes
        setTimeout(() => {
          startCarouselAnimation();
        }, 10);
      }
    }
    // Handle opening end
    else if (!isOpening && previousIsOpening) {
      previousIsOpening = false;
      // Don't reset here - keep reveal state if card is shown
      // Only reset if no card
      if (!card && animationPhase !== "idle") {
        resetAnimation();
        previousCard = null;
      }
    }
  });

  $effect(() => {
    // Handle card received during animation - stop scrolling and decelerate
    if (card && isOpening && card !== previousCard && animationPhase === "fast") {
      previousCard = card;
      stopScrollingAndDecelerate();
    }
    // Handle card reveal after opening completes
    else if (card && !isOpening && card !== previousCard && animationPhase !== "reveal") {
      previousCard = card;
      const category = getRarityCategory(card.value_cents || 0);
      triggerRevealVFX(category);
      animationPhase = "reveal";
    }
  });

  function startCarouselAnimation() {
    if (!cardPool.length) return;

    const duplicatedPool = createDuplicatedPool(cardPool, 4);
    const poolLength = duplicatedPool.length;
    const singlePoolWidth = cardPool.length * cardItemWidth; // Width of one set of cards
    const startIndex = Math.floor(poolLength / 2); // Start in middle of duplicated pool
    const totalWidth = poolLength * cardItemWidth;

    // Phase 1: Constant speed infinite scroll
    animationPhase = "fast";
    scrollPosition = startIndex * cardItemWidth;
    scrollStartTime = performance.now();
    
    const scrollSpeed = 2000; // pixels per second (always positive, scrolling right)
    let lastTime = scrollStartTime;

    const scrollLoop = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      if (shouldDecelerate) {
        // Smooth deceleration phase
        const elapsed = (currentTime - decelerationStartTime) / 1000; // seconds
        const duration = 1.5; // 1.5 seconds for deceleration
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic function
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate from start position to target
        const distance = decelerationTarget - decelerationStartPosition;
        scrollPosition = decelerationStartPosition + (distance * eased);
        
        // Wrap around to maintain infinite scroll feel
        const singlePoolWidth = cardPool.length * cardItemWidth;
        if (scrollPosition >= totalWidth) {
          scrollPosition = scrollPosition % singlePoolWidth;
        } else if (scrollPosition < 0) {
          scrollPosition = singlePoolWidth + (scrollPosition % singlePoolWidth);
        }
        
        // Continue until we reach the target
        if (progress < 1) {
          scrollAnimationId = requestAnimationFrame(scrollLoop);
        } else {
          // Deceleration complete, transition to lock phase
          animationPhase = "lock";
          setTimeout(() => {
            animationPhase = "reveal";
            if (card) {
              const category = getRarityCategory(card.value_cents || 0);
              triggerRevealVFX(category);
            }
          }, 300);
        }
      } else {
        // Continue scrolling at constant speed
        scrollPosition += scrollSpeed * deltaTime;

        // Wrap around to create infinite scroll effect
        // When we scroll past one full set, wrap to equivalent position in next set
        // This maintains visual continuity since cards are duplicated
        if (scrollPosition >= totalWidth) {
          // Wrap to equivalent position in the first set
          scrollPosition = scrollPosition % singlePoolWidth;
        } else if (scrollPosition < 0) {
          // Handle negative wrap (shouldn't happen with forward scroll, but just in case)
          scrollPosition = singlePoolWidth + (scrollPosition % singlePoolWidth);
        }

        // Continue the loop
        scrollAnimationId = requestAnimationFrame(scrollLoop);
      }
    };

    // Start the scroll loop
    scrollAnimationId = requestAnimationFrame(scrollLoop);
  }

  function stopScrollingAndDecelerate() {
    if (!cardPool.length || !card) return;

    const duplicatedPool = createDuplicatedPool(cardPool, 4);
    const poolLength = duplicatedPool.length;
    const totalWidth = poolLength * cardItemWidth;
    
    // Phase 2: Calculate current position and decelerate to winning card
    animationPhase = "decelerate";
    
    const winningIndex = findWinningCardIndex(duplicatedPool, card);
    winningCardIndex = winningIndex;

    if (carouselContainer) {
      const containerWidth = carouselContainer.clientWidth;
      
      // Calculate target scroll position for the winning card
      const targetCardPosition = winningIndex * cardItemWidth;
      const centerOffset = containerWidth / 2 - cardWidth / 2;
      let targetScroll = targetCardPosition - centerOffset;

      // Normalize current scroll position (account for wrapping)
      const singlePoolWidth = cardPool.length * cardItemWidth;
      let currentScroll = scrollPosition % singlePoolWidth;
      if (currentScroll < 0) currentScroll += singlePoolWidth;

      // Calculate the shortest path to target, keeping the same direction (forward)
      // Since we're always scrolling forward, we need to find the next occurrence
      // of the winning card that's ahead of us
      let distanceForward = targetScroll - currentScroll;
      
      // If target is behind us, wrap forward to the next occurrence
      if (distanceForward < 0) {
        distanceForward = (targetScroll + singlePoolWidth) - currentScroll;
      }
      
      // Ensure we're scrolling forward (positive distance)
      const finalTarget = currentScroll + distanceForward;

      // Set up smooth deceleration - don't cancel the loop, just change its behavior
      shouldDecelerate = true;
      decelerationStartPosition = currentScroll;
      decelerationTarget = finalTarget;
      decelerationStartTime = performance.now();
      
      // The scroll loop will handle the smooth deceleration
    }
  }

  function resetAnimation() {
    // Stop any running scroll animation
    if (scrollAnimationId !== null) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
    animationPhase = "idle";
    scrollPosition = 0;
    winningCardIndex = -1;
    shakeOffset = { x: 0, y: 0 };
    confettiActive = false;
    scrollStartTime = 0;
    shouldDecelerate = false;
    decelerationTarget = 0;
    decelerationStartTime = 0;
    decelerationStartPosition = 0;
    // Note: Don't reset previousIsOpening or previousCard here
    // They are managed by the effects
  }

  function triggerRevealVFX(category: RarityCategory) {
    if (category === "legendary") {
      // Screen shake
      const shakeDuration = 600;
      const shakeIntensity = 8;
      let shakeTime = 0;

      const shakeInterval = setInterval(() => {
        shakeTime += 16;
        if (shakeTime >= shakeDuration) {
          clearInterval(shakeInterval);
          shakeOffset = { x: 0, y: 0 };
        } else {
          shakeOffset = {
            x: (Math.random() - 0.5) * shakeIntensity,
            y: (Math.random() - 0.5) * shakeIntensity,
          };
        }
      }, 16);

      // Confetti
      confettiActive = true;
      setTimeout(() => {
        confettiActive = false;
      }, 3000);
    }
  }

  // Get duplicated pool for rendering
  let duplicatedPool = $derived(cardPool.length > 0 ? createDuplicatedPool(cardPool, 4) : []);
</script>

{#if isOpening}
  <!-- Carousel Opening Animation Overlay -->
  <div
    class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
    style="transform: translate({shakeOffset.x}px, {shakeOffset.y}px); transition: transform 0.05s linear;"
  >
    <div class="w-full max-w-7xl px-4">
      <!-- Carousel Container -->
      <div
        bind:this={carouselContainer}
        class="relative w-full overflow-visible"
        style="height: {cardWidth * 1.5 + 40}px; min-height: 400px;"
      >
        <!-- Card Strip -->
        <div
          class="absolute top-0 left-0 flex items-start"
          style="transform: translateX(-{scrollPosition}px); will-change: transform; gap: {cardGap}px; padding-top: 20px;"
        >
          {#each duplicatedPool as cardItem, index}
            {@const imageUrl = extractImageUrl(cardItem.image_uri)}
            {@const valueCents = getCardValueCents(cardItem)}
            {@const rarity = getRarityCategory(valueCents)}
            {@const isRarePlus = rarity !== "common"}
            {@const isWinning = card && (cardItem.id === card.id || cardItem.name === card.card_name)}
            {@const isFocused = Math.abs(index - winningCardIndex) < 3 && animationPhase === "lock"}

            <div
              class="relative transition-all duration-300 shrink-0 {isFocused
                ? "scale-110 z-10"
                : "scale-100"}"
              style="width: {cardWidth}px; aspect-ratio: 2/3;"
            >
              <!-- Card Image -->
              <div
                class="w-full h-full rounded-lg overflow-hidden border-2 {isWinning && animationPhase === "lock"
                  ? "border-yellow-400 shadow-2xl shadow-yellow-400/50"
                  : getRarityBorder(rarity)}"
              >
                {#if imageUrl}
                  <img
                    src={imageUrl}
                    alt={cardItem.name}
                    class="w-full h-full object-contain"
                  />
                {:else}
                  <div
                    class="w-full h-full flex items-center justify-center bg-muted"
                  >
                    <IconPackage size={32} class="text-muted-foreground/50" />
                  </div>
                {/if}
              </div>

            </div>
          {/each}
        </div>

        <!-- Center Indicator -->
        <div
          class="absolute left-1/2 top-0 -translate-x-1/2 w-2 border-x-2 border-primary/50 pointer-events-none"
          style="height: {cardWidth * 1.5 + 20}px;"
        ></div>
      </div>

      <!-- Loading Text -->
      <div class="text-center mt-8">
        <p class="text-xl font-bold text-foreground">Opening Pack...</p>
        <p class="text-sm text-muted-foreground mt-2">The magic is happening!</p>
      </div>
    </div>
  </div>
{/if}

{#if card && !isOpening}
  {@const rarityCategory = getRarityCategory(card.value_cents || 0)}
  {@const isLegendary = rarityCategory === "legendary"}
  {@const isEpic = rarityCategory === "epic"}
  {@const isRare = rarityCategory === "rare"}
  <!-- Card Reveal Overlay -->
  <div
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500"
    style="transform: translate({shakeOffset.x}px, {shakeOffset.y}px);"
  >
    <!-- Close Button -->
    <Button
      variant="ghost"
      size="icon"
      class="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background border"
      onclick={onClose}
      disabled={isSelling || isShipping}
    >
      <IconX size={20} />
    </Button>

    <div class="flex flex-col items-center max-w-md w-full space-y-8">

      <div class="relative w-full">
        <!-- Glow Effect -->
        <div
          class="absolute inset-0 bg-gradient-to-r {getValueGradient(
            card.value_cents || 0
          )} rounded-3xl blur-3xl opacity-60 scale-110 {isRare || isEpic || isLegendary
            ? "animate-pulse"
            : ""}"
        ></div>

        <!-- Lens Flare for Epic+ -->
        {#if isEpic || isLegendary}
          <div
            class="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent animate-lens-flare"
            ></div>
          </div>
        {/if}

        <!-- Card -->
        <div
          class="relative aspect-[3/4] rounded-3xl bg-gradient-to-br {getValueGradient(
            card.value_cents || 0
          )} p-1 shadow-2xl {isLegendary
            ? "animate-card-pop-legendary"
            : isEpic
              ? "animate-card-pop-epic"
              : isRare
                ? "animate-card-pop-rare"
                : "animate-card-pop-common"}"
        >
          <div
            class="w-full h-full rounded-[22px] bg-card flex flex-col items-center justify-center p-8 text-center"
          >
            {#if card.card_image_url}
              <img
                src={card.card_image_url}
                alt={card.card_name}
                class=" h-96 object-contain mb-4 rounded-lg"
              />
            {/if}

            <div
              class="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-br {getValueGradient(
                card.value_cents || 0
              )} bg-clip-text text-transparent"
            >
              ${((card.value_cents || 0) / 100).toFixed(2)}
            </div>

            {#if card.card_name}
              <p class="text-xl font-semibold mb-2">
                {card.card_name}
              </p>
            {/if}

            {#if card.set_name}
              <p class="text-muted-foreground">{card.set_name}</p>
            {/if}

            {#if card.rarity}
              <p class="text-sm text-muted-foreground mt-2">
                {card.rarity}
              </p>
            {/if}
          </div>
        </div>

        <!-- Chromatic Aberration for Legendary -->
        {#if isLegendary}
          <div
            class="absolute inset-0 rounded-3xl pointer-events-none mix-blend-screen"
            style="filter: url(#chromatic-aberration);"
          >
            <svg class="absolute inset-0 w-0 h-0">
              <defs>
                <filter id="chromatic-aberration">
                  <feOffset in="SourceGraphic" dx="2" dy="0" result="red" />
                  <feOffset in="SourceGraphic" dx="-2" dy="0" result="blue" />
                  <feComponentTransfer in="red">
                    <feFuncA type="discrete" tableValues="1 0" />
                  </feComponentTransfer>
                  <feComponentTransfer in="blue">
                    <feFuncA type="discrete" tableValues="0 1" />
                  </feComponentTransfer>
                  <feBlend in="SourceGraphic" in2="red" mode="screen" />
                  <feBlend in="SourceGraphic" in2="blue" mode="screen" />
                </filter>
              </defs>
            </svg>
          </div>
        {/if}
      </div>

      <!-- Confetti Canvas for Legendary -->
      {#if isLegendary && confettiActive}
        <ConfettiCanvas active={confettiActive} />
      {/if}

      <!-- Action Buttons -->
      <div class="flex flex-wrap justify-center gap-3 w-full">
        <Button
          variant="outline"
          size="lg"
          onclick={async () => {
            if (card) {
              await onSell(card.id);
            }
          }}
          disabled={isSelling || isShipping}
        >
          {#if isSelling}
            <IconLoader2 size={18} class="mr-2 animate-spin" />
            Selling...
          {:else}
            Sell for {(Math.floor(((card.value_cents ?? 0) * sellbackRate) / 100) / 100).toFixed(2)} Rips
          {/if}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          class="text-white"
          onclick={() => {
            if (card) {
              onShip(card.id);
            }
          }}
          disabled={isSelling || isShipping}
        >
          <IconPackage size={18} class="mr-2" />
          Ship Card
        </Button>
        <Button size="lg" onclick={onOpenAnother} disabled={isSelling || isShipping} class="text-white">
          <IconSparkles size={18} class="mr-2" />
          Keep Ripping
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes glint {
    0% {
      transform: translateX(-100%) skewX(-20deg);
    }
    100% {
      transform: translateX(200%) skewX(-20deg);
    }
  }

  @keyframes lens-flare {
    0%,
    100% {
      opacity: 0;
      transform: rotate(0deg) scale(1);
    }
    50% {
      opacity: 1;
      transform: rotate(180deg) scale(1.2);
    }
  }

  @keyframes card-pop-common {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes card-pop-rare {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    30% {
      transform: scale(1.1);
    }
    60% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes card-pop-epic {
    0% {
      transform: scale(0.7);
      opacity: 0;
    }
    25% {
      transform: scale(1.15);
    }
    50% {
      transform: scale(0.9);
    }
    75% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes card-pop-legendary {
    0% {
      transform: scale(0.6) rotate(-5deg);
      opacity: 0;
    }
    20% {
      transform: scale(1.2) rotate(3deg);
    }
    40% {
      transform: scale(0.85) rotate(-2deg);
    }
    60% {
      transform: scale(1.1) rotate(1deg);
    }
    80% {
      transform: scale(0.95) rotate(-0.5deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  .animate-glint {
    animation: glint 2s infinite;
  }

  .animate-lens-flare {
    animation: lens-flare 3s ease-in-out infinite;
  }

  .animate-card-pop-common {
    animation: card-pop-common 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-card-pop-rare {
    animation: card-pop-rare 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-card-pop-epic {
    animation: card-pop-epic 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .animate-card-pop-legendary {
    animation: card-pop-legendary 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
</style>
