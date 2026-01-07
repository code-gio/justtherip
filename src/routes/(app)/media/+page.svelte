<script lang="ts">
  import Media from "$lib/components/media/media.svelte";
  import type { MediaAsset } from "$lib/types/media";

  let { data } = $props();

  let selectedAsset = $state<MediaAsset | null>(null);

  function handleSelect(asset: MediaAsset) {
    selectedAsset = asset;
  }
</script>

<div class="container mx-auto py-8">
  <Media
    userId={data.session.user.id}
    maxFileSize={50 * 1024 * 1024}
    allowedFileTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
    selectable={false}
  />

  {#if selectedAsset}
    <div class="mt-8 p-4 border rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Selected Asset</h3>
      <p class="text-sm text-muted-foreground mb-4">
        {selectedAsset.originalName}
      </p>
      {#if selectedAsset.mimeType.startsWith("image/")}
        <img
          src={selectedAsset.url}
          alt={selectedAsset.originalName}
          class="max-w-sm rounded-lg"
        />
      {/if}
    </div>
  {/if}
</div>
