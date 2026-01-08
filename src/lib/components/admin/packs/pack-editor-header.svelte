<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    IconArrowLeft,
    IconDeviceFloppy,
    IconRocket,
    IconBan,
  } from "@tabler/icons-svelte";

  interface Props {
    isActive: boolean;
    isLoading: boolean;
    canPublish: boolean;
    onBack: () => void;
    onSave: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
  }

  let {
    isActive,
    isLoading,
    canPublish,
    onBack,
    onSave,
    onPublish,
    onUnpublish,
  }: Props = $props();
</script>

<div class="flex items-center justify-between gap-4 mb-6">
  <div class="flex items-center gap-4 flex-1">
    <Button variant="outline" size="icon" onclick={onBack}>
      <IconArrowLeft size={18} />
    </Button>
    <div class="flex-1">
      <h1 class="text-2xl font-bold">Pack Editor</h1>
      <p class="text-muted-foreground">
        Configure pack settings and assign cards.
      </p>
    </div>
  </div>
  <div class="flex items-center gap-2">
    <Button
      variant="outline"
      onclick={onSave}
      disabled={isLoading}
    >
      <IconDeviceFloppy size={18} class="mr-2" />
      {isActive ? "Update" : "Save Draft"}
    </Button>
    {#if !isActive}
      <Button
        onclick={onPublish}
        disabled={!canPublish || isLoading}
      >
        <IconRocket size={18} class="mr-2" />
        Publish
      </Button>
    {:else}
      <Button
        variant="destructive"
        onclick={onUnpublish}
        disabled={isLoading}
      >
        <IconBan size={18} class="mr-2" />
        Unpublish
      </Button>
    {/if}
  </div>
</div>
