<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import DarkModeToggle from "$lib/components/shared/dark-mode-toggle.svelte";
  import { navMain, adminNav, navSecondary, userNav } from "$lib/config";
  import { IconCoin, IconPlus, IconHistory, IconWallet } from "@tabler/icons-svelte";

  let { ripBalance = 0 }: { ripBalance?: number } = $props();

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
  class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
  <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="mx-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-base font-medium">{currentTitle}</h1>
    <div class="ms-auto flex items-center gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline" size="sm" class="gap-2">
              <IconCoin size={16} class="text-amber-500" />
              <span class="font-semibold">{ripBalance.toFixed(2)}</span>
              <span class="text-muted-foreground text-xs">Rips</span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-48" align="end">
          <DropdownMenu.Label>Your Balance</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={() => goto("/store")}>
              <IconPlus size={16} />
              Get More Rips
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => goto("/wallet")}>
              <IconWallet size={16} />
              Wallet
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => goto("/wallet")}>
              <IconHistory size={16} />
              Transaction History
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DarkModeToggle />
    </div>
  </div>
</header>
