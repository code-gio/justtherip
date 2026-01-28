<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import SimulatorHeader from "$lib/components/admin/simulator/simulator-header.svelte";
  import ProgressBar from "$lib/components/admin/simulator/progress-bar.svelte";
  import PackGrid from "$lib/components/admin/simulator/pack-grid.svelte";
  import SystemMetrics from "$lib/components/admin/simulator/system-metrics.svelte";
  import PricingCalculator from "$lib/components/admin/simulator/pricing-calculator.svelte";
  import SimulationControls from "$lib/components/admin/simulator/simulation-controls.svelte";
  import ResultsSummary from "$lib/components/admin/simulator/results-summary.svelte";
  import ProbabilityBreakdown from "$lib/components/admin/simulator/probability-breakdown.svelte";
  import { IconSparkles } from "@tabler/icons-svelte";
  import type { PageData } from "./$types";
  import { tick } from "svelte";

  interface PackPreview {
    id: string;
    name: string;
    image: string | null;
    price: number;
    game_code?: string;
    topCards?: Array<{
      id: string;
      name: string;
      image_url: string | null;
      market_value: number;
    }>;
  }

  interface CardProbability {
    id: string;
    name: string;
    image_url: string | null;
    market_value: number;
    probability: number;
    rarity?: string | null;
    set_name?: string | null;
    set_code?: string | null;
  }

  interface SimulationCardStat {
    card: CardProbability;
    count: number;
    totalValueRips: number;
    percentOfDraws: number;
  }

  interface SimulationResult {
    totalTrips: number;
    totalSpentRips: number;
    totalValueRips: number;
    netRips: number;
    cardStats: SimulationCardStat[];
  }

  let { data }: { data: PageData } = $props();
  let { packs } = $derived(data);

  let selectedPack = $state<PackPreview | null>(null);
  let numberOfTrips = $state(1);
  let isSimulating = $state(false);
  let simulationResult = $state<SimulationResult | null>(null);
  let apiError = $state<string | null>(null);
  let modalOpen = $state(false);
  let pullProgress = $state(0);
  let pullTarget = $state(0);
  let packCards = $state<CardProbability[]>([]);

  let totalSpentRips = $derived(simulationResult?.totalSpentRips ?? 0);
  let totalValueRips = $derived(simulationResult?.totalValueRips ?? 0);
  let totalNetRips = $derived(simulationResult?.netRips ?? 0);
  let houseEdgePercent = $derived(
    totalSpentRips > 0 ? ((totalSpentRips - totalValueRips) / totalSpentRips) * 100 : 0
  );
  let averageCardValue = $derived(
    simulationResult?.totalTrips ? totalValueRips / simulationResult.totalTrips : 0
  );

  const formatRips = (value: number) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function selectPack(pack: PackPreview) {
    selectedPack = pack;
    simulationResult = null;
    apiError = null;
    packCards = [];
    modalOpen = true;
  }

  function resetSimulation() {
    simulationResult = null;
    apiError = null;
    numberOfTrips = 1;
  }

  function exportToCSV() {
    if (!simulationResult) return;

    const headers = ["Card Name", "Market Value", "Probability", "Pulls", "Total Value", "Revenue", "Cost", "System Profit"];
    const packPrice = selectedPack?.price ?? 0;
    
    const rows = simulationResult.cardStats.map(stat => {
      const cardSpent = packPrice * stat.count;
      const cardProfit = stat.totalValueRips - cardSpent;
      return [
        stat.card.name,
        (stat.card.market_value / 100).toFixed(2),
        ((stat.card.probability || 0) * 100).toFixed(2),
        stat.count,
        stat.totalValueRips.toFixed(2),
        cardSpent.toFixed(2),
        (stat.totalValueRips).toFixed(2),
        cardProfit.toFixed(2)
      ];
    });

    const summaryRow = ["", "", "", "", "", "", "", ""];
    const totalRow = [
      "TOTAL",
      "",
      "100.00",
      simulationResult.totalTrips,
      simulationResult.totalValueRips.toFixed(2),
      simulationResult.totalSpentRips.toFixed(2),
      simulationResult.totalValueRips.toFixed(2),
      (-simulationResult.netRips).toFixed(2)
    ];

    const csvContent = [
      headers,
      ...rows,
      summaryRow,
      totalRow
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulator-${selectedPack?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function handleTripsInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const parsed = Number(target.value);
    numberOfTrips = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
  }

  function handleModalOpenChange(open: boolean) {
    modalOpen = open;
  }

  function getButtonLabel() {
    if (isSimulating) {
      return `Simulating (${pullProgress}/${pullTarget})`;
    }
    return "Run Simulator";
  }

  async function runSimulation() {
    if (!selectedPack || numberOfTrips <= 0 || isSimulating) {
      return;
    }

    apiError = null;
    simulationResult = null;
    isSimulating = true;
    pullTarget = numberOfTrips;
    pullProgress = 0;

    try {
      const response = await fetch(
        `/api/admin/simulator/packs/${selectedPack.id}`
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to fetch pack data");
      }

      const body = await response.json();
      const cards: CardProbability[] = body.cards || [];

      if (cards.length === 0) {
        throw new Error("No cards returned for this pack");
      }

      const normalizedCards = cards.map((card) => ({
        ...card,
        probability: card.probability || 0,
      }));

      let cumulative = 0;
      const distribution = normalizedCards.map((card) => {
        cumulative += card.probability;
        return {
          card,
          threshold: cumulative,
        };
      });

      if (cumulative <= 0) {
        throw new Error("Card probabilities are not configured");
      }

      const drawCounts = new Map<string, SimulationCardStat>();
      let totalValue = 0;

      for (let i = 0; i < numberOfTrips; i++) {
        const randomPoint = Math.random() * cumulative;
        const winner =
          distribution.find((entry) => randomPoint <= entry.threshold) ||
          distribution[distribution.length - 1];

        if (!winner) {
          continue;
        }

        const cardValueRips = (winner.card.market_value || 0) / 100;
        totalValue += cardValueRips;

        const existing = drawCounts.get(winner.card.id);
        if (existing) {
          drawCounts.set(winner.card.id, {
            ...existing,
            count: existing.count + 1,
            totalValueRips: existing.totalValueRips + cardValueRips,
            percentOfDraws: ((existing.count + 1) / numberOfTrips) * 100,
          });
        } else {
          drawCounts.set(winner.card.id, {
            card: winner.card,
            count: 1,
            totalValueRips: cardValueRips,
            percentOfDraws: (1 / numberOfTrips) * 100,
          });
        }

        pullProgress = i + 1;
        if ((i + 1) % 50 === 0) {
          await tick();
        }
      }

      pullProgress = numberOfTrips;

      const cardStats = Array.from(drawCounts.values()).sort(
        (a, b) => b.count - a.count
      );

      const totalSpent = selectedPack.price * numberOfTrips;
      const net = totalValue - totalSpent;

      simulationResult = {
        totalTrips: numberOfTrips,
        totalSpentRips: totalSpent,
        totalValueRips: totalValue,
        netRips: net,
        cardStats,
      };
    } catch (error) {
      console.error("Simulator error:", error);
      apiError =
        error instanceof Error ? error.message : "Failed to run simulator";
    } finally {
      isSimulating = false;
    }
  }
</script>

<div class="space-y-8">
  <SimulatorHeader totalTrips={simulationResult?.totalTrips} />

  {#if isSimulating}
    <ProgressBar {pullProgress} {pullTarget} />
  {/if}

  <PackGrid 
    {packs} 
    selectedPackId={selectedPack?.id ?? null}
    onSelectPack={selectPack}
  />

  <section>
    <Card.Root>
      <Card.Content class="text-center text-muted-foreground space-y-2">
        <p class="text-lg font-semibold">
          {selectedPack ? "Simulator modal is open" : "Select a pack to open the simulator modal"}
        </p>
        <p class="text-sm">
          {selectedPack
            ? "Close the modal to choose another pack."
            : "Click a pack above to launch the simulation controls in a modal."}
        </p>
      </Card.Content>
    </Card.Root>
  </section>

  <Dialog.Root bind:open={modalOpen} onOpenChange={handleModalOpenChange}>
    {#if selectedPack}
      <Dialog.Content class="sm:max-w-5xl space-y-6 max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
          <Dialog.Title class="text-2xl font-semibold">
            {selectedPack.name} simulator
          </Dialog.Title>
          <Dialog.Description class="text-sm text-muted-foreground">
            {selectedPack.price} Rips per pull. Adjust the number of trips and review
            the simulated outcome before closing this modal.
          </Dialog.Description>
        </Dialog.Header>

        {#if simulationResult && !isSimulating}
          <SystemMetrics
            {totalSpentRips}
            {totalValueRips}
            {totalNetRips}
            {houseEdgePercent}
            {formatRips}
          />

          <PricingCalculator
            {averageCardValue}
            packPrice={selectedPack.price}
            {formatRips}
          />

          <ProbabilityBreakdown
            cards={packCards}
            {formatRips}
          />
        {/if}

        <div class="grid gap-6 {(simulationResult && !isSimulating) || isSimulating ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}">
          {#if !simulationResult || isSimulating}
            <div class="animate-in fade-in slide-in-from-left-4 duration-300">
              {#if isSimulating}
                <div class="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 space-y-4">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="animate-spin">
                      <IconSparkles size={24} class="text-primary" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-primary">Simulation Running</p>
                      <p class="text-xs text-muted-foreground">Processing your data...</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="space-y-1">
                      <p class="text-xs text-muted-foreground">Simulation Status</p>
                      <div class="h-2 rounded-full bg-primary/20 overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-200"
                          style={`width: ${pullTarget ? (pullProgress / pullTarget) * 100 : 0}%`}
                        ></div>
                      </div>
                      <p class="text-xs font-medium text-primary">{pullProgress.toLocaleString()} / {pullTarget.toLocaleString()} pulls</p>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-primary/10 space-y-2">
                    <p class="text-xs text-muted-foreground">Estimated time remaining:</p>
                    <p class="text-sm font-semibold text-primary">
                      ~{Math.max(1, Math.ceil((pullTarget - pullProgress) / 100))}s
                    </p>
                  </div>
                </div>
              {:else}
                <SimulationControls
                  packName={selectedPack.name}
                  packPrice={selectedPack.price}
                  {numberOfTrips}
                  {isSimulating}
                  {apiError}
                  buttonLabel={getButtonLabel()}
                  {formatRips}
                  onTripsInput={handleTripsInput}
                  onRunSimulation={runSimulation}
                />
              {/if}
            </div>
          {/if}

          {#if simulationResult && !isSimulating}
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ResultsSummary
                {simulationResult}
                {totalNetRips}
                packPrice={selectedPack.price}
                {formatRips}
              />
            </div>
          {:else if !isSimulating}
            <div class="animate-out fade-out duration-200">
              <ResultsSummary
                {simulationResult}
                {totalNetRips}
                packPrice={selectedPack.price}
                {formatRips}
              />
            </div>
          {/if}
        </div>

        <Dialog.Footer class="flex justify-end gap-2">
          {#if simulationResult && !isSimulating}
            <Button variant="secondary" onclick={exportToCSV}>
              ⬇ Export to CSV
            </Button>
            <Button onclick={resetSimulation} class="text-white">
              Run Another Simulation
            </Button>
          {/if}
        </Dialog.Footer>
      </Dialog.Content>
    {/if}
  </Dialog.Root>
</div>
