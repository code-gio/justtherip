<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { IconInfoCircle } from "@tabler/icons-svelte";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="sm" class="gap-2">
        <IconInfoCircle size={16} />
        <span class="hidden sm:inline">How It Works</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-72" align="end">
    <DropdownMenu.Label>How It Works</DropdownMenu.Label>
    <DropdownMenu.Separator />
    <div class="p-2 space-y-3 text-sm">
      <div class="flex gap-2">
        <span
          class="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold"
          >1</span
        >
        <p class="text-muted-foreground">
          Each pack costs Rips to open and receive a random card
        </p>
      </div>
      <div class="flex gap-2">
        <span
          class="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold"
          >2</span
        >
        <p class="text-muted-foreground">
          Higher value cards are rarer
        </p>
      </div>
      <div class="flex gap-2">
        <span
          class="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold"
          >3</span
        >
        <p class="text-muted-foreground">
          Sell cards for 85% value
        </p>
      </div>
      <div class="flex gap-2">
        <span
          class="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold"
          >4</span
        >
        <p class="text-muted-foreground">
          Get shipped the card you want
        </p>
      </div>
    </div>
  </DropdownMenu.Content>
</DropdownMenu.Root>
