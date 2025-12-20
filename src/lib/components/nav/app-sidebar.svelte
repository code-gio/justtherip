<script lang="ts">
  import NavDocuments from "$lib/components/nav/nav-admin.svelte";
  import NavMain from "$lib/components/nav/nav-main.svelte";
  import NavSecondary from "./nav-secondary.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import { IconCards } from "@tabler/icons-svelte";

  let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
          {#snippet child({ props })}
            <a href="##" {...props}>
              <IconCards class="!size-5" />
              <span class="text-base font-semibold">Just the Rip</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain />
    <NavDocuments />
    <NavSecondary class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
</Sidebar.Root>
