<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { IconPackage, IconCoin, IconEye } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { balance, packs } = $derived(data);
</script>

<div class="min-h-screen bg-background px-4 md:px-6 py-8">
  <div class="max-w-7xl mx-auto">
    {#if !packs || packs.length === 0}
      <div class="text-center py-16">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-primary/10"
        >
          <IconPackage size={32} class="text-primary" />
        </div>
        <h3 class="text-lg font-bold text-foreground mb-1">No packs found</h3>
        <p class="text-muted-foreground">No active packs available</p>
      </div>
    {:else}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        {#each packs as pack (pack.id)}
          <div
            class="group overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <!-- Pack Image -->
            <div class="relative aspect-square bg-muted overflow-hidden">
              {#if pack.image}
                <img
                  src={pack.image}
                  alt={pack.name}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              {:else}
                <div
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
                >
                  <IconPackage size={64} class="text-muted-foreground/50" />
                </div>
              {/if}
            </div>

            <!-- Pack Info -->
            <div class="p-4 space-y-3">
              <!-- Pack Name -->
              <div>
                <h3 class="font-semibold text-lg leading-tight">{pack.name}</h3>
              </div>

              <!-- Price and Button -->
              <div class="flex items-center justify-between pt-2 border-t">
                <div class="flex items-center gap-1.5">
                  <IconCoin size={20} class="text-amber-500" />
                  <span class="text-xl font-bold">{pack.price}</span>
                  <span class="text-sm text-muted-foreground">Rips</span>
                </div>

                <Button
                  size="sm"
                  onclick={() => goto(`/packs/${pack.id}`)}
                  variant="outline"
                >
                  <IconEye size={16} class="mr-1.5" />
                  View
                </Button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
