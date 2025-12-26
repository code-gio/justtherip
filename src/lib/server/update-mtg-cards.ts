interface ScryfallBulkData {
  object: string;
  id: string;
  type: string;
  name: string;
  description: string;
  download_uri: string;
  updated_at: string;
  size: number;
  content_type: string;
  content_encoding: string;
}

interface ScryfallBulkDataResponse {
  object: string;
  has_more: boolean;
  data: ScryfallBulkData[];
}

export interface UpdateMtgCardsResult {
  success: boolean;
  message: string;
  defaultCardsData?: ScryfallBulkData;
  cardsDataFetched?: boolean;
  cardsCount?: number;
  cardsProcessed?: number;
  batchesProcessed?: number;
  newCards?: number;
  updatedCards?: number;
  errorCards?: number;
  error?: string;
}

import { adminClient } from "./rips";

interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string | null;
  cmc?: number | null;
  type_line?: string | null;
  oracle_text?: string | null;
  power?: string | null;
  toughness?: string | null;
  colors?: string[] | null;
  color_identity?: string[] | null;
  rarity?: string | null;
  set?: string | null;
  set_name?: string | null;
  collector_number?: string | null;
  artist?: string | null;
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
    border_crop?: string;
  } | null;
  prices?: {
    usd?: string | null;
    usd_foil?: string | null;
    usd_etched?: string | null;
    eur?: string | null;
    eur_foil?: string | null;
    tix?: string | null;
  } | null;
  legalities?: {
    [format: string]: string;
  } | null;
  released_at?: string | null;
  [key: string]: any;
}

interface ProcessStats {
  new: number;
  updated: number;
  errors: number;
}

/**
 * Update MTG cards from Scryfall bulk data API
 * 
 * Fetches the bulk data list and finds the "Default Cards" dataset
 * which contains every card object on Scryfall in English.
 */
export async function updateMtgCards(): Promise<UpdateMtgCardsResult> {
  try {
    const response = await fetch("https://api.scryfall.com/bulk-data");

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch bulk data from Scryfall",
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data: ScryfallBulkDataResponse = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      return {
        success: false,
        message: "Invalid response format from Scryfall API",
        error: "Response data is not an array",
      };
    }

    const defaultCards = data.data.find((item) => item.name === "Default Cards");

    if (!defaultCards) {
      return {
        success: false,
        message: "Default Cards dataset not found in bulk data",
        error: "Could not locate 'Default Cards' in the bulk data list",
      };
    }

    // Fetch the actual cards data from the download URI
    console.log(`Fetching cards data from: ${defaultCards.download_uri}`);
    const cardsResponse = await fetch(defaultCards.download_uri);

    if (!cardsResponse.ok) {
      return {
        success: false,
        message: "Failed to fetch cards data from download URI",
        error: `HTTP ${cardsResponse.status}: ${cardsResponse.statusText}`,
        defaultCardsData: defaultCards,
      };
    }

    // Stream the response body and collect it
    // Note: For very large files, consider using a streaming JSON parser
    const responseText = await cardsResponse.text();
    
    // Parse the JSON array
    const cardsData: ScryfallCard[] = JSON.parse(responseText);

    if (!Array.isArray(cardsData)) {
      return {
        success: false,
        message: "Invalid cards data format",
        error: "Cards data is not an array",
        defaultCardsData: defaultCards,
        cardsDataFetched: false,
      };
    }

    const totalCards = cardsData.length;
    console.log(`Fetched ${totalCards} cards. Processing in chunks...`);

    // Process cards in chunks to avoid memory issues and allow progress tracking
    const CHUNK_SIZE = 1000; // Process 1000 cards at a time
    let cardsProcessed = 0;
    let batchesProcessed = 0;
    const stats: ProcessStats = {
      new: 0,
      updated: 0,
      errors: 0,
    };

    for (let i = 0; i < cardsData.length; i += CHUNK_SIZE) {
      const chunk = cardsData.slice(i, i + CHUNK_SIZE);
      batchesProcessed++;

      // Process this chunk (insert/update into database)
      const chunkStats = await processCardsChunk(chunk, batchesProcessed);
      stats.new += chunkStats.new;
      stats.updated += chunkStats.updated;
      stats.errors += chunkStats.errors;

      cardsProcessed += chunk.length;

      // Log progress every 10 batches
      if (batchesProcessed % 10 === 0) {
        const progress = ((cardsProcessed / totalCards) * 100).toFixed(1);
        console.log(
          `Processed ${cardsProcessed}/${totalCards} cards (${progress}%) - ${batchesProcessed} batches | New: ${stats.new}, Updated: ${stats.updated}, Errors: ${stats.errors}`
        );
      }
    }

    console.log(
      `✅ Completed processing ${cardsProcessed} cards in ${batchesProcessed} batches`
    );
    console.log(
      `📊 Stats: ${stats.new} new, ${stats.updated} updated, ${stats.errors} errors`
    );

    return {
      success: true,
      message: `Successfully processed ${cardsProcessed} cards in ${batchesProcessed} batches`,
      defaultCardsData: defaultCards,
      cardsDataFetched: true,
      cardsCount: totalCards,
      cardsProcessed,
      batchesProcessed,
      newCards: stats.new,
      updatedCards: stats.updated,
      errorCards: stats.errors,
    };
  } catch (error) {
    console.error("Error updating MTG cards:", error);
    return {
      success: false,
      message: "Error updating MTG cards",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Map Scryfall card data to database schema
 */
function mapScryfallCardToDb(card: ScryfallCard) {
  // Parse released_at date
  let releasedAt: Date | null = null;
  if (card.released_at) {
    releasedAt = new Date(card.released_at);
    // Check if date is valid
    if (isNaN(releasedAt.getTime())) {
      releasedAt = null;
    }
  }

  return {
    card_id: card.id,
    name: card.name,
    mana_cost: card.mana_cost || null,
    cmc: card.cmc ?? null,
    type_line: card.type_line || null,
    oracle_text: card.oracle_text || null,
    power: card.power || null,
    toughness: card.toughness || null,
    colors: card.colors && card.colors.length > 0 ? card.colors : null,
    color_identity:
      card.color_identity && card.color_identity.length > 0
        ? card.color_identity
        : null,
    rarity: card.rarity || null,
    set_code: card.set || null,
    set_name: card.set_name || null,
    collector_number: card.collector_number || null,
    artist: card.artist || null,
    image_uri: card.image_uris ? card.image_uris : null,
    prices: card.prices || null,
    legalities: card.legalities || null,
    released_at: releasedAt,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Process a chunk of cards
 * 
 * Uses upsert to handle both new and updated cards:
 * - New cards: Inserted if card_id doesn't exist
 * - Updated cards: Updated if card_id exists (based on unique constraint)
 * 
 * Returns statistics about the processing
 */
async function processCardsChunk(
  chunk: ScryfallCard[],
  batchNumber: number
): Promise<ProcessStats> {
  const stats: ProcessStats = {
    new: 0,
    updated: 0,
    errors: 0,
  };

  try {
    // Map Scryfall cards to database schema
    const dbCards = chunk
      .map((card) => {
        try {
          return mapScryfallCardToDb(card);
        } catch (error) {
          console.error(
            `Error mapping card ${card.id} (${card.name}):`,
            error
          );
          stats.errors++;
          return null;
        }
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);

    if (dbCards.length === 0) {
      return stats;
    }

    // Get existing card_ids to determine if they're new or updated
    const cardIds = dbCards.map((card) => card.card_id);
    const { data: existingCards, error: fetchError } = await adminClient
      .from("mtg_cards")
      .select("card_id")
      .in("card_id", cardIds);

    if (fetchError) {
      console.error(
        `Error fetching existing cards for batch ${batchNumber}:`,
        fetchError
      );
      // Continue anyway - upsert will handle it
    }

    const existingCardIds = new Set(
      existingCards?.map((card) => card.card_id) || []
    );

    // Count new vs updated
    dbCards.forEach((card) => {
      if (existingCardIds.has(card.card_id)) {
        stats.updated++;
      } else {
        stats.new++;
      }
    });

    // Upsert cards (insert new, update existing)
    // onConflict uses the unique constraint on card_id
    const { error } = await adminClient
      .from("mtg_cards")
      .upsert(dbCards, {
        onConflict: "card_id",
        ignoreDuplicates: false, // Update existing records
      });

    if (error) {
      console.error(`Error upserting batch ${batchNumber}:`, error);
      stats.errors += dbCards.length;
      throw error;
    }

    if (batchNumber % 10 === 0 || batchNumber === 1) {
      console.log(
        `Batch ${batchNumber}: ${dbCards.length} cards processed (${stats.new} new, ${stats.updated} updated)`
      );
    }
  } catch (error) {
    console.error(`Error processing batch ${batchNumber}:`, error);
    stats.errors += chunk.length;
  }

  return stats;
}

