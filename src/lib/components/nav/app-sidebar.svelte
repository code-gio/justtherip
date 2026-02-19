<script lang="ts">
  import NavAdmin from "$lib/components/nav/nav-admin.svelte";
  import NavMain from "$lib/components/nav/nav-main.svelte";
  import NavSecondary from "./nav-secondary.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import { IconCards } from "@tabler/icons-svelte";
  import { page } from "$app/state";

  let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

  const isAdmin = $derived(page.data.profile?.is_admin ?? false);
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
          {#snippet child({ props })}
            <a href="/" {...props}>
            <img src="/logo.svg" alt="Just The Rip" class="h-12 w-auto" />
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain />
    {#if isAdmin}
      <NavAdmin />
    {/if}
    <NavSecondary class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
</Sidebar.Root>
