<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { IconDotsVertical, IconEdit, IconEye } from "@tabler/icons-svelte";
  import type { AdminShipment } from "$lib/components/shipments/types";

  interface Props {
    shipment: AdminShipment;
    onUpdate: (shipment: AdminShipment) => void;
    onViewPurchaseOptions: (shipment: AdminShipment) => void;
  }

  let { shipment, onUpdate, onViewPurchaseOptions }: Props = $props();

  // $effect(() => {
  //   console.log("shipment", shipment);
  // });
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="sm">
        <IconDotsVertical size={16} />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={() => onUpdate(shipment)}>
      <IconEdit size={16} class="mr-2" />
      Update Status
    </DropdownMenu.Item>
    <DropdownMenu.Item onSelect={() => onViewPurchaseOptions(shipment)}>
      <!-- <IconEdit size={16} class="mr-2" /> -->
      <IconEye size={16} class="mr-2" />
      View Purchase Options
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
