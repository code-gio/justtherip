<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Progress } from "$lib/components/ui/progress";
  import { IconChevronLeft, IconChevronRight } from "@tabler/icons-svelte";
  import Step1PackBasics from "./steps/step1-pack-basics.svelte";
  import Step2TierStructure from "./steps/step2-tier-structure.svelte";
  import Step3AssignCards from "./steps/step3-assign-cards.svelte";
  import Step4Review from "./steps/step4-review.svelte";

  /**
   * Multi-step wizard for creating/editing packs
   * 
   * Steps:
   * 1. Pack Basics (name, slug, description, image, game, rip cost)
   * 2. Tier Structure (select tiers and assign probabilities)
   * 3. Assign Cards to Tiers (search and assign cards)
   * 4. Review & EV Summary (confirmation)
   */

  let {
    open = $bindable(false),
    packId = null,
    onComplete,
    onClose,
  }: {
    open?: boolean;
    packId?: string | null;
    onComplete?: () => void;
    onClose?: () => void;
  } = $props();

  const TOTAL_STEPS = 4;
  let currentStep = $state(1);

  // Wizard state - accumulates data across steps
  let packData = $state({
    // Step 1
    name: "",
    slug: "",
    description: "",
    image_url: "",
    game: "mtg" as "mtg" | "pokemon",
    rip_cost: 1,
    is_active: false,
    cards_per_pack: 1,

    // Step 2
    tierProbabilities: [] as Array<{ tierId: string; tierName: string; probability: number }>,

    // Step 3
    tierCards: {} as Record<string, Array<{ cardId: string; weight: number; condition: string; isFoil: boolean }>>,
  });

  // Step validation states
  let step1Valid = $state(false);
  let step2Valid = $state(false);
  let step3Valid = $state(false);

  function handleNext() {
    if (currentStep < TOTAL_STEPS) {
      currentStep++;
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function handleStep1Complete(data: typeof packData) {
    packData = { ...packData, ...data };
    step1Valid = true;
    handleNext();
  }

  function handleStep2Complete(data: typeof packData) {
    packData = { ...packData, tierProbabilities: data.tierProbabilities };
    step2Valid = true;
    handleNext();
  }

  function handleStep3Complete(data: typeof packData) {
    packData = { ...packData, tierCards: data.tierCards };
    step3Valid = true;
    handleNext();
  }

  function handlePublish() {
    // TODO: Submit pack data to API
    console.log("Publishing pack:", packData);
    if (onComplete) {
      onComplete();
    }
    handleClose();
  }

  function handleClose() {
    if (onClose) {
      onClose();
    }
    // Reset wizard state
    currentStep = 1;
    packData = {
      name: "",
      slug: "",
      description: "",
      image_url: "",
      game: "mtg",
      rip_cost: 1,
      is_active: false,
      cards_per_pack: 1,
      tierProbabilities: [],
      tierCards: {},
    };
    step1Valid = false;
    step2Valid = false;
    step3Valid = false;
  }

  const progress = $derived((currentStep / TOTAL_STEPS) * 100);
  const canGoNext = $derived(
    (currentStep === 1 && step1Valid) ||
      (currentStep === 2 && step2Valid) ||
      (currentStep === 3 && step3Valid) ||
      currentStep === 4
  );

  // Reset wizard state when dialog closes (but not when it opens)
  let wasOpen = $state(false);
  $effect(() => {
    if (wasOpen && !open) {
      // Dialog was open and is now closed - reset state
      currentStep = 1;
      packData = {
        name: "",
        slug: "",
        description: "",
        image_url: "",
        game: "mtg",
        rip_cost: 1,
        is_active: false,
        cards_per_pack: 1,
        tierProbabilities: [],
        tierCards: {},
      };
      step1Valid = false;
      step2Valid = false;
      step3Valid = false;
      if (onClose) {
        onClose();
      }
    }
    wasOpen = open;
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
    <div class="px-6 py-4 border-b">
      <Dialog.Header>
        <Dialog.Title class="text-2xl font-bold">
          {packId ? "Edit Pack" : "Create New Pack"}
        </Dialog.Title>
        <Dialog.Description>
          Step {currentStep} of {TOTAL_STEPS}
        </Dialog.Description>
      </Dialog.Header>
      <div class="mt-4">
        <Progress value={progress} class="h-2" />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      {#if currentStep === 1}
        <Step1PackBasics
          data={packData}
          onComplete={handleStep1Complete}
        />
      {:else if currentStep === 2}
        <Step2TierStructure
          data={packData}
          onComplete={handleStep2Complete}
        />
      {:else if currentStep === 3}
        <Step3AssignCards
          data={packData}
          onComplete={handleStep3Complete}
        />
      {:else if currentStep === 4}
        <Step4Review
          data={packData}
          onPublish={handlePublish}
        />
      {/if}
    </div>

    <div class="px-6 py-4 border-t flex items-center justify-between">
      <Button
        variant="outline"
        onclick={handleBack}
        disabled={currentStep === 1}
      >
        <IconChevronLeft size={18} class="mr-1" />
        Back
      </Button>

      <div class="flex gap-2">
        {#if currentStep < TOTAL_STEPS}
          <Button
            onclick={handleNext}
            disabled={!canGoNext}
          >
            Continue
            <IconChevronRight size={18} class="ml-1" />
          </Button>
        {:else}
          <Button onclick={handlePublish}>
            Publish Pack
          </Button>
        {/if}
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

