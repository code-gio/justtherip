<script lang="ts">
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Label } from "$lib/components/ui/label";
  import { IconEye, IconEyeOff, IconWorld, IconLoader2, IconDeviceFloppy } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import type { Profile } from "./types";

  interface Props {
    profile: Profile | null;
  }

  let { profile }: Props = $props();

  let loading = $state(false);
  let visibility = $state<"public" | "private">("public");

  $effect(() => {
    if (profile?.profile_visibility) {
      visibility = profile.profile_visibility;
    }
  });

  const handleSubmit: SubmitFunction = () => {
    loading = true;
    return async ({ result }) => {
      loading = false;
      if (result.type === "success") {
        toast.success("Visibility updated successfully!");
      } else {
        toast.error("Failed to update visibility. Please try again.");
      }
    };
  };
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      <IconWorld size={20} />
      Profile Visibility
    </Card.Title>
    <Card.Description>
      Control who can see your profile and activity.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="post" action="?/updateVisibility" use:enhance={handleSubmit}>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="visibility" class="flex items-center gap-1.5">
            {#if visibility === "public"}
              <IconEye size={14} />
            {:else}
              <IconEyeOff size={14} />
            {/if}
            Visibility Setting
          </Label>
          <Select.Root type="single" name="profileVisibility" bind:value={visibility}>
            <Select.Trigger class="w-full max-w-md">
              {#if visibility === "public"}
                <div class="flex items-center gap-2">
                  <IconEye size={16} />
                  Public
                </div>
              {:else}
                <div class="flex items-center gap-2">
                  <IconEyeOff size={16} />
                  Private
                </div>
              {/if}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="public">
                <div class="flex items-center gap-2">
                  <IconEye size={16} />
                  Public - Anyone can view your profile
                </div>
              </Select.Item>
              <Select.Item value="private">
                <div class="flex items-center gap-2">
                  <IconEyeOff size={16} />
                  Private - Only you can view your profile
                </div>
              </Select.Item>
            </Select.Content>
          </Select.Root>
          <p class="text-xs text-muted-foreground">
            {#if visibility === "public"}
              Your profile, stats, and activity are visible to everyone.
            {:else}
              Your profile is hidden from other users.
            {/if}
          </p>
        </div>

        <Button type="submit" disabled={loading} class="gap-2">
          {#if loading}
            <IconLoader2 size={16} class="animate-spin" />
            Saving...
          {:else}
            <IconDeviceFloppy size={16} />
            Save Visibility
          {/if}
        </Button>
      </div>
    </form>
  </Card.Content>
</Card.Root>

