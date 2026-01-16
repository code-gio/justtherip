<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    asChild = false,
    children,
    ...restProps
  }: CollapsiblePrimitive.TriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger bind:ref {asChild} {...restProps}>
  {@render children?.()}
</CollapsiblePrimitive.Trigger>
