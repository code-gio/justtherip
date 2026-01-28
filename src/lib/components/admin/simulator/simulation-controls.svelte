<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { IconRobot, IconSparkles } from "@tabler/icons-svelte";

  interface Props {
    packName: string;
    packPrice: number;
    numberOfTrips: number;
    isSimulating: boolean;
    apiError: string | null;
    buttonLabel: string;
    formatRips: (value: number) => string;
    onTripsInput: (event: Event) => void;
    onRunSimulation: () => void;
  }

  let { 
    packName, 
    packPrice, 
    numberOfTrips, 
    isSimulating, 
    apiError, 
    buttonLabel,
    formatRips,
    onTripsInput,
    onRunSimulation 
  }: Props = $props();

  let isClicked = $state(false);

  function handleClick() {
    isClicked = true;
    setTimeout(() => {
      isClicked = false;
    }, 600);
    onRunSimulation();
  }
</script>

<Card.Root class="transition-all duration-300">
  <Card.Content class="space-y-6">
    <div class="space-y-1">
      <p class="text-sm text-muted-foreground flex items-center gap-1">
        <IconRobot size={18} />
        Simulation Controls
      </p>
      <h3 class="text-2xl font-semibold">{packName}</h3>
      <p class="text-sm text-muted-foreground">
        {packPrice} Rips per opening
      </p>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium" for="trip-input">Trips to simulate</label>
      <input
        id="trip-input"
        type="number"
        min="0"
        class="w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        value={numberOfTrips}
        on:input={onTripsInput}
        disabled={isSimulating}
      />
    </div>

    {#if apiError}
      <div class="animate-in fade-in slide-in-from-top-2 duration-200">
        <p class="text-sm text-destructive">{apiError}</p>
      </div>
    {/if}

    <div class="space-y-2">
      <p class="text-sm text-muted-foreground">Estimated spend</p>
      <p class="text-3xl font-semibold transition-all duration-200">
        {formatRips(packPrice * numberOfTrips)} Rips
      </p>
    </div>

    <Button
      class={`w-full justify-center text-white transition-all duration-300 ${isClicked ? 'scale-95' : 'scale-100'}`}
      size="lg"
      disabled={isSimulating || numberOfTrips <= 0}
      onclick={handleClick}
    >
      <IconSparkles size={18} class={`mr-2 transition-transform duration-300 ${isSimulating ? 'animate-spin' : ''}`} />
      {buttonLabel}
    </Button>
  </Card.Content>
</Card.Root>
