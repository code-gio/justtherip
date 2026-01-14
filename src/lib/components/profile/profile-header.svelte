<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { IconCheck, IconMail, IconUser, IconCamera, IconLoader2 } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import type { Profile } from "./types";

  interface Props {
    profile: Profile | null;
    email: string;
    onAvatarUpload?: (url: string) => void;
  }

  let { profile, email, onAvatarUpload }: Props = $props();

  const getInitials = (name: string | null, email: string): string => {
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

  let displayName = $derived(profile?.display_name ?? "");
  let username = $derived(profile?.username ?? "");
  let uploading = $state(false);
  let fileInput: HTMLInputElement;

  const handleAvatarClick = () => {
    fileInput?.click();
  };

  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    uploading = true;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("?/uploadAvatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.type === "success") {
        toast.success("Avatar updated successfully!");
        if (onAvatarUpload && result.data?.avatarUrl) {
          onAvatarUpload(result.data.avatarUrl);
        }
        window.location.reload();
      } else {
        toast.error("Failed to upload avatar. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while uploading.");
      console.error("Upload error:", error);
    } finally {
      uploading = false;
      if (input) input.value = "";
    }
  };
</script>

<Card.Root class="overflow-hidden">
  <div
    class="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
  ></div>
  <Card.Content class="relative pt-0 pb-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div class="-mt-12 relative">
        <Avatar.Root
          class="h-24 w-24 border-4 border-background shadow-lg text-2xl"
        >
          {#if profile?.avatar_url}
            <Avatar.Image src={profile.avatar_url} alt={displayName || "User"} />
          {/if}
          <Avatar.Fallback class="bg-primary text-primary-foreground">
            {getInitials(displayName, email)}
          </Avatar.Fallback>
        </Avatar.Root>
        <button
          onclick={handleAvatarClick}
          disabled={uploading}
          class="absolute bottom-0 right-0 p-1.5 rounded-full bg-muted border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Change avatar"
        >
          {#if uploading}
            <IconLoader2 size={14} class="animate-spin" />
          {:else}
            <IconCamera size={14} />
          {/if}
        </button>
        <input
          bind:this={fileInput}
          type="file"
          accept="image/*"
          onchange={handleFileChange}
          class="hidden"
          aria-label="Upload avatar"
        />
      </div>

      <div class="flex-1 space-y-1">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-semibold">
            {displayName || username || "Welcome!"}
          </h2>
          <Badge variant="secondary" class="text-xs">
            <IconCheck size={12} class="mr-1" />
            Verified
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground flex items-center gap-1.5">
          <IconMail size={14} />
          {email}
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

