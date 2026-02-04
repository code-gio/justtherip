<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    IconChevronDown,
    IconLoader2,
    IconUpload,
    IconAlertCircle,
    IconCheck,
    IconArrowLeft,
    IconX,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  interface Card {
    id: string;
    name: string;
    set?: string;
    prices?: {
      usd?: string;
      usd_foil?: string;
      eur?: string;
    };
    market_value_cents?: number;
    rarity?: string;
    image_uri?: any;
  }

  interface CardEntry {
    name: string;
    collector_number?: string;
  }

  interface VerificationResult {
    found: Card[];
    notFound: string[];
  }

  let {
    open = $bindable(),
    gameCode,
    onCardsVerified,
  }: {
    open: boolean;
    gameCode: string;
    onCardsVerified?: (cards: Card[]) => void;
  } = $props();

  let textInput = $state("");
  let fileInput = $state<HTMLInputElement | undefined>(undefined);
  let isVerifying = $state(false);
  let verificationResult = $state<VerificationResult | null>(null);
  let showExamples = $state(false);
  let showResults = $state(false);

  const COLLECTOR_NUMBER_PATTERN = /^[\da-z]+$/i;

  function looksLikeCollectorNumber(s: string): boolean {
    const t = s.replace(/^["']|["']$/g, "").replace(/[()]/g, "").trim();
    return t.length > 0 && t.length <= 10 && COLLECTOR_NUMBER_PATTERN.test(t);
  }

  const TRAILING_COLLECTOR_NUMBER = /\s*[^\w()]+\s*([\da-z]+)\s*$/i;

  function parseCardEntries(input: string): CardEntry[] {
    const entries: CardEntry[] = [];
    const lines = input.split(/\r?\n/);
    for (const line of lines) {
      let trimmedLine = line.trim();
      trimmedLine = trimmedLine.replace(/\uFF0C/g, ",").replace(/;/g, ",");
      if (!trimmedLine.length) continue;

      let namePart: string;
      let collectorNumber: string | undefined;
      const hasTab = trimmedLine.includes("\t");
      const hasComma = trimmedLine.includes(",");

      if (hasTab) {
        const tabParts = trimmedLine.split("\t").map((p) => p.trim());
        namePart = tabParts[0] ?? "";
        collectorNumber = tabParts[1]?.length ? tabParts[1] : undefined;
        if (!collectorNumber && namePart.includes(",")) {
          const commaParts = namePart.split(",").map((p) => p.trim());
          if (commaParts.length >= 2 && looksLikeCollectorNumber(commaParts[commaParts.length - 1] ?? "")) {
            collectorNumber = (commaParts[commaParts.length - 1] ?? "").replace(/^["']|["']$/g, "").trim();
            namePart = commaParts.slice(0, -1).join(",").trim();
          }
        } else if (collectorNumber) {
          collectorNumber = collectorNumber.replace(/^["']|["']$/g, "").trim() || undefined;
        }
      } else if (hasComma) {
        const parts = trimmedLine.split(",").map((p) => p.trim());
        if (parts.length >= 2 && looksLikeCollectorNumber(parts[parts.length - 1] ?? "")) {
          collectorNumber = (parts[parts.length - 1] ?? "").replace(/^["']|["']$/g, "").trim();
          namePart = parts.slice(0, -1).join(",").trim();
        } else {
          namePart = trimmedLine;
        }
      } else {
        namePart = trimmedLine;
      }

      let cleaned = namePart.replace(/^["']|["']$/g, "").trim();
      cleaned = cleaned.replace(/,\s*$/, "").trim();

      if (!collectorNumber) {
        const match = cleaned.match(TRAILING_COLLECTOR_NUMBER);
        if (match && looksLikeCollectorNumber(match[1])) {
          collectorNumber = match[1].trim();
          cleaned = cleaned.slice(0, match.index).trim().replace(/^["']|["']$/g, "");
        }
      }

      cleaned = cleaned.replace(/^\d+x?\s+/i, "");
      cleaned = cleaned.replace(/\([^)]*\)/g, "");
      cleaned = cleaned.replace(/\[[^\]]*\]/g, "");
      cleaned = cleaned.replace(/^#\s*/g, "");
      cleaned = cleaned.replace(/\^[^\s]*\^?/g, "");
      cleaned = cleaned.replace(/\s+/g, " ").trim();

      if (!cleaned.length) continue;

      if (collectorNumber !== undefined) {
        collectorNumber = collectorNumber.replace(/^["']|["']$/g, "").trim() || undefined;
      }
      entries.push({ name: cleaned, collector_number: collectorNumber });
    }
    return entries;
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 1MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      textInput = content;
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  }

  async function handleVerify() {
    if (!textInput.trim()) {
      toast.error("Please enter card names");
      return;
    }

    const cardEntries = parseCardEntries(textInput);

    if (cardEntries.length === 0) {
      toast.error("No valid card names found");
      return;
    }

    isVerifying = true;
    verificationResult = null;

    try {
      const response = await fetch("/api/admin/cards/bulk-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_code: gameCode,
          card_entries: cardEntries,
        }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error("Verification failed", {
          description: result.error,
        });
        return;
      }

      verificationResult = {
        found: result.found || [],
        notFound: result.notFound || [],
      };

      // Show results view
      showResults = true;

      if (result.found.length === 0) {
        toast.warning("No cards found", {
          description: "None of the card names matched cards in the database",
        });
      } else {
        toast.success(
          `Found ${result.found.length} card${result.found.length !== 1 ? "s" : ""}`,
          {
            description:
              result.notFound.length > 0
                ? `${result.notFound.length} card${result.notFound.length !== 1 ? "s" : ""} not found`
                : "All cards found successfully",
          }
        );
      }
    } catch (error) {
      console.error("Error verifying cards:", error);
      toast.error("Verification failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      isVerifying = false;
    }
  }

  function handleImport() {
    if (!verificationResult || verificationResult.found.length === 0) {
      return;
    }

    if (onCardsVerified) {
      onCardsVerified(verificationResult.found);
    }

    toast.success("Cards added", {
      description: `${verificationResult.found.length} card${verificationResult.found.length !== 1 ? "s" : ""} added to the pack`,
    });

    // Reset state
    textInput = "";
    verificationResult = null;
    showResults = false;
    open = false;
  }

  function handleClear() {
    textInput = "";
    verificationResult = null;
  }

  function handleBack() {
    showResults = false;
  }

  function handleRemoveCard(cardId: string) {
    if (!verificationResult) return;

    verificationResult = {
      ...verificationResult,
      found: verificationResult.found.filter((card) => card.id !== cardId),
    };
  }

  function handleCancel() {
    textInput = "";
    verificationResult = null;
    showResults = false;
    open = false;
  }

  function getCardImageUrl(card: Card): string | null {
    if (!card.image_uri) return null;

    if (typeof card.image_uri === "string") {
      return card.image_uri;
    }

    if (typeof card.image_uri === "object") {
      return (
        card.image_uri.normal ||
        card.image_uri.small ||
        card.image_uri.large ||
        null
      );
    }

    return null;
  }

  function getCardPrice(card: Card): string {
    if (gameCode === "mtg" && card.prices) {
      const usd = parseFloat(card.prices.usd || "0");
      const usdFoil = parseFloat(card.prices.usd_foil || "0");
      const maxPrice = Math.max(usd, usdFoil);
      return `$${maxPrice.toFixed(2)}`;
    }

    if (card.market_value_cents) {
      return `$${(card.market_value_cents / 100).toFixed(2)}`;
    }

    return "N/A";
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title>Import Cards</Dialog.Title>
      <Dialog.Description>
        {#if showResults}
          Review the cards found before importing
        {:else}
          Bulk import cards by entering card names or uploading a CSV file
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if !showResults}
      <!-- STEP 1: Input Form -->
      <div class="space-y-6">
        <!-- Formatting Examples -->
        <div class="space-y-2">
          <Button
            variant="outline"
            class="w-full justify-between"
            onclick={() => {
              showExamples = !showExamples;
            }}
          >
            <span>Formatting Examples</span>
            <IconChevronDown
              size={16}
              class="transition-transform duration-200"
              style={showExamples ? "transform: rotate(180deg)" : ""}
            />
          </Button>
          {#if showExamples}
            <div class="border rounded-lg p-4 bg-muted/50 space-y-2 text-sm">
              <p class="font-medium">One per line. Optional second column = collector number (CSV/tab):</p>
              <div
                class="bg-background rounded p-3 font-mono text-xs space-y-1"
              >
                <div>Sensei's Divining Top</div>
                <div>Sol Ring, 123</div>
                <div>Path to Exile, 456</div>
                <div>Wrath of God</div>
                <div>Island</div>
                <div>Forest</div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Upload CSV File -->
        <div class="space-y-2">
          <Label>Upload CSV or Text File</Label>
          <div class="flex gap-2">
            <input
              type="file"
              accept=".csv,.txt"
              class="hidden"
              bind:this={fileInput}
              onchange={handleFileSelect}
            />
            <Button
              variant="outline"
              class="w-full"
              onclick={() => fileInput?.click()}
            >
              <IconUpload size={16} class="mr-2" />
              Select or drop an Archidekt exported file (Max 1MB)
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            Supported formats: CSV, TXT
          </p>
        </div>

        <!-- Manual Text Input -->
        <div class="space-y-2">
          <Label>Or enter card names manually</Label>
          <Textarea
            bind:value={textInput}
            placeholder="Enter card names, one per line..."
            rows={10}
            class="font-mono text-sm"
          />
          <div class="flex justify-between items-center">
            <p class="text-xs text-muted-foreground">
              {textInput.trim()
                ? textInput
                    .trim()
                    .split("\n")
                    .filter((line) => line.trim()).length
                : 0} lines
            </p>
            {#if textInput.trim()}
              <Button variant="ghost" size="sm" onclick={handleClear}>
                Clear
              </Button>
            {/if}
          </div>
        </div>

        <!-- Verify Button -->
        <Button
          class="w-full text-white"
          onclick={handleVerify}
          disabled={!textInput.trim() || isVerifying}
        >
          {#if isVerifying}
            <IconLoader2 size={16} class="mr-2 animate-spin" />
            Verifying...
          {:else}
            Verify Cards
          {/if}
        </Button>
      </div>
    {:else}
      <!-- STEP 2: Verification Results -->
      <div class="space-y-4">
        <!-- Back Button -->
        <Button variant="outline" onclick={handleBack} class="w-full text-white">
          <IconArrowLeft size={16} class="mr-2" />
          Back to Edit
        </Button>

        <h3 class="font-semibold">Verification Results</h3>

        <!-- Found Cards -->
        {#if verificationResult && verificationResult.found.length > 0}
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <IconCheck size={16} class="text-green-600" />
              <span class="font-medium text-sm">
                Found ({verificationResult.found.length})
              </span>
            </div>
            <div
              class="max-h-[400px] overflow-y-auto border rounded-lg bg-muted/50 p-3"
            >
              <div class="grid grid-cols-3 gap-3">
                {#each verificationResult.found as card}
                  {@const imageUrl = getCardImageUrl(card)}
                  {@const price = getCardPrice(card)}
                  <div class="relative group">
                    <!-- Remove button -->
                    <button
                      onclick={() => handleRemoveCard(card.id)}
                      class="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove card"
                    >
                      <IconX size={16} />
                    </button>

                    <div
                      class="border-2 border-green-500/50 rounded-lg overflow-hidden bg-background"
                    >
                      {#if imageUrl}
                        <img
                          src={imageUrl}
                          alt={card.name}
                          class="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      {:else}
                        <div
                          class="aspect-[2.5/3.5] flex items-center justify-center bg-muted"
                        >
                          <span
                            class="text-xs text-muted-foreground text-center p-2"
                          >
                            {card.name}
                          </span>
                        </div>
                      {/if}
                      <div
                        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <p class="text-white text-xs font-semibold truncate">
                          {card.name}
                        </p>
                        <div class="flex justify-between items-center mt-1">
                          {#if card.set}
                            <span class="text-white/80 text-xs">{card.set}</span
                            >
                          {/if}
                          <span class="text-white font-bold text-xs"
                            >{price}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Not Found Cards -->
        {#if verificationResult && verificationResult.notFound.length > 0}
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <IconAlertCircle size={16} class="text-amber-600" />
              <span class="font-medium text-sm">
                Not Found ({verificationResult.notFound.length})
              </span>
            </div>
            <div class="max-h-48 overflow-y-auto border rounded-lg bg-muted/50">
              <div class="p-3 space-y-1">
                {#each verificationResult.notFound as cardName}
                  <div class="text-sm text-muted-foreground py-1">
                    {cardName}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- Import Button -->
        {#if verificationResult && verificationResult.found.length > 0}
          <Button class="w-full text-white" onclick={handleImport} >
            Import {verificationResult.found.length} Card{verificationResult
              .found.length !== 1
              ? "s"
              : ""}
          </Button>
        {/if}
      </div>
    {/if}

    <Dialog.Footer>
      <Button variant="outline" onclick={handleCancel}>Cancel</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
