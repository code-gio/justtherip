<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/nav/app-sidebar.svelte";
  import AppHeader from "$lib/components/nav/app-header.svelte";

  let { children } = $props();
</script>

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
  <AppSidebar variant="inset" />
  <Sidebar.Inset>
    <AppHeader />
    <div class="flex flex-1 flex-col">
      <div class="@container/main flex flex-1 flex-col gap-2">
        <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          {@render children()}
        </div>
      </div>
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
