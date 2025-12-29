<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import { Button } from "$lib/components/ui/button";
  import { IconCheck, IconAlertCircle, IconX, IconDeviceFloppy, IconRocket, IconBan } from "@tabler/icons-svelte";

  interface ValidationState {
    generalInfoComplete: boolean;
    ripCostValid: boolean;
    tiersSelected: boolean;
    tierProbabilitiesValid: boolean;
    cardsAssigned: boolean;
  }

  let {
    packName,
    isDraft,
    validation,
    canPublish,
    isLoading,
    onSave,
    onPublish,
    onUnpublish,
  }: {
    packName: string;
    isDraft: boolean;
    validation: ValidationState;
    canPublish: boolean;
    isLoading: boolean;
    onSave: () => void;
    onPublish: () => void;
    onUnpublish?: () => void;
  } = $props();

  const allValid = $derived(
    validation.generalInfoComplete &&
    validation.ripCostValid &&
    validation.tiersSelected &&
    validation.tierProbabilitiesValid &&
    validation.cardsAssigned
  );
</script>

<Card.Root class="sticky top-4">
  <Card.Header>
    <div class="space-y-2">
      <Card.Title class="text-lg">{packName || "Untitled Pack"}</Card.Title>
      <Badge variant={isDraft ? "secondary" : "default"}>
        {isDraft ? "Draft" : "Published"}
      </Badge>
    </div>
  </Card.Header>

  <Separator />

  <Card.Content class="pt-6">
    <div class="space-y-4">
      <div>
        <h3 class="font-semibold text-sm mb-3">Validation Checklist</h3>
        <div class="space-y-2">
          <!-- General Info -->
          <div class="flex items-start gap-2">
            {#if validation.generalInfoComplete}
              <IconCheck size={16} class="text-green-600 mt-0.5 shrink-0" />
            {:else}
              <IconX size={16} class="text-muted-foreground mt-0.5 shrink-0" />
            {/if}
            <span class="text-sm" class:text-muted-foreground={!validation.generalInfoComplete}>
              General info complete
            </span>
          </div>

          <!-- Rip Cost -->
          <div class="flex items-start gap-2">
            {#if validation.ripCostValid}
              <IconCheck size={16} class="text-green-600 mt-0.5 shrink-0" />
            {:else}
              <IconX size={16} class="text-muted-foreground mt-0.5 shrink-0" />
            {/if}
            <span class="text-sm" class:text-muted-foreground={!validation.ripCostValid}>
              Rip cost valid
            </span>
          </div>

          <!-- Tiers Selected -->
          <div class="flex items-start gap-2">
            {#if validation.tiersSelected}
              <IconCheck size={16} class="text-green-600 mt-0.5 shrink-0" />
            {:else}
              <IconX size={16} class="text-muted-foreground mt-0.5 shrink-0" />
            {/if}
            <span class="text-sm" class:text-muted-foreground={!validation.tiersSelected}>
              Tiers selected
            </span>
          </div>

          <!-- Tier Probabilities -->
          <div class="flex items-start gap-2">
            {#if validation.tierProbabilitiesValid}
              <IconCheck size={16} class="text-green-600 mt-0.5 shrink-0" />
            {:else}
              <IconX size={16} class="text-muted-foreground mt-0.5 shrink-0" />
            {/if}
            <span class="text-sm" class:text-muted-foreground={!validation.tierProbabilitiesValid}>
              Tier probabilities sum to 100%
            </span>
          </div>

          <!-- Cards Assigned -->
          <div class="flex items-start gap-2">
            {#if validation.cardsAssigned}
              <IconCheck size={16} class="text-green-600 mt-0.5 shrink-0" />
            {:else}
              <IconX size={16} class="text-muted-foreground mt-0.5 shrink-0" />
            {/if}
            <span class="text-sm" class:text-muted-foreground={!validation.cardsAssigned}>
              Cards assigned to tiers
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div class="flex items-center gap-2 p-3 rounded-md" class:bg-green-50={allValid} class:bg-muted={!allValid}>
        {#if allValid}
          <IconCheck size={18} class="text-green-600" />
          <span class="text-sm font-medium text-green-900">Ready to publish</span>
        {:else}
          <IconAlertCircle size={18} class="text-muted-foreground" />
          <span class="text-sm font-medium text-muted-foreground">Complete checklist to publish</span>
        {/if}
      </div>

      <Separator />

      <div class="space-y-2">
        <Button
          variant="outline"
          class="w-full"
          onclick={onSave}
          disabled={isLoading}
        >
          <IconDeviceFloppy size={18} class="mr-2" />
          Save Draft
        </Button>
        {#if isDraft}
          <Button
            class="w-full"
            onclick={onPublish}
            disabled={!canPublish || isLoading}
          >
            <IconRocket size={18} class="mr-2" />
            Publish
          </Button>
        {:else if onUnpublish}
          <Button
            variant="destructive"
            class="w-full"
            onclick={onUnpublish}
            disabled={isLoading}
          >
            <IconBan size={18} class="mr-2" />
            Unpublish
          </Button>
        {/if}
      </div>
    </div>
  </Card.Content>
</Card.Root>
