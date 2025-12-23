<script lang="ts">
  import { IconCheck } from "@tabler/icons-svelte";
  import type { ShipmentStatus } from "./types";
  import { SHIPMENT_STATUS_CONFIG } from "./types";

  interface Props {
    status: ShipmentStatus;
  }

  let { status }: Props = $props();

  const steps: ShipmentStatus[] = ["pending", "processing", "shipped", "delivered"];

  const currentStep = $derived(SHIPMENT_STATUS_CONFIG[status].step);

  function getStepState(stepIndex: number): "completed" | "current" | "upcoming" {
    const step = stepIndex + 1;
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  }

  function getProgressWidth(stepIndex: number): number {
    const state = getStepState(stepIndex);
    if (state === "completed") return 100;
    if (state === "current") return 100;
    return 0;
  }
</script>

<!-- Mobile Status Display -->
<div class="md:hidden mb-3">
  <h5 class="mb-2 font-medium text-foreground text-sm">
    Shipment status
  </h5>

  <div class="flex flex-wrap justify-between items-center gap-2">
    <p class="text-[13px] flex items-center gap-x-1.5">
      {#if status !== "delivered"}
        <span class="relative flex">
          <span class="animate-ping absolute inline-flex size-full rounded-full bg-primary/60 opacity-75"></span>
          <span class="relative inline-flex rounded-full size-2 bg-primary"></span>
        </span>
        <span class="font-medium text-primary">{SHIPMENT_STATUS_CONFIG[status].label}</span>
      {:else}
        <IconCheck size={16} class="text-foreground" />
        <span class="font-medium text-foreground">Delivered</span>
      {/if}
    </p>

    {#if status !== "delivered"}
      {@const nextStepIndex = steps.indexOf(status) + 1}
      {#if nextStepIndex < steps.length}
        <p class="text-[13px] flex items-center gap-x-1.5 text-muted-foreground">
          <span class="font-medium">{SHIPMENT_STATUS_CONFIG[steps[nextStepIndex]].label}</span>
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12h8"></path>
            <path d="m12 16 4-4-4-4"></path>
          </svg>
        </p>
      {/if}
    {/if}
  </div>
</div>

<!-- Desktop Progress Bar -->
<div class="grid grid-cols-4 gap-x-1 sm:gap-x-3">
  {#each steps as step, index}
    {@const state = getStepState(index)}
    {@const config = SHIPMENT_STATUS_CONFIG[step]}
    {@const progressWidth = getProgressWidth(index)}

    <div>
      <p class="hidden md:flex items-center gap-x-1.5 mb-2 text-sm {
        state === 'completed' ? 'text-foreground' : 
        state === 'current' ? 'text-primary' : 
        'text-muted-foreground opacity-50'
      }">
        {#if state === "completed"}
          <IconCheck size={16} />
        {:else if state === "current"}
          <span class="relative flex">
            <span class="animate-ping absolute inline-flex size-full rounded-full bg-primary/60 opacity-75"></span>
            <span class="relative inline-flex rounded-full size-2 bg-primary"></span>
          </span>
        {/if}
        {config.label}
      </p>

      <div 
        class="flex w-full h-1.5 bg-muted rounded-sm overflow-hidden" 
        role="progressbar" 
        aria-valuenow={progressWidth} 
        aria-valuemin={0} 
        aria-valuemax={100}
      >
        <div 
          class="flex flex-col justify-center rounded-sm overflow-hidden text-xs text-white text-center whitespace-nowrap transition-all duration-500 {
            state === 'current' ? 'bg-primary' : 'bg-foreground dark:bg-neutral-200'
          }"
          style="width: {progressWidth}%"
        ></div>
      </div>
    </div>
  {/each}
</div>

