<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { IconLoader2, IconTrophy, IconPackage, IconPlus, IconCheck } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";

  interface CardData {
    id: string;
    card_image_url: string | null;
    card_name: string | null;
    card_value_cents: number;
    created_at: string;
    is_sold?: boolean;
    is_shipped?: boolean;
    shipment_id?: string | null;
  }

  interface ShippingAddress {
    id: string;
    name: string;
    phone: string | null;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    label: string | null;
  }

  interface Props {
    open?: boolean;
    card: CardData | null;
    onShip: (cardId: string, shippingAddressId?: string) => Promise<void>;
    onClose: () => void;
  }

  let { open = $bindable(false), card, onShip, onClose }: Props = $props();

  let addresses = $state<ShippingAddress[]>([]);
  let loadingAddresses = $state(true);
  let selectedAddressId = $state<string | null>(null);
  let showAddForm = $state(false);
  let isShipping = $state(false);

  // Form state for new address
  let formData = $state({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    is_default: false,
    label: "",
  });

  const cardValue = $derived(card ? (card.card_value_cents / 100).toFixed(2) : "0.00");

  async function loadAddresses() {
    try {
      loadingAddresses = true;
      const response = await fetch("/api/shipping-addresses");

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const result = await response.json();
      addresses = result.addresses || [];
      
      // Select default address if available
      const defaultAddress = addresses.find((a) => a.is_default);
      if (defaultAddress) {
        selectedAddressId = defaultAddress.id;
      } else if (addresses.length > 0) {
        selectedAddressId = addresses[0].id;
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error("Failed to load shipping addresses");
    } finally {
      loadingAddresses = false;
    }
  }

  async function createAddress() {
    try {
      const response = await fetch("/api/shipping-addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create address");
      }

      const result = await response.json();
      toast.success("Shipping address added!");
      
      // Reload addresses
      await loadAddresses();
      
      // Select the new address
      selectedAddressId = result.address.id;
      showAddForm = false;
      
      // Reset form
      formData = {
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "US",
        is_default: false,
        label: "",
      };
    } catch (error) {
      console.error("Error creating address:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create address"
      );
    }
  }

  async function handleShip() {
    if (!card) return;

    // If no addresses and not showing form, show form
    if (addresses.length === 0 && !showAddForm) {
      showAddForm = true;
      return;
    }

    // If showing form, create address first
    if (showAddForm) {
      await createAddress();
      return;
    }

    // If no address selected, show form
    if (!selectedAddressId) {
      showAddForm = true;
      return;
    }

    // Ship the card
    try {
      isShipping = true;
      await onShip(card.id, selectedAddressId);
      onClose();
    } catch (error) {
      console.error("Error shipping card:", error);
    } finally {
      isShipping = false;
    }
  }

  $effect(() => {
    if (open && card) {
      loadAddresses();
    }
  });

  $effect(() => {
    if (!open) {
      // Reset state when dialog closes
      selectedAddressId = null;
      showAddForm = false;
      formData = {
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "US",
        is_default: false,
        label: "",
      };
    }
  });

  $effect(() => {
    if (open && addresses.length === 0 && !loadingAddresses) {
      showAddForm = true;
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title>Ship Card</Dialog.Title>
      <Dialog.Description>
        {#if showAddForm}
          Add a shipping address to ship this card
        {:else}
          Select a shipping address or add a new one
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if card}
      <div class="space-y-6 py-4">
        <!-- Card Preview -->
        <div class="flex gap-4 p-4 border rounded-lg bg-muted/50">
          <div class="shrink-0">
            {#if card.card_image_url}
              <img
                src={card.card_image_url}
                alt={card.card_name || "Card"}
                class="w-24 h-32 object-cover rounded-lg"
              />
            {:else}
              <div class="w-24 h-32 rounded-lg bg-muted flex items-center justify-center">
                <IconTrophy size={32} class="text-muted-foreground" />
              </div>
            {/if}
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <Badge variant="secondary" class="mb-2">
                </Badge>
                <h3 class="text-lg font-semibold">
                  {card.card_name || "Card"}
                </h3>
                <p class="text-sm text-muted-foreground mt-1">
                  Value: ${cardValue}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Address Selection or Form -->
        {#if showAddForm}
          <!-- Add Address Form -->
          <div class="space-y-4">
            <h4 class="font-medium">Add Shipping Address</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="name">Full Name *</Label>
                <Input
                  id="name"
                  bind:value={formData.name}
                  placeholder="John Doe"
                />
              </div>
              <div class="space-y-2">
                <Label for="phone">Phone</Label>
                <Input
                  id="phone"
                  bind:value={formData.phone}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div class="space-y-2 col-span-2">
                <Label for="address_line1">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  bind:value={formData.address_line1}
                  placeholder="123 Main St"
                />
              </div>
              <div class="space-y-2 col-span-2">
                <Label for="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  bind:value={formData.address_line2}
                  placeholder="Apt 4B"
                />
              </div>
              <div class="space-y-2">
                <Label for="city">City *</Label>
                <Input
                  id="city"
                  bind:value={formData.city}
                  placeholder="New York"
                />
              </div>
              <div class="space-y-2">
                <Label for="state">State *</Label>
                <Input
                  id="state"
                  bind:value={formData.state}
                  placeholder="NY"
                />
              </div>
              <div class="space-y-2">
                <Label for="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  bind:value={formData.postal_code}
                  placeholder="10001"
                />
              </div>
              <div class="space-y-2">
                <Label for="country">Country</Label>
                <Input
                  id="country"
                  bind:value={formData.country}
                  placeholder="US"
                />
              </div>
              <div class="space-y-2 col-span-2">
                <Label for="label">Label (optional)</Label>
                <Input
                  id="label"
                  bind:value={formData.label}
                  placeholder="Home, Work, etc."
                />
              </div>
              <div class="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  bind:checked={formData.is_default}
                  class="rounded"
                />
                <Label for="is_default" class="cursor-pointer">
                  Set as default address
                </Label>
              </div>
            </div>
          </div>
        {:else if loadingAddresses}
          <div class="text-center py-8">
            <IconLoader2 size={24} class="animate-spin mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">Loading addresses...</p>
          </div>
        {:else if addresses.length > 0}
          <!-- Address Selection -->
          <div class="space-y-4">
            <h4 class="font-medium">Select Shipping Address</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              {#each addresses as address (address.id)}
                <button
                  type="button"
                  onclick={() => {
                    selectedAddressId = address.id;
                  }}
                  class="w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors {
                    selectedAddressId === address.id
                      ? 'border-primary bg-primary/5'
                      : ''
                  }"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <p class="font-medium">{address.name}</p>
                        {#if address.is_default}
                          <Badge variant="secondary" class="text-xs">
                            Default
                          </Badge>
                        {/if}
                        {#if address.label}
                          <Badge variant="outline" class="text-xs">
                            {address.label}
                          </Badge>
                        {/if}
                      </div>
                      <p class="text-sm text-muted-foreground">
                        {address.address_line1}
                        {address.address_line2 ? `, ${address.address_line2}` : ""}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      {#if address.phone}
                        <p class="text-sm text-muted-foreground mt-1">
                          {address.phone}
                        </p>
                      {/if}
                    </div>
                    {#if selectedAddressId === address.id}
                      <IconCheck size={20} class="text-primary shrink-0" />
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
            <Button
              variant="outline"
              class="w-full"
              onclick={() => {
                showAddForm = true;
                selectedAddressId = null;
              }}
            >
              <IconPlus size={16} class="mr-2" />
              Add New Address
            </Button>
          </div>
        {:else}
          <!-- No addresses, show form -->
          <div class="text-center py-8">
            <p class="text-sm text-muted-foreground mb-4">
              No shipping addresses found. Add one to continue.
            </p>
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t">
          <Button variant="outline" class="flex-1" onclick={onClose} disabled={isShipping}>
            Cancel
          </Button>
          <Button
            class="flex-1 text-white"
            onclick={handleShip}
            disabled={isShipping || (showAddForm && (!formData.name || !formData.address_line1 || !formData.city || !formData.state || !formData.postal_code))}
          >
            {#if isShipping}
              <IconLoader2 class="mr-2 animate-spin" size={16} />
              Shipping...
            {:else if showAddForm}
              <IconPlus class="mr-2" size={16} />
              Add Address & Ship
            {:else}
              <IconPackage class="mr-2" size={16} />
              Ship Card
            {/if}
          </Button>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

