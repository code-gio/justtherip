<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Label } from "$lib/components/ui/label";

  interface PackData {
    name: string;
    slug: string;
    description: string;
    image_url: string;
    game_code: string;
    rip_cost: number;
  }

  interface Props {
    packData: PackData;
    errors: Record<string, string>;
  }

  let { packData, errors }: Props = $props();
</script>

<div class="space-y-4">
  <div>
    <h2 class="text-xl font-semibold">General Information</h2>
    <p class="text-sm text-muted-foreground">Basic pack details</p>
  </div>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="name">Pack Name *</Label>
        <Input
          id="name"
          bind:value={packData.name}
          placeholder="e.g., Standard Pack"
          class={errors.name ? "border-destructive" : ""}
        />
        {#if errors.name}
          <p class="text-sm text-destructive">{errors.name}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="slug">Slug *</Label>
        <Input
          id="slug"
          bind:value={packData.slug}
          placeholder="e.g., standard-pack"
          class={errors.slug ? "border-destructive" : ""}
        />
        {#if errors.slug}
          <p class="text-sm text-destructive">{errors.slug}</p>
        {/if}
      </div>
    </div>

    <div class="space-y-2">
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        bind:value={packData.description}
        rows={3}
        placeholder="Describe what makes this pack special..."
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="image_url">Pack Image URL</Label>
        <Input
          id="image_url"
          bind:value={packData.image_url}
          type="url"
          placeholder="https://example.com/pack-image.jpg"
        />
      </div>

      <div class="space-y-2">
        <Label for="rip_cost">Rip Cost *</Label>
        <Input
          id="rip_cost"
          type="number"
          min="1"
          step="1"
          bind:value={packData.rip_cost}
          class={errors.rip_cost ? "border-destructive" : ""}
        />
        {#if errors.rip_cost}
          <p class="text-sm text-destructive">{errors.rip_cost}</p>
        {/if}
      </div>
    </div>
  </div>
</div>
