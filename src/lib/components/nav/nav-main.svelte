<script lang="ts">
  import IconCoin from "@tabler/icons-svelte/icons/coin";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { navMain } from "$lib/config.js";
  import { page } from "$app/state";

  function isActive(itemUrl: string): boolean {
    const pathname = page.url.pathname;
    if (itemUrl === "/") return pathname === "/";
    return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
  }
</script>

<Sidebar.Group>
  <Sidebar.GroupContent class="flex flex-col gap-2">
    <Sidebar.Menu>
      <Sidebar.MenuItem class="flex items-center gap-2">
        <Sidebar.MenuButton
          class="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          tooltipContent="Buy Rips"
        >
          {#snippet child({ props })}
            <a href="/buy" {...props}>
              <IconCoin />
              <span>Buy Rips</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
    <Sidebar.Menu>
      {#each navMain as item (item.title)}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton
            tooltipContent={item.title}
            isActive={isActive(item.url)}
          >
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
  </Sidebar.GroupContent>
</Sidebar.Group>
