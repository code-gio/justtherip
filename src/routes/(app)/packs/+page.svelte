<script lang="ts">
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import {
    IconBolt,
    IconDiamond,
    IconCrown,
    IconPackage,
  } from "@tabler/icons-svelte";
  import {
    PacksGrid,
    type Pack,
  } from "$lib/components/packs";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { balance, packs: serverPacks } = $derived(data);

  // Map server packs to include icons
  const packs = $derived(
    (serverPacks || []).map((pack) => ({
      ...pack,
      icon: getPackIcon(pack.name, pack.set),
    }))
  );

  function getPackIcon(name: string, set: string): any {
    // Map pack names/sets to icons
    const iconMap: Record<string, any> = {
      "prismatic": IconDiamond,
      "spark": IconBolt,
      "crown": IconCrown,
      "masquerade": IconPackage,
      "temporal": IconPackage,
      "fates": IconDiamond,
      "flame": IconPackage,
      "151": IconCrown,
    };

    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }

    return IconPackage; // Default icon
  }

  function handleOpenPack(pack: Pack) {
    if (balance < pack.price) {
      toast.error("Insufficient Rips! Purchase more from the store.");
      return;
    }
    goto(`/packs/${pack.id}`);
  }
</script>

<div class="min-h-screen bg-background">
  <PacksGrid packs={packs} {balance} onOpenPack={handleOpenPack} />
</div>
