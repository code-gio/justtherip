<script lang="ts">
  import PackCardDisplay from "$lib/components/packs/pack-card-display.svelte";

  interface PackPreview {
    id: string;
    name: string;
    image: string | null;
    price: number;
    game_code?: string;
    topCards?: Array<{
      id: string;
      name: string;
      image_url: string | null;
      market_value: number;
    }>;
  }

  interface Props {
    packs: PackPreview[];
    selectedPackId: string | null;
    onSelectPack: (pack: PackPreview) => void;
  }

  let { packs, selectedPackId, onSelectPack }: Props = $props();
</script>

<section class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Available Packs</h2>
    <p class="text-sm text-muted-foreground">
      Each pack's probabilities are calculated from its market values.
    </p>
  </div>

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    {#each packs as pack (pack.id)}
      <div
        class={`relative rounded-3xl border p-1 transition ${
          selectedPackId === pack.id
            ? "border-primary/70 bg-primary/5 shadow-lg"
            : "border-border bg-card hover:border-primary/60 hover:shadow-lg"
        }`}
      >
        <div class="cursor-pointer" on:click={() => onSelectPack(pack)}>
          <PackCardDisplay pack={pack} class="w-full" />
        </div>
        {#if selectedPackId === pack.id}
          <div class="pointer-events-none absolute top-3 right-3 rounded-full bg-primary text-xs font-semibold uppercase tracking-wide px-3 py-1 text-background">
            Selected
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
