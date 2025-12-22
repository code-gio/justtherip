<script lang="ts">
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";
  import {
    IconUser,
    IconMail,
    IconLoader2,
    IconDeviceFloppy,
    IconFileDescription,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import type { Profile } from "./types";

  interface Props {
    profile: Profile | null;
    email: string;
    form: { displayName?: string; username?: string; bio?: string; avatarUrl?: string } | null;
  }

  let { profile, email, form }: Props = $props();

  let loading = $state(false);
  let displayName = $state("");
  let username = $state("");
  let bio = $state("");

  $effect(() => {
    if (profile) {
      displayName = profile.display_name ?? "";
      username = profile.username ?? "";
      bio = profile.bio ?? "";
    }
  });

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
</script>

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
        <div class="space-y-2">
          <Label for="email" class="flex items-center gap-1.5">
            <IconMail size={14} />
            Email Address
          </Label>
          <div class="relative">
            <Input
              id="email"
              type="email"
              value={email}
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

        <div class="space-y-2">
          <Label for="displayName" class="flex items-center gap-1.5">
            <IconUser size={14} />
            Display Name
          </Label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            placeholder="Enter your display name"
            value={form?.displayName ?? displayName}
            class="max-w-md"
          />
          <p class="text-xs text-muted-foreground">
            This is your public display name.
          </p>
        </div>

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

        <div class="space-y-2">
          <Label for="bio" class="flex items-center gap-1.5">
            <IconFileDescription size={14} />
            Bio
          </Label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself..."
            class="flex min-h-[100px] w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            value={form?.bio ?? bio}
          ></textarea>
          <p class="text-xs text-muted-foreground">
            A short description about yourself (optional).
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

