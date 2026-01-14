<script lang="ts">
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { PageData } from "./$types";
  import { IconSettings, IconCheck, IconX } from "@tabler/icons-svelte";

  let { data }: { data: PageData } = $props();

  let configs = $state(data.configs || []);
  let isLoading = $state(false);
  let editingKey = $state<string | null>(null);
  let editValues = $state<Record<string, string>>({});

  function startEdit(key: string, currentValue: any) {
    editingKey = key;
    // Convert value to string for editing
    if (typeof currentValue === "object") {
      editValues[key] = JSON.stringify(currentValue, null, 2);
    } else {
      editValues[key] = String(currentValue);
    }
  }

  function cancelEdit() {
    editingKey = null;
    editValues = {};
  }

  async function saveConfig(key: string) {
    try {
      isLoading = true;
      const valueStr = editValues[key];
      let parsedValue: any;

      // Try to parse as JSON, fallback to string
      try {
        parsedValue = JSON.parse(valueStr);
      } catch {
        // If not valid JSON, try to parse as number
        if (!isNaN(Number(valueStr)) && valueStr.trim() !== "") {
          parsedValue = Number(valueStr);
        } else if (valueStr.toLowerCase() === "true") {
          parsedValue = true;
        } else if (valueStr.toLowerCase() === "false") {
          parsedValue = false;
        } else {
          parsedValue = valueStr;
        }
      }

      const response = await fetch("/api/admin/system-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value: parsedValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update config");
      }

      // Update local state
      const config = configs.find((c) => c.key === key);
      if (config) {
        config.value = parsedValue;
      }

      editingKey = null;
      editValues = {};
      toast.success("Configuration updated successfully");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update configuration"
      );
    } finally {
      isLoading = false;
    }
  }

  function formatValue(value: any): string {
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  function getValueType(value: any): string {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "object") return "json";
    return "string";
  }
</script>

<div class="container mx-auto px-4 py-8 space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-4xl font-bold">System Configuration</h1>
    <p class="text-muted-foreground mt-2">
      Manage system-wide configuration settings including probability curves,
      sellback rates, and pack defaults.
    </p>
  </div>

  <!-- Config List -->
  {#if isLoading && configs.length === 0}
    <div class="space-y-4">
      {#each Array(5) as _}
        <Skeleton class="h-32 w-full" />
      {/each}
    </div>
  {:else if configs.length === 0}
    <Card.Root>
      <Card.Content class="p-12 text-center">
        <p class="text-muted-foreground">No configuration settings found.</p>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="space-y-4">
      {#each configs as config}
        <Card.Root>
          <Card.Content class="p-6">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-2">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-lg">{config.key}</h3>
                  <span
                    class="text-xs px-2 py-1 bg-muted rounded"
                  >{getValueType(config.value)}</span>
                </div>
                {#if config.description}
                  <p class="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                {/if}
                {#if editingKey === config.key}
                  <div class="space-y-2 mt-4">
                    {#if getValueType(config.value) === "json"}
                      <Label for="value-{config.key}">Value (JSON)</Label>
                      <Textarea
                        id="value-{config.key}"
                        bind:value={editValues[config.key]}
                        rows={6}
                        class="font-mono text-sm"
                      />
                    {:else}
                      <Label for="value-{config.key}">Value</Label>
                      <Input
                        id="value-{config.key}"
                        bind:value={editValues[config.key]}
                        type={getValueType(config.value) === "number" ? "number" : "text"}
                      />
                    {/if}
                    <div class="flex gap-2">
                      <Button
                        size="sm"
                        onclick={() => saveConfig(config.key)}
                        disabled={isLoading}
                      >
                        <IconCheck class="size-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onclick={cancelEdit}
                        disabled={isLoading}
                      >
                        <IconX class="size-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                {:else}
                  <div class="mt-4">
                    <div class="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                      {formatValue(config.value)}
                    </div>
                    <div class="mt-2 text-xs text-muted-foreground">
                      Updated: {new Date(config.updated_at).toLocaleString()}
                    </div>
                  </div>
                {/if}
              </div>
              {#if editingKey !== config.key}
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => startEdit(config.key, config.value)}
                >
                  Edit
                </Button>
              {/if}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
