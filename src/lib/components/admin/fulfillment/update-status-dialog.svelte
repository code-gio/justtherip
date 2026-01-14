<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button";
  import { IconLoader2 } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import type { AdminShipment, ShipmentStatus } from "$lib/components/shipments/types";

  interface Props {
    open?: boolean;
    shipment: AdminShipment | null;
    onUpdate: () => void;
    onClose: () => void;
  }

  let { open = $bindable(false), shipment, onUpdate, onClose }: Props =
    $props();

  let isLoading = $state(false);
  let formData = $state({
    status: "pending" as ShipmentStatus,
    carrier: "",
    tracking_number: "",
    estimated_delivery_date: "",
    delivered_date: "",
    admin_notes: "",
  });

  const requiresTracking = $derived(
    formData.status === "shipped" || formData.status === "delivered"
  );

  const canSubmit = $derived(() => {
    if (requiresTracking) {
      return (
        formData.carrier.trim() !== "" &&
        formData.tracking_number.trim() !== ""
      );
    }
    return true;
  });

  // Initialize form data when shipment changes
  $effect(() => {
    if (shipment) {
      formData = {
        status: shipment.status,
        carrier: shipment.carrier || "",
        tracking_number: shipment.trackingNumber || "",
        estimated_delivery_date: shipment.estimatedDelivery
          ? new Date(shipment.estimatedDelivery).toISOString().split("T")[0]
          : "",
        delivered_date: shipment.deliveredDate
          ? new Date(shipment.deliveredDate).toISOString().split("T")[0]
          : "",
        admin_notes: shipment.adminNotes || "",
      };
    }
  });

  async function handleSubmit() {
    if (!shipment || !canSubmit) return;

    isLoading = true;

    try {
      const updatePayload: Record<string, any> = {
        status: formData.status,
      };

      if (formData.carrier) {
        updatePayload.carrier = formData.carrier;
      }
      if (formData.tracking_number) {
        updatePayload.tracking_number = formData.tracking_number;
      }
      if (formData.estimated_delivery_date) {
        updatePayload.estimated_delivery_date = formData.estimated_delivery_date;
      }
      if (formData.delivered_date) {
        updatePayload.delivered_date = formData.delivered_date;
      }
      if (formData.admin_notes !== undefined) {
        updatePayload.admin_notes = formData.admin_notes;
      }

      const response = await fetch(`/api/admin/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update shipment");
      }

      toast.success("Shipment updated successfully");
      open = false;
      onUpdate();
    } catch (error) {
      console.error("Error updating shipment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update shipment"
      );
    } finally {
      isLoading = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title>Update Shipment Status</Dialog.Title>
      <Dialog.Description>
        Update the shipment status and tracking information for this order.
      </Dialog.Description>
    </Dialog.Header>

    {#if shipment}
      <div class="space-y-4 py-4">
        <!-- Shipment Info Summary -->
        <div class="p-4 border rounded-lg bg-muted/50">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Card:</span>
              <p class="font-medium">{shipment.cardName}</p>
            </div>
            <div>
              <span class="text-muted-foreground">User:</span>
              <p class="font-medium">{shipment.userEmail || shipment.userId}</p>
            </div>
            <div>
              <span class="text-muted-foreground">Value:</span>
              <p class="font-medium">{shipment.cardValue}</p>
            </div>
            <div>
              <span class="text-muted-foreground">Requested:</span>
              <p class="font-medium">{shipment.requestDate}</p>
            </div>
          </div>
        </div>

        <!-- Status Select -->
        <div class="space-y-2">
          <Label for="status">Status *</Label>
          <Select.Root
            type="single"
            value={formData.status}
            onSelectedChange={(selected) => {
              if (selected?.value) {
                formData.status = selected.value as ShipmentStatus;
                // Clear delivered_date if not delivered
                if (formData.status !== "delivered") {
                  formData.delivered_date = "";
                }
              }
            }}
          >
            <Select.Trigger id="status">
              {formData.status.charAt(0).toUpperCase() +
                formData.status.slice(1)}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="processing">Processing</Select.Item>
              <Select.Item value="shipped">Shipped</Select.Item>
              <Select.Item value="delivered">Delivered</Select.Item>
              <Select.Item value="cancelled">Cancelled</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <!-- Carrier and Tracking (required for shipped/delivered) -->
        {#if requiresTracking}
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="carrier">
                Carrier *
                {#if requiresTracking}
                  <span class="text-destructive">*</span>
                {/if}
              </Label>
              <Input
                id="carrier"
                bind:value={formData.carrier}
                placeholder="UPS, USPS, FedEx, etc."
                required={requiresTracking}
              />
            </div>
            <div class="space-y-2">
              <Label for="tracking_number">
                Tracking Number *
                {#if requiresTracking}
                  <span class="text-destructive">*</span>
                {/if}
              </Label>
              <Input
                id="tracking_number"
                bind:value={formData.tracking_number}
                placeholder="1Z999AA10123456784"
                required={requiresTracking}
              />
            </div>
          </div>
        {:else}
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="carrier">Carrier</Label>
              <Input
                id="carrier"
                bind:value={formData.carrier}
                placeholder="UPS, USPS, FedEx, etc."
              />
            </div>
            <div class="space-y-2">
              <Label for="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                bind:value={formData.tracking_number}
                placeholder="1Z999AA10123456784"
              />
            </div>
          </div>
        {/if}

        <!-- Delivery Dates -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="estimated_delivery_date">Estimated Delivery Date</Label>
            <Input
              id="estimated_delivery_date"
              type="date"
              bind:value={formData.estimated_delivery_date}
            />
          </div>
          {#if formData.status === "delivered"}
            <div class="space-y-2">
              <Label for="delivered_date">Delivered Date</Label>
              <Input
                id="delivered_date"
                type="date"
                bind:value={formData.delivered_date}
              />
            </div>
          {/if}
        </div>

        <!-- Admin Notes -->
        <div class="space-y-2">
          <Label for="admin_notes">Admin Notes</Label>
          <Textarea
            id="admin_notes"
            bind:value={formData.admin_notes}
            placeholder="Internal notes about this shipment..."
            rows={4}
          />
        </div>

        {#if requiresTracking && (!formData.carrier || !formData.tracking_number)}
          <div class="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p class="text-sm text-destructive">
              Carrier and tracking number are required for shipped/delivered
              status.
            </p>
          </div>
        {/if}
      </div>

      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (open = false)}>
          Cancel
        </Button>
        <Button type="button" onclick={handleSubmit} disabled={!canSubmit || isLoading}>
          {#if isLoading}
            <IconLoader2 size={16} class="mr-2 animate-spin" />
            Updating...
          {:else}
            Update Shipment
          {/if}
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
