<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from "bits-ui";

  let {
    open = $bindable(false),
    disabled = false,
    onOpenChange,
    children,
    ...restProps
  }: CollapsiblePrimitive.Props = $props();
</script>

<CollapsiblePrimitive.Root bind:open {disabled} {onOpenChange} {...restProps}>
  {@render children?.()}
</CollapsiblePrimitive.Root>
