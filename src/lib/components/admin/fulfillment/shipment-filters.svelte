<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button";
  import { IconSearch, IconX } from "@tabler/icons-svelte";
  import type { ShipmentStatus } from "$lib/components/shipments/types";

  interface Props {
    statusFilter: ShipmentStatus | "all";
    searchQuery: string;
    onStatusChange: (status: ShipmentStatus | "all") => void;
    onSearchChange: (query: string) => void;
    onClear: () => void;
  }

  let {
    statusFilter,
    searchQuery,
    onStatusChange,
    onSearchChange,
    onClear,
  }: Props = $props();

  const hasFilters = $derived(
    statusFilter !== "all" || searchQuery.trim() !== ""
  );
</script>

<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
  <!-- Status Filter -->
  <div class="space-y-2 min-w-[180px]">
    <Label for="status-filter">Status</Label>
    <Select.Root
      type="single"
      value={statusFilter}
      onSelectedChange={(selected) => {
        if (selected?.value) {
          onStatusChange(selected.value as ShipmentStatus | "all");
        }
      }}
    >
      <Select.Trigger id="status-filter">
        {statusFilter === "all"
          ? "All Statuses"
          : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">All Statuses</Select.Item>
        <Select.Item value="pending">Pending</Select.Item>
        <Select.Item value="processing">Processing</Select.Item>
        <Select.Item value="shipped">Shipped</Select.Item>
        <Select.Item value="delivered">Delivered</Select.Item>
        <Select.Item value="cancelled">Cancelled</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <!-- Search Input -->
  <div class="flex-1 space-y-2">
    <Label for="search">Search</Label>
    <div class="relative">
      <IconSearch
        size={18}
        class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="search"
        type="text"
        placeholder="Search by card name, tracking number, or user email..."
        value={searchQuery}
        oninput={(e) => onSearchChange(e.currentTarget.value)}
        class="pl-9"
      />
    </div>
  </div>

  <!-- Clear Filters Button -->
  {#if hasFilters}
    <Button variant="outline" onclick={onClear} class="shrink-0">
      <IconX size={16} class="mr-2" />
      Clear
    </Button>
  {/if}
</div>
