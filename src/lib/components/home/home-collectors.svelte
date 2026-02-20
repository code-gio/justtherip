<script lang="ts">
  import { IconUser, IconX, IconClock, IconSparkles, IconChevronLeft, IconChevronRight } from "@tabler/icons-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Tabs from "$lib/components/ui/tabs";

  interface Profile {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  }

  interface RecentPull {
    id: string;
    card_name: string;
    card_image_url: string | null;
    card_value_cents: number;
    created_at: string;
    game_code: string;
    rarity: string | null;
    is_foil: boolean | null;
    user_id: string;
    profiles: Profile | null;
  }

  interface Game {
    id: string;
    name: string;
    code: string;
  }

  let { 
    recentPulls = [], 
    rarePulls = [],
    games = [],
  }: { 
    recentPulls?: RecentPull[]; 
    rarePulls?: RecentPull[];
    games?: Game[];
  } = $props();

  let selectedCard: RecentPull | null = $state(null);
  let isDialogOpen = $state(false);
  let zoomPosition = $state({ x: 0, y: 0 });
  let showZoom = $state(false);
  let activeTab = $state<"recent" | "rare">("recent");
  let selectedGameCode = $state<string>("all");
  let carouselTrack: HTMLElement | null = $state(null);
  let animationDuration = $state(120);
  let manualOffset = $state(0);

  let basePulls = $derived(activeTab === "recent" ? recentPulls : rarePulls);
  let displayedPulls = $derived(
    selectedGameCode === "all"
      ? basePulls
      : basePulls.filter((p) => (p.game_code || "") === selectedGameCode)
  );

  const CARD_WIDTH = 240;
  const CARD_GAP = 24;
  const CARD_SCROLL_DISTANCE = CARD_WIDTH + CARD_GAP;
  const CARDS_PER_SCROLL = 3;
  const SCROLL_STEP = CARD_SCROLL_DISTANCE * CARDS_PER_SCROLL;

  function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function openCardDialog(card: RecentPull) {
    selectedCard = card;
    isDialogOpen = true;
  }

  function closeDialog() {
    isDialogOpen = false;
    selectedCard = null;
    showZoom = false;
  }

  function handleMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    zoomPosition = { x, y };
  }

  function handleMouseEnter() {
    showZoom = true;
  }

  function handleMouseLeave() {
    showZoom = false;
  }

  function scrollCarouselLeft() {
    const el = carouselTrack;
    if (el) {
      manualOffset = manualOffset + SCROLL_STEP;
      el.style.setProperty('--manual-offset', `${manualOffset}px`);
      el.style.transition = 'transform 0.6s ease-in-out';
      setTimeout(() => {
        el.style.transition = '';
      }, 600);
    }
  }

  function scrollCarouselRight() {
    const el = carouselTrack;
    if (el) {
      manualOffset = manualOffset - SCROLL_STEP;
      el.style.setProperty('--manual-offset', `${manualOffset}px`);
      el.style.transition = 'transform 0.6s ease-in-out';
      setTimeout(() => {
        el.style.transition = '';
      }, 600);
    }
  }
</script>

<section class="collectors">
  <div class="container">
    <div class="header">
      <span class="collectors-label">TOP PULLS</span>
      <h2 class="collectors-title">Top Community Pulls</h2>
    </div>

    <div class="filters-row">
      <Tabs.Root bind:value={activeTab} class="tabs-container">
        <Tabs.List class="tabs-list">
          <Tabs.Trigger value="recent" class="tab-trigger">
            <IconClock size={16} />
            Most Recent
          </Tabs.Trigger>
          <Tabs.Trigger value="rare" class="tab-trigger">
            <IconSparkles size={16} />
            Top Rares
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {#if games.length > 0}
        <div class="game-filter">
          <label for="collectors-game-select" class="game-filter-label">Game</label>
          <select
            id="collectors-game-select"
            bind:value={selectedGameCode}
            class="game-select"
          >
            <option value="all">All</option>
            {#each games as game (game.id)}
              <option value={game.code}>{game.name}</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    {#if displayedPulls.length > 0}
      <div class="carousel-wrapper" class:paused={isDialogOpen}>
        <button 
          class="carousel-btn carousel-btn-left" 
          onclick={scrollCarouselLeft}
          aria-label="Scroll carousel left"
        >
          <IconChevronLeft size={24} />
        </button>

        <div class="carousel-track" bind:this={carouselTrack} style="animation-duration: {animationDuration}s;">
          <!-- Cards cloned 8 times for infinite scroll effect -->
          {#each Array(8) as _, iteration}
            {#each displayedPulls as pull (`${pull.id}-${iteration}`)}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="pull-card" onclick={() => openCardDialog(pull)}>
                <div class="card-image-wrapper">
                  {#if pull.card_image_url}
                    <img
                      src={pull.card_image_url}
                      alt={pull.card_name}
                      class="card-image"
                      loading="lazy"
                    />
                  {:else}
                    <div class="card-placeholder">
                      <span>No Image</span>
                    </div>
                  {/if}
                  <div class="badges-container">
                    {#if pull.rarity}
                      <div class="rarity-badge rarity-{pull.rarity.toLowerCase()}">
                        {pull.rarity.toUpperCase()}
                      </div>
                    {/if}
                    {#if pull.is_foil}
                      <div class="foil-badge">FOIL</div>
                    {/if}
                  </div>
                </div>

                <div class="card-content">
                  <h3 class="card-name" title={pull.card_name}>
                    {pull.card_name}
                  </h3>
                  <div class="card-value">
                    {formatPrice(pull.card_value_cents)}
                  </div>
                </div>

                <div class="card-footer">
                  <div class="user-info">
                    {#if pull.profiles?.avatar_url}
                      <img
                        src={pull.profiles.avatar_url}
                        alt={pull.profiles.display_name || pull.profiles.username || "User"}
                        class="user-avatar"
                      />
                    {:else}
                      <div class="user-avatar-placeholder">
                        <IconUser size={16} />
                      </div>
                    {/if}
                    <div class="user-details">
                      <span class="username">
                        {pull.profiles?.display_name || pull.profiles?.username || "Anonymous"}
                      </span>
                      <span class="pull-time">
                        {formatTimeAgo(pull.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {/each}
        </div>

        <button 
          class="carousel-btn carousel-btn-right" 
          onclick={scrollCarouselRight}
          aria-label="Scroll carousel right"
        >
          <IconChevronRight size={24} />
        </button>
      </div>
    {:else}
      <div class="empty-state">
        <p>No recent pulls yet. Be the first to open a pack!</p>
      </div>
    {/if}
  </div>

  <!-- Card Detail Dialog -->
  <Dialog.Root open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
    <Dialog.Content class=" min-w-6xl max-w-6xl min-h-6xl max-h-[90vh] overflow-y-auto">
      {#if selectedCard}
        <Dialog.Header>
          <Dialog.Title class="text-2xl font-bold pr-8">
            {selectedCard.card_name}
          </Dialog.Title>
        </Dialog.Header>

        <div class="dialog-body">
          <div class="image-section">
            {#if selectedCard.card_image_url}
              <div
                class="zoom-container"
                role="img"
                aria-label="Card image with zoom"
                onmousemove={handleMouseMove}
                onmouseenter={handleMouseEnter}
                onmouseleave={handleMouseLeave}
              >
                <img
                  src={selectedCard.card_image_url}
                  alt={selectedCard.card_name}
                  class="card-detail-image"
                />
                {#if showZoom}
                  <div
                    class="zoom-lens"
                    style="background-image: url('{selectedCard.card_image_url}'); background-position: {zoomPosition.x}% {zoomPosition.y}%;"
                  ></div>
                {/if}
              </div>
            {:else}
              <div class="no-image-placeholder">
                <span>No image available</span>
              </div>
            {/if}
          </div>

          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Value</span>
                <span class="info-value highlight">{formatPrice(selectedCard.card_value_cents)}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Game</span>
                <span class="info-value">{selectedCard.game_code.toUpperCase()}</span>
              </div>

              {#if selectedCard.rarity}
                <div class="info-item">
                  <span class="info-label">Rarity</span>
                  <span class="info-value">{selectedCard.rarity}</span>
                </div>
              {/if}

              {#if selectedCard.is_foil}
                <div class="info-item">
                  <span class="info-label">Foil</span>
                  <span class="info-value foil-text">Yes ✨</span>
                </div>
              {/if}

              <div class="info-item">
                <span class="info-label">Pulled</span>
                <span class="info-value">{formatTimeAgo(selectedCard.created_at)}</span>
              </div>
            </div>

            <div class="user-section">
              <span class="info-label">Pulled by</span>
              <div class="user-info-dialog">
                {#if selectedCard.profiles?.avatar_url}
                  <img
                    src={selectedCard.profiles.avatar_url}
                    alt={selectedCard.profiles.display_name || selectedCard.profiles.username || "User"}
                    class="user-avatar-large"
                  />
                {:else}
                  <div class="user-avatar-placeholder-large">
                    <IconUser size={24} />
                  </div>
                {/if}
                <div>
                  <div class="username-large">
                    {selectedCard.profiles?.display_name || selectedCard.profiles?.username || "Anonymous"}
                  </div>
                  <div class="user-id-text">
                    {formatTimeAgo(selectedCard.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</section>

<style>
  .collectors {
    padding: 4rem 2rem;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .filters-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem 1.5rem;
    margin-bottom: 2rem;
  }

  .tabs-container {
    display: flex;
    justify-content: center;
  }

  .game-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .game-filter-label {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .game-select {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: white;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(138, 56, 245, 0.3);
    border-radius: 8px;
    cursor: pointer;
    min-width: 120px;
  }

  .game-select:hover {
    border-color: rgba(138, 56, 245, 0.5);
  }

  .game-select:focus {
    outline: none;
    border-color: rgba(138, 56, 245, 0.6);
    box-shadow: 0 0 0 2px rgba(138, 56, 245, 0.2);
  }

  :global(.tabs-list) {
    display: inline-flex;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(138, 56, 245, 0.2);
    border-radius: 12px;
    padding: 4px;
    gap: 4px;
  }

  :global(.tab-trigger) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  :global(.tab-trigger:hover) {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(138, 56, 245, 0.1);
  }

  :global(.tab-trigger[data-state="active"]) {
    color: white;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.3) 0%,
      rgba(242, 56, 245, 0.2) 100%
    );
    box-shadow: 0 2px 8px rgba(138, 56, 245, 0.3);
  }

  @media (max-width: 768px) {
    :global(.tab-trigger) {
      padding: 8px 16px;
      font-size: 13px;
    }
  }

  .collectors-label {
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.75rem;
  }

  .collectors-title {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-white);
    margin: 0 0 1rem;
    text-transform: uppercase;
  }

  .collectors-description {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .collectors-title {
      font-size: 36px;
    }
  }

  /* Carousel Styles */
  .carousel-wrapper {
    width: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.8) 0%,
      rgba(242, 56, 245, 0.7) 100%
    );
    border: 2px solid rgba(138, 56, 245, 0.6);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(8px);
  }

  .carousel-btn:hover {
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 1) 0%,
      rgba(242, 56, 245, 0.9) 100%
    );
    box-shadow: 0 8px 24px rgba(138, 56, 245, 0.4);
    transform: translateY(-50%) scale(1.1);
    border-color: rgba(242, 56, 245, 0.8);
  }

  .carousel-btn:active {
    transform: translateY(-50%) scale(0.95);
  }

  .carousel-btn-left {
    left: 0;
  }

  .carousel-btn-right {
    right: 0;
  }

  .carousel-track {
    display: flex;
    gap: 1.5rem;
    width: fit-content;
    padding: 2rem 0;
    --manual-offset: 0px;
    transform: translateX(var(--manual-offset));
    animation-name: scroll;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-composition: add;
  }

  .carousel-wrapper:has(.pull-card:hover) .carousel-track {
    animation-play-state: paused;
  }

  .carousel-wrapper.paused .carousel-track {
    animation-play-state: paused;
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-12.5%);
    }
  }

  @media (max-width: 768px) {
    .carousel-track {
      gap: 1rem;
    }

    .carousel-btn {
      width: 40px;
      height: 40px;
    }
  }

  .pull-card {
    position: relative;
    background: linear-gradient(
      135deg,
      rgba(124, 58, 237, 0.15) 0%,
      rgba(91, 33, 182, 0.1) 100%
    );
    border: 1px solid rgba(138, 56, 245, 0.2);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    flex-shrink: 0;
    width: 240px;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .pull-card {
      width: 180px;
    }
  }

  .pull-card:hover {
    transform: translateY(-12px) scale(1.05);
    box-shadow: 
      0 20px 40px rgba(138, 56, 245, 0.3),
      0 0 30px rgba(138, 56, 245, 0.2);
    border-color: rgba(242, 56, 245, 0.4);
    z-index: 10;
  }

  .card-image-wrapper {
    position: relative;
    aspect-ratio: 5/7;
    background: rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pull-card:hover .card-image {
    transform: scale(1.08);
  }

  .card-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.2) 0%,
      rgba(242, 56, 245, 0.1) 100%
    );
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  .badges-container {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
  }

  .rarity-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    backdrop-filter: blur(8px);
  }

  .rarity-mythic {
    background: linear-gradient(
      135deg,
      rgba(255, 69, 0, 0.9) 0%,
      rgba(220, 20, 60, 0.9) 100%
    );
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 69, 0, 0.4);
  }

  .rarity-rare {
    background: linear-gradient(
      135deg,
      rgba(255, 215, 0, 0.9) 0%,
      rgba(218, 165, 32, 0.9) 100%
    );
    color: #000;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  }

  .rarity-uncommon {
    background: linear-gradient(
      135deg,
      rgba(192, 192, 192, 0.9) 0%,
      rgba(169, 169, 169, 0.9) 100%
    );
    color: #000;
    box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
  }

  .rarity-common {
    background: linear-gradient(
      135deg,
      rgba(105, 105, 105, 0.9) 0%,
      rgba(64, 64, 64, 0.9) 100%
    );
    color: #fff;
    box-shadow: 0 2px 8px rgba(105, 105, 105, 0.4);
  }

  .foil-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    background: linear-gradient(
      135deg,
      rgba(138, 43, 226, 0.9) 0%,
      rgba(75, 0, 130, 0.9) 100%
    );
    color: #fff;
    box-shadow: 0 2px 8px rgba(138, 43, 226, 0.4);
  }

  .card-content {
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }

  .card-name {
    font-size: 14px;
    font-weight: 600;
    color: white;
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  .card-value {
    font-size: 16px;
    font-weight: 700;
    color: rgba(138, 56, 245, 1);
    transition: all 0.3s ease;
  }

  .pull-card:hover .card-value {
    color: rgba(242, 56, 245, 1);
    transform: scale(1.05);
  }

  .card-footer {
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-avatar,
  .user-avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .user-avatar {
    object-fit: cover;
    border: 2px solid rgba(138, 56, 245, 0.3);
  }

  .user-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.3) 0%,
      rgba(242, 56, 245, 0.2) 100%
    );
    border: 2px solid rgba(138, 56, 245, 0.3);
    color: rgba(255, 255, 255, 0.6);
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .username {
    font-size: 13px;
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pull-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
  }

  /* Dialog Styles */
  :global(.dialog-body) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1.5rem;
  }

  @media (max-width: 768px) {
    :global(.dialog-body) {
      grid-template-columns: 1fr;
    }
  }

  .image-section {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .zoom-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    cursor: crosshair;
    overflow: hidden;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.2);
  }

  .card-detail-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 12px;
  }

  .zoom-lens {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 200%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 12px;
  }

  .zoom-container:hover .zoom-lens {
    opacity: 1;
  }

  .no-image-placeholder {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 5/7;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.2) 0%,
      rgba(242, 56, 245, 0.1) 100%
    );
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.6);
  }

  .info-value {
    font-size: 18px;
    font-weight: 600;
    color: white;
  }

  .info-value.highlight {
    font-size: 24px;
    font-weight: 700;
    color: rgba(138, 56, 245, 1);
  }

  .foil-text {
    color: rgba(255, 215, 0, 1);
  }

  .user-section {
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-info-dialog {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .user-avatar-large,
  .user-avatar-placeholder-large {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .user-avatar-large {
    object-fit: cover;
    border: 3px solid rgba(138, 56, 245, 0.4);
  }

  .user-avatar-placeholder-large {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.3) 0%,
      rgba(242, 56, 245, 0.2) 100%
    );
    border: 3px solid rgba(138, 56, 245, 0.4);
    color: rgba(255, 255, 255, 0.6);
  }

  .username-large {
    font-size: 16px;
    font-weight: 600;
    color: white;
  }

  .user-id-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }
</style>
