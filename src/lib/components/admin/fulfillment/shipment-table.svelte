<script lang="ts">
  import { createSvelteTable, FlexRender, renderSnippet, renderComponent } from "$lib/components/ui/data-table/index.js";
  import { createColumnHelper, getCoreRowModel, type ColumnDef } from "@tanstack/table-core";
  import { createRawSnippet } from "svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import type { AdminShipment } from "$lib/components/shipments/types";
  import { getTrackingUrl } from "$lib/components/shipments/types";
  import ShipmentActionsCell from "./shipment-actions-cell.svelte";

  interface Props {
    shipments: AdminShipment[];
    onUpdate: (shipment: AdminShipment) => void;
    onViewPurchaseOptions: (shipment: AdminShipment) => void;
  }

  let { shipments, onUpdate, onViewPurchaseOptions }: Props = $props();

  const columnHelper = createColumnHelper<AdminShipment>();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };

  const columns = [
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const statusSnippet = createRawSnippet<[{ status: string }]>(
          (getStatus) => {
            const { status } = getStatus();
            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
            const colorClass = statusColors[status] || "";
            return {
              render: () => `<span class="inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${colorClass}">${statusLabel}</span>`
            };
          }
        );
        return renderSnippet(statusSnippet, { status });
      },
    }),
    columnHelper.accessor("cardName", {
      header: "Card",
      cell: (info) => {
        const shipment = info.row.original;
        const cardSnippet = createRawSnippet<[{ shipment: AdminShipment }]>(
          (getShipment) => {
            const { shipment } = getShipment();
            const imageHtml = shipment.cardImage
              ? `<img src="${shipment.cardImage}" alt="${shipment.cardName}" class="w-12 h-16 object-cover rounded-md" />`
              : `<div class="w-12 h-16 rounded-md bg-muted flex items-center justify-center"><svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg></div>`;
            return {
              render: () => `
                <div class="flex items-center gap-3">
                  ${imageHtml}
                  <div class="min-w-0">
                    <p class="font-medium truncate">${shipment.cardName}</p>
                    <p class="text-sm text-muted-foreground">${shipment.cardTierName}</p>
                  </div>
                </div>
              `
            };
          }
        );
        return renderSnippet(cardSnippet, { shipment });
      },
    }),
    columnHelper.accessor("userEmail", {
      header: "User",
      cell: (info) => {
        const shipment = info.row.original;
        const userSnippet = createRawSnippet<[{ shipment: AdminShipment }]>(
          (getShipment) => {
            const { shipment } = getShipment();
            const userDisplay = shipment.userEmail || shipment.userName || shipment.userId.slice(0, 8);
            const shippingNameHtml = shipment.shippingName
              ? `<p class="text-sm text-muted-foreground truncate">${shipment.shippingName}</p>`
              : "";
            return {
              render: () => `
                <div class="min-w-0">
                  <p class="font-medium truncate">${userDisplay}</p>
                  ${shippingNameHtml}
                </div>
              `
            };
          }
        );
        return renderSnippet(userSnippet, { shipment });
      },
    }),
    columnHelper.accessor("shippingAddress", {
      header: "Shipping Address",
      cell: (info) => {
        const address = info.getValue();
        const addressSnippet = createRawSnippet<[{ address: string | undefined }]>(
          (getAddress) => {
            const { address } = getAddress();
            if (!address) {
              return { render: () => `<span class="text-muted-foreground">—</span>` };
            }
            return {
              render: () => `<p class="max-w-[200px] truncate text-sm" title="${address.replace(/"/g, '&quot;')}">${address}</p>`
            };
          }
        );
        return renderSnippet(addressSnippet, { address });
      },
    }),
    columnHelper.accessor("trackingNumber", {
      header: "Tracking",
      cell: (info) => {
        const shipment = info.row.original;
        const trackingSnippet = createRawSnippet<[{ shipment: AdminShipment }]>(
          (getShipment) => {
            const { shipment } = getShipment();
            if (!shipment.trackingNumber) {
              return { render: () => `<span class="text-muted-foreground">—</span>` };
            }
            const trackingUrl = getTrackingUrl(shipment.carrier, shipment.trackingNumber);
            const carrierHtml = shipment.carrier ? `<p class="text-sm font-medium">${shipment.carrier}</p>` : "";
            const trackingHtml = trackingUrl
              ? `<a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline flex items-center gap-1">${shipment.trackingNumber} <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`
              : `<p class="text-sm font-mono">${shipment.trackingNumber}</p>`;
            return {
              render: () => `
                <div class="space-y-1">
                  ${carrierHtml}
                  ${trackingHtml}
                </div>
              `
            };
          }
        );
        return renderSnippet(trackingSnippet, { shipment });
      },
    }),
    columnHelper.accessor("cardValue", {
      header: "Value",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("requestDate", {
      header: "Requested",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => renderComponent(ShipmentActionsCell, {
        shipment: info.row.original,
        onUpdate,
        onViewPurchaseOptions,
      }),
    }),
  ];

  const table = $derived(
    createSvelteTable({
      data: shipments,
      columns: columns as any,
      getCoreRowModel: getCoreRowModel(),
    })
  );
</script>

<div class="rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head>
              {#if !header.isPlaceholder}
                <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24 text-center">
            <p class="text-muted-foreground">No shipments found.</p>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
