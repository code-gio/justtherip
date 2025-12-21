<script lang="ts">
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import {
    IconUser,
    IconMail,
    IconWorld,
    IconShield,
    IconLogout,
    IconCheck,
    IconLoader2,
    IconCamera,
    IconAlertTriangle,
    IconKey,
    IconDeviceFloppy,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  let { data, form } = $props();
  let { session, profile } = $derived(data);

  let loading = $state(false);
  let fullName = $state("");
  let username = $state("");
  let website = $state("");

  $effect(() => {
    if (profile) {
      fullName = profile.full_name ?? "";
      username = profile.username ?? "";
      website = profile.website ?? "";
    }
  });

  const getInitials = (name: string, email: string): string => {
    if (name && name.trim()) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() ?? "??";
  };

  const handleSubmit: SubmitFunction = () => {
    loading = true;
    return async ({ result }) => {
      loading = false;
      if (result.type === "success") {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    };
  };

  const handleSignOut: SubmitFunction = () => {
    loading = true;
    return async ({ update }) => {
      loading = false;
      update();
    };
  };
</script>

<svelte:head>
  <title>Account Settings | Just the Rip</title>
</svelte:head>

<div class="space-y-6 max-w-4xl">
  <!-- Page Header -->
  <div class="space-y-1">
    <h1 class="text-2xl font-bold tracking-tight">Account Settings</h1>
    <p class="text-muted-foreground">
      Manage your account settings and preferences.
    </p>
  </div>

  <!-- Profile Overview Card -->
  <Card.Root class="overflow-hidden">
    <div
      class="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
    ></div>
    <Card.Content class="relative pt-0 pb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <!-- Avatar -->
        <div class="-mt-12 relative">
          <Avatar.Root
            class="h-24 w-24 border-4 border-background shadow-lg text-2xl"
          >
            {#if profile?.avatar_url}
              <Avatar.Image src={profile.avatar_url} alt={fullName || "User"} />
            {/if}
            <Avatar.Fallback class="bg-primary text-primary-foreground">
              {getInitials(fullName, session?.user?.email ?? "")}
            </Avatar.Fallback>
          </Avatar.Root>
          <button
            class="absolute bottom-0 right-0 p-1.5 rounded-full bg-muted border border-border hover:bg-accent transition-colors"
            aria-label="Change avatar"
          >
            <IconCamera size={14} />
          </button>
        </div>

        <!-- User Info -->
        <div class="flex-1 space-y-1">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-semibold">
              {fullName || username || "Welcome!"}
            </h2>
            <Badge variant="secondary" class="text-xs">
              <IconCheck size={12} class="mr-1" />
              Verified
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground flex items-center gap-1.5">
            <IconMail size={14} />
            {session?.user?.email}
          </p>
          {#if username}
            <p class="text-sm text-muted-foreground flex items-center gap-1.5">
              <IconUser size={14} />
              @{username}
            </p>
          {/if}
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Settings Tabs -->
  <Tabs.Root value="profile" class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-2 lg:w-[400px]">
      <Tabs.Trigger value="profile" class="gap-2">
        <IconUser size={16} />
        Profile
      </Tabs.Trigger>
      <Tabs.Trigger value="security" class="gap-2">
        <IconShield size={16} />
        Security
      </Tabs.Trigger>
    </Tabs.List>

    <!-- Profile Tab -->
    <Tabs.Content value="profile" class="space-y-6">
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <IconUser size={20} />
            Profile Information
          </Card.Title>
          <Card.Description>
            Update your personal information and public profile.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="post" action="?/update" use:enhance={handleSubmit}>
            <div class="grid gap-6">
              <!-- Email (Read-only) -->
              <div class="space-y-2">
                <Label for="email" class="flex items-center gap-1.5">
                  <IconMail size={14} />
                  Email Address
                </Label>
                <div class="relative">
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email}
                    disabled
                    class="bg-muted/50 pr-20"
                  />
                  <Badge
                    variant="outline"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                  >
                    Verified
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground">
                  Your email is managed through your authentication provider.
                </p>
              </div>

              <Separator />

              <!-- Full Name -->
              <div class="space-y-2">
                <Label for="fullName" class="flex items-center gap-1.5">
                  <IconUser size={14} />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form?.fullName ?? fullName}
                  class="max-w-md"
                />
                <p class="text-xs text-muted-foreground">
                  This is your public display name.
                </p>
              </div>

              <!-- Username -->
              <div class="space-y-2">
                <Label for="username" class="flex items-center gap-1.5">
                  <span class="text-muted-foreground">@</span>
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={form?.username ?? username}
                  class="max-w-md"
                />
                <p class="text-xs text-muted-foreground">
                  Your unique identifier on the platform.
                </p>
              </div>

              <!-- Website -->
              <div class="space-y-2">
                <Label for="website" class="flex items-center gap-1.5">
                  <IconWorld size={14} />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://your-website.com"
                  value={form?.website ?? website}
                  class="max-w-md"
                />
                <p class="text-xs text-muted-foreground">
                  Your personal or business website (optional).
                </p>
              </div>
            </div>

            <div class="mt-6 flex items-center gap-3">
              <Button type="submit" disabled={loading} class="gap-2">
                {#if loading}
                  <IconLoader2 size={16} class="animate-spin" />
                  Saving...
                {:else}
                  <IconDeviceFloppy size={16} />
                  Save Changes
                {/if}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Security Tab -->
    <Tabs.Content value="security" class="space-y-6">
      <!-- Password Section -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <IconKey size={20} />
            Password
          </Card.Title>
          <Card.Description>
            Change your password to keep your account secure.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium">Password</p>
              <p class="text-xs text-muted-foreground">
                Last changed: Never
              </p>
            </div>
            <Button variant="outline" href="/reset-password/confirm" class="gap-2">
              <IconKey size={16} />
              Change Password
            </Button>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Active Sessions -->
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <IconShield size={20} />
            Active Sessions
          </Card.Title>
          <Card.Description>
            Manage your active sessions across devices.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-full bg-primary/10">
                <IconShield size={20} class="text-primary" />
              </div>
              <div class="space-y-0.5">
                <p class="text-sm font-medium">Current Session</p>
                <p class="text-xs text-muted-foreground">
                  This device · Active now
                </p>
              </div>
            </div>
            <Badge variant="secondary" class="gap-1">
              <span class="h-2 w-2 rounded-full bg-green-500"></span>
              Active
            </Badge>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Danger Zone -->
      <Card.Root class="border-destructive/50">
        <Card.Header>
          <Card.Title class="flex items-center gap-2 text-destructive">
            <IconAlertTriangle size={20} />
            Danger Zone
          </Card.Title>
          <Card.Description>
            Irreversible and destructive actions.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="post" action="?/signout" use:enhance={handleSignOut}>
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <p class="text-sm font-medium">Sign Out</p>
                <p class="text-xs text-muted-foreground">
                  Sign out of your account on this device.
                </p>
              </div>
              <Button variant="destructive" type="submit" disabled={loading} class="gap-2">
                {#if loading}
                  <IconLoader2 size={16} class="animate-spin" />
                {:else}
                  <IconLogout size={16} />
                {/if}
                Sign Out
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>
