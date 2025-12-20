<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import Input from "../ui/input/input.svelte";
  import Label from "../ui/label/label.svelte";
  import { IconEye, IconEyeOff } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";

  let isRequestPassword = $state(false);
  let newpassword = $state("");
  let showPassword = $state(false);

  async function handleResetPassword() {
    try {
      isRequestPassword = true;

      const response = await fetch("/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newpassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      toast.success("Reset password successfully");
      goto("/dashboard");
    } catch (error) {
      console.error("Error reset paswword:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      isRequestPassword = false;
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<div class="flex flex-col gap-3">
  <Label>New password</Label>
  <div class="relative">
    <Input
      id="password"
      bind:value={newpassword}
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      autocomplete="current-password"
      required
    />
    <Button
      size="icon"
      class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
      variant="ghost"
      onclick={togglePasswordVisibility}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {#if showPassword}
        <IconEyeOff size={16} />
      {:else}
        <IconEye size={16} />
      {/if}
    </Button>
  </div>
  <Button
    variant="default"
    class="bg-blue-500 hover:bg-blue-700 text-white mt-2 block ml-auto"
    onclick={handleResetPassword}
    disabled={isRequestPassword}
  >
    Save
  </Button>
</div>
