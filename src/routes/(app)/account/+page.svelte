<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { IconUser, IconShield, IconChartBar } from "@tabler/icons-svelte";
  import {
    ProfileHeader,
    ProfileForm,
    ProfileStats,
    ProfileVisibility,
    SecuritySettings,
    DangerZone,
  } from "$lib/components/profile";

  let { data, form } = $props();
  let { session, profile } = $derived(data);
</script>

<svelte:head>
  <title>Account Settings | Just the Rip</title>
</svelte:head>

<div class="space-y-6 max-w-4xl">
  <div class="space-y-1">
    <h1 class="text-2xl font-bold tracking-tight">Account Settings</h1>
    <p class="text-muted-foreground">
      Manage your account settings and preferences.
    </p>
  </div>

  <ProfileHeader {profile} email={session?.user?.email ?? ""} />

  <Tabs.Root value="profile" class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-3 lg:w-[500px]">
      <Tabs.Trigger value="profile" class="gap-2">
        <IconUser size={16} />
        Profile
      </Tabs.Trigger>
      <Tabs.Trigger value="stats" class="gap-2">
        <IconChartBar size={16} />
        Stats
      </Tabs.Trigger>
      <Tabs.Trigger value="security" class="gap-2">
        <IconShield size={16} />
        Security
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="profile" class="space-y-6">
      <ProfileForm {profile} email={session?.user?.email ?? ""} {form} />
      <ProfileVisibility {profile} />
    </Tabs.Content>

    <Tabs.Content value="stats" class="space-y-6">
      <ProfileStats {profile} />
    </Tabs.Content>

    <Tabs.Content value="security" class="space-y-6">
      <SecuritySettings />
      <DangerZone />
    </Tabs.Content>
  </Tabs.Root>
</div>
