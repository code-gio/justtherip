<script lang="ts">
  import { page } from "$app/state";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import DarkModeToggle from "$lib/components/shared/dark-mode-toggle.svelte";
  import HeaderRips from "./header-rips.svelte";
  import HeaderInfo from "./header-info.svelte";
  import { navMain, adminNav, navSecondary, userNav } from "$lib/config";

  let {
    ripBalance = 0,
  }: { ripBalance?: number } = $props();

  const allNavItems = [...navMain, ...adminNav, ...navSecondary, ...userNav];

  const currentTitle = $derived.by(() => {
    const path = page.url.pathname;
    const exactMatch = allNavItems.find((item) => item.url === path);
    if (exactMatch) return exactMatch.title;

    const prefixMatch = allNavItems
      .filter(
        (item) => item.url && path.startsWith(item.url) && item.url !== "/"
      )
      .sort((a, b) => (b.url?.length ?? 0) - (a.url?.length ?? 0))[0];

    return prefixMatch?.title ?? "Dashboard";
  });
</script>

<header
  class="rounded-t-lg sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
  <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="mx-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-base font-medium">{currentTitle}</h1>
    <div class="ms-auto flex items-center gap-2">
      <HeaderInfo />
      <HeaderRips balance={ripBalance} />
      <DarkModeToggle />
    </div>
  </div>
</header>
