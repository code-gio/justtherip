<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog/index.js";

  let {
    open = $bindable(false),
    imageUrl,
  }: {
    open?: boolean;
    imageUrl: string | null;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-4xl">
    <Dialog.Header>
      <Dialog.Title>Card Image</Dialog.Title>
    </Dialog.Header>
    {#if imageUrl}
      <div class="flex justify-center items-center p-4">
        <img
          src={imageUrl}
          alt="Card"
          class="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    {/if}
    <Dialog.Footer>
      <Dialog.Close>
        <Button variant="outline">Close</Button>
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

