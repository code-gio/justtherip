<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { adminNav } from "$lib/config.js";

  const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each adminNav as item (item.title)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton tooltipContent={item.title}>
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              {#if item.icon}
                <item.icon />
              {/if}
              <span>{item.title}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
