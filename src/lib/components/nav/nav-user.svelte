<script lang="ts">
  import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
  import LogoutIcon from "@tabler/icons-svelte/icons/logout";

  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { userNav } from "$lib/config";
  import { page } from "$app/state";
  import { goto, invalidate } from "$app/navigation";
  import { getInitials } from "$lib/utils";

  const user = $derived({
    name: page.data.profile?.full_name ?? page.data.profile?.username ?? "User",
    email: page.data.profile?.email ?? page.data.user?.email ?? "",
    avatar: page.data.profile?.avatar_url ?? "",
  });

  const sidebar = Sidebar.useSidebar();

  async function logout() {
    const { error } = await page.data.supabase.auth.signOut();
    if (!error) {
      await invalidate("supabase:auth");
      goto("/sign-in");
    }
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar.Root class="size-8 rounded-lg grayscale">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-lg">
                {getInitials(user.name)}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
            <DotsVerticalIcon class="ms-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-lg">
                {getInitials(user.name)}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          {#each userNav as item}
            <DropdownMenu.Item>
              {#snippet child({ props })}
                <a href={item.url} {...props}>
                  <item.icon />
                  {item.title}
                </a>
              {/snippet}
              {item.title}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={logout}>
          <LogoutIcon />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
