<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { z } from "zod";
  import { toast } from "svelte-sonner";

  interface Game {
    id: string;
    name: string;
    code: string;
  }

  let {
    open = $bindable(false),
    games = [],
    onComplete,
  } = $props<{
    open?: boolean;
    games?: Game[];
    onComplete?: (packId: string) => void;
  }>();

  let isLoading = $state(false);
  let serverError = $state<string | null>(null);

  const packSchema = z.object({
    name: z.string().min(3, "Pack name must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    game_code: z.string().min(1, "Game is required"),
  });

  // Use superForm only for validation, not for submission
  const form = superForm(
    {
      name: "",
      slug: "",
      game_code: "",
    },
    {
      SPA: true,
      validators: zodClient(packSchema as any),
      resetForm: false,
    }
  );

  const { form: formData, errors } = form;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    // Validate client-side using superForm's validator
    const validation = packSchema.safeParse({
      name: $formData.name,
      slug: $formData.slug,
      game_code: $formData.game_code,
    });

    if (!validation.success) {
      // Set errors manually - convert zod errors to superForm format
      const fieldErrors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (path) {
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        }
      });
      // Set first error message for each field
      Object.keys(fieldErrors).forEach((key) => {
        $errors[key] = fieldErrors[key][0];
      });
      return;
    }

    isLoading = true;
    serverError = null;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", $formData.name);
      formDataToSend.append("slug", $formData.slug);
      formDataToSend.append("game_code", $formData.game_code);

      const response = await fetch("?/create", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      // Handle both success and failure cases
      if (result.type === "success") {
        // Parse data if it's a string
        let data: any = result.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error("Failed to parse data string:", e);
          }
        }
        
        // Handle array response format: [object, boolean, packId]
        if (Array.isArray(data) && data.length >= 3) {
          const packId = data[2];
          if (packId && typeof packId === "string") {
            toast.success("Pack created successfully", {
              description: "Redirecting to pack editor...",
            });
            
            // Close modal first
            open = false;

            // Then navigate
            if (onComplete) {
              onComplete(packId);
            }
            return;
          }
        }
        
        // Handle object response format: { success: true, packId: "..." }
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (data.success === true && data.packId) {
            toast.success("Pack created successfully", {
              description: "Redirecting to pack editor...",
            });
            
            // Close modal first
            open = false;

            // Then navigate
            if (onComplete) {
              onComplete(data.packId);
            }
            return;
          }
          
          // Check if error is present
          if (data.error) {
            serverError = data.error;
            toast.error("Failed to create pack", {
              description: data.error,
            });
            return;
          }
        }
        
        // If we get here, the data format is unexpected
        serverError = "Unknown error occurred";
        toast.error("Failed to create pack", {
          description: "An unexpected error occurred. Please try again.",
        });
      } else if (result.type === "failure") {
        // Handle failure response
        let data: any = result.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Ignore parse errors
          }
        }
        const errorMessage = data?.error || data?.message || "Failed to create pack. Please try again.";
        serverError = errorMessage;
        toast.error("Failed to create pack", {
          description: errorMessage,
        });
      } else {
        serverError = "Unexpected response from server";
        toast.error("Failed to create pack", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating pack:", error);
      serverError = "Network error. Please try again.";
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      isLoading = false;
    }
  }

  let slugManuallyEdited = $state(false);
  let lastAutoGeneratedSlug = $state("");

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameBlur() {
    if (!slugManuallyEdited) {
      const autoGeneratedSlug = generateSlug($formData.name);
      if (autoGeneratedSlug) {
        $formData.slug = autoGeneratedSlug;
        lastAutoGeneratedSlug = autoGeneratedSlug;
      }
    }
  }

  function handleSlugChange() {
    if ($formData.slug !== lastAutoGeneratedSlug) {
      slugManuallyEdited = true;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Create New Pack</Dialog.Title>
      <Dialog.Description>
        Start by defining the basic fields. You'll configure tiers, cards, and pricing in the editor.
      </Dialog.Description>
    </Dialog.Header>

    <form method="POST" action="?/create" onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Pack Name *</Label>
        <Input
          id="name"
          name="name"
          bind:value={$formData.name}
          onblur={handleNameBlur}
          placeholder="e.g., Standard Pack"
          class={$errors.name ? "border-destructive" : ""}
        />
        {#if $errors.name}
          <p class="text-sm text-destructive">{$errors.name}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="slug">Slug *</Label>
        <Input
          id="slug"
          name="slug"
          bind:value={$formData.slug}
          oninput={handleSlugChange}
          placeholder="e.g., standard-pack"
          class={$errors.slug ? "border-destructive" : ""}
        />
        <p class="text-xs text-muted-foreground">
          URL-friendly identifier (auto-generated from name, editable)
        </p>
        {#if $errors.slug}
          <p class="text-sm text-destructive">{$errors.slug}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="game_code">Game *</Label>
        {#if games.length > 0}
          <Select.Root type="single" bind:value={$formData.game_code}>
            <Select.Trigger id="game_code" class={$errors.game_code ? "border-destructive" : ""}>
              {#if $formData.game_code}
                {games.find((g: Game) => g.code === $formData.game_code)?.name || "Select game"}
              {:else}
                Select game
              {/if}
            </Select.Trigger>
            <Select.Content>
              {#each games as game (game.id)}
                <Select.Item value={game.code}>{game.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          <input type="hidden" name="game_code" value={$formData.game_code || ""} />
        {:else}
          <div class="border rounded-md px-3 py-2 text-sm text-muted-foreground">
            Loading games...
          </div>
        {/if}
        {#if $errors.game_code}
          <p class="text-sm text-destructive">{$errors.game_code}</p>
        {/if}
      </div>

      {#if serverError}
        <div class="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p class="text-sm text-destructive">{serverError}</p>
        </div>
      {/if}

      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (open = false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Pack"}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
