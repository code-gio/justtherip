<script lang="ts">
  import DataTable from "./data-table.svelte";
  import { renderComponent } from "$lib/components/ui/data-table/index.js";
  import DataTableActions from "./data-table-actions.svelte";
  import { columns as baseColumns } from "./columns.js";
  import type { ColumnDef } from "@tanstack/table-core";
  import UserDetailModal from "$lib/components/admin/users/user-detail-modal.svelte";
  import type { PageData } from "./$types";
  import type { UserWithStats } from "$lib/components/admin/users/types";

  let { data }: { data: PageData } = $props();

  let selectedUser = $state<UserWithStats | null>(null);
  let showUserModal = $state(false);

  function handleViewDetails(user: UserWithStats) {
    selectedUser = user;
    showUserModal = true;
  }

  function handleCloseModal() {
    showUserModal = false;
    selectedUser = null;
  }

  // Create columns with the handler injected
  const columns: ColumnDef<UserWithStats>[] = baseColumns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => {
          return renderComponent(DataTableActions, {
            userId: row.original.id,
            user: row.original,
            onViewDetails: handleViewDetails
          });
        }
      };
    }
    return col;
  });
</script>

<div class="container mx-auto px-4 py-8 space-y-6">
  <div>
    <h1 class="text-4xl font-bold">Users</h1>
    <p class="text-muted-foreground mt-2">
      Manage and view all users with their statistics and activity.
    </p>
  </div>

  <DataTable data={data.users} {columns} />
</div>

<UserDetailModal
  bind:open={showUserModal}
  user={selectedUser}
  onClose={handleCloseModal}
/>
