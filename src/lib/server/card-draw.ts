import { adminClient } from "./rips";

/**
 * Card Draw System
 *
 * Implements inverse-power probability distribution for card selection
 * based on market values: P_i = (1/v_i^k) / sum(1/v_j^k)
 */

export interface DrawnCard {
  card_uuid: string;
  card_name: string;
  value_cents: number;
  card_image_url?: string;
  set_name?: string;
  set_code?: string;
  rarity?: string;
  is_foil?: boolean;
  condition?: string;
}

export interface DrawResult {
  success: boolean;
  card?: DrawnCard;
  error?: string;
}

/**
 * Get system config values
 */
async function getSystemConfig(key: string): Promise<string | null> {
  const { data, error } = await adminClient
    .from("system_config")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    console.error(`Error fetching system config for ${key}:`, error);
    return null;
  }

  // Handle both JSONB and string values
  if (typeof data.value === "object") {
    return String(data.value);
  }
  return String(data.value);
}

/**
 * Extract card data and image URL from database card record
 */
function extractCardData(card: any): {
  id: string;
  name: string;
  image_url: string | null;
  set_name: string | null;
  set_code: string | null;
  rarity: string | null;
} {
  // Extract image URL from JSONB image_uri field
  let imageUrl: string | null = null;
  if (card.image_uri) {
    if (typeof card.image_uri === "object") {
      // image_uri is JSONB with structure: { normal, large, small, etc. }
      imageUrl =
        card.image_uri.normal ||
        card.image_uri.large ||
        card.image_uri.png ||
        card.image_uri.small ||
        null;
    } else if (typeof card.image_uri === "string") {
      imageUrl = card.image_uri;
    }
  }

  return {
    id: card.id,
    name: card.name,
    image_url: imageUrl,
    set_name: card.set_name || null,
    set_code: card.set_code || null,
    rarity: card.rarity || null,
  };
}

/**
 * Calculate probabilities for all cards using inverse-power distribution
 * Formula: P_i = (1/v_i^k) / sum(1/v_j^k)
 */
function calculateProbabilities(
  cards: Array<{ market_value: number }>,
  k: number
): Array<{ weight: number; probability: number }> {
  // Calculate weights: w_i = 1 / (v_i^k)
  const weights = cards.map((card) => {
    const value = Math.max(card.market_value, 1); // Avoid division by zero
    return 1 / Math.pow(value, k);
  });

  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Normalize to probabilities
  return weights.map((weight) => ({
    weight,
    probability: weight / totalWeight,
  }));
}

/**
 * Select a card using weighted random selection based on probabilities
 */
function selectCardByProbability<T extends { market_value: number }>(
  cards: T[],
  probabilities: Array<{ probability: number }>
): T {
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < cards.length; i++) {
    cumulative += probabilities[i].probability;
    if (random <= cumulative) {
      return cards[i];
    }
  }

  // Fallback to first card (should never happen with correct probabilities)
  return cards[0];
}

/**
 * Draw a card from a specific pack using inverse-power probability distribution
 *
 * This implements the core card draw algorithm:
 * - Fetches all cards assigned to the pack
 * - Calculates weights based on market values: w_i = 1 / (v_i^k)
 * - Normalizes to probabilities: P_i = w_i / sum(w_j)
 * - Uses weighted random selection to pick a card
 */
export async function drawCardFromPack(
  packId: string,
  userId: string
): Promise<DrawResult> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:141',message:'drawCardFromPack entry',data:{packId,userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Get k parameter from system config (default: 1.1)
    const kStr = await getSystemConfig("probability_curvature_k");
    const k = kStr ? parseFloat(kStr) : 1.1;

    // Fetch pack to get game_code
    const { data: pack, error: packError } = await adminClient
      .from("packs")
      .select("id, game_code, is_active")
      .eq("id", packId)
      .single();

    if (packError || !pack) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:157',message:'Pack not found',data:{packId,packError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: "Pack not found",
      };
    }

    if (!pack.is_active) {
      return {
        success: false,
        error: "Pack is not active",
      };
    }

    const gameCode = pack.game_code || "mtg";

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:171',message:'Pack fetched',data:{packId,gameCode,packIsActive:pack.is_active},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Fetch all pack cards
    const { data: packCards, error: packCardsError } = await adminClient
      .from("pack_cards")
      .select("*")
      .eq("pack_id", packId);

    if (packCardsError) {
      console.error("Error fetching pack cards:", packCardsError);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:179',message:'Error fetching pack cards',data:{packId,packCardsError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: "Failed to fetch pack cards",
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:187',message:'Pack cards fetched',data:{packId,packCardsCount:packCards?.length||0,packCards:packCards?.map((pc:any)=>({card_uuid:pc.card_uuid,pack_id:pc.pack_id,market_value:pc.market_value}))||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!packCards || packCards.length === 0) {
      return {
        success: false,
        error: "Pack has no cards assigned",
      };
    }

    // Filter out cards with invalid market values
    const validCards = packCards.filter(
      (pc: any) => pc.market_value && pc.market_value > 0
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:195',message:'Valid cards filtered',data:{packId,validCardsCount:validCards.length,validCardUuids:validCards.map((pc:any)=>pc.card_uuid)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (validCards.length === 0) {
      return {
        success: false,
        error: "Pack has no cards with valid market values",
      };
    }

    // Calculate probabilities for all cards
    const probabilities = calculateProbabilities(validCards, k);

    // Select a card using weighted random
    const selectedPackCard = selectCardByProbability(validCards, probabilities);

    // Verify the selected card belongs to this pack
    if (selectedPackCard.pack_id !== packId) {
      console.error("Selected card does not belong to pack:", {
        selectedPackCardPackId: selectedPackCard.pack_id,
        requestedPackId: packId,
        cardUuid: selectedPackCard.card_uuid,
      });
      return {
        success: false,
        error: "Selected card does not belong to this pack",
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:210',message:'Card selected',data:{packId,selectedCardUuid:selectedPackCard.card_uuid,selectedCardPackId:selectedPackCard.pack_id,selectedCardMarketValue:selectedPackCard.market_value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Fetch the actual card data from the game-specific table
    const cardTable = `${gameCode}_cards`;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:214',message:'Fetching card data from game table',data:{packId,gameCode,cardTable,cardUuid:selectedPackCard.card_uuid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const { data: cardData, error: cardError } = await adminClient
      .from(cardTable)
      .select("id, name, image_uri, set_name, set_code, rarity")
      .eq("id", selectedPackCard.card_uuid)
      .single();

    if (cardError || !cardData) {
      console.error("Error fetching card data:", cardError);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:220',message:'Error fetching card data',data:{packId,cardUuid:selectedPackCard.card_uuid,cardError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: "Failed to fetch card data",
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:228',message:'Card data fetched',data:{packId,cardUuid:selectedPackCard.card_uuid,cardId:cardData.id,cardName:cardData.name,cardSetName:cardData.set_name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Verify the fetched card matches the selected card_uuid
    if (cardData.id !== selectedPackCard.card_uuid) {
      console.error("Fetched card does not match selected card_uuid:", {
        selectedCardUuid: selectedPackCard.card_uuid,
        fetchedCardId: cardData.id,
        packId,
      });
      return {
        success: false,
        error: "Fetched card does not match selected card",
      };
    }

    // Extract card information
    const extracted = extractCardData(cardData);

    // Build drawn card object
    const drawnCard: DrawnCard = {
      card_uuid: selectedPackCard.card_uuid,
      card_name: extracted.name,
      value_cents: selectedPackCard.market_value,
      card_image_url: extracted.image_url || undefined,
      set_name: extracted.set_name || undefined,
      set_code: extracted.set_code || undefined,
      rarity: extracted.rarity || undefined,
      is_foil: selectedPackCard.is_foil || undefined,
      condition: selectedPackCard.condition || undefined,
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:244',message:'Drawn card result',data:{packId,cardUuid:drawnCard.card_uuid,cardName:drawnCard.card_name,valueCents:drawnCard.value_cents,setName:drawnCard.set_name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Verify the drawn card is actually in the pack
    const cardInPack = packCards.find((pc: any) => pc.card_uuid === drawnCard.card_uuid && pc.pack_id === packId);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'card-draw.ts:250',message:'Verification: card in pack check',data:{packId,cardUuid:drawnCard.card_uuid,cardInPack:!!cardInPack,selectedPackCardPackId:selectedPackCard.pack_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    return {
      success: true,
      card: drawnCard,
    };
  } catch (error) {
    console.error("Error drawing card from pack:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate sell-back value for a card
 * Default rate is 85% of card value
 */
export async function calculateSellbackValue(
  valueCents: number
): Promise<number> {
  const sellbackRateStr = await getSystemConfig("sellback_rate");
  const sellbackRate = sellbackRateStr ? parseFloat(sellbackRateStr) : 85;

  const sellbackCents = Math.floor((valueCents * sellbackRate) / 100);

  // Convert cents to Rips (1 Rip = $1 = 100 cents)
  const rips = sellbackCents / 100;

  return rips;
}

/**
 * Calculate probabilities for all cards in a pack
 * Returns array of cards with their calculated probabilities
 */
export async function calculatePackCardProbabilities(
  packId: string
): Promise<
  Array<{
    card_uuid: string;
    market_value: number;
    probability: number;
    weight: number;
  }>
> {
  // Get k parameter
  const kStr = await getSystemConfig("probability_curvature_k");
  const k = kStr ? parseFloat(kStr) : 1.1;

  // Fetch pack cards
  const { data: packCards, error } = await adminClient
    .from("pack_cards")
    .select("card_uuid, market_value")
    .eq("pack_id", packId);

  if (error || !packCards || packCards.length === 0) {
    return [];
  }

  // Filter valid cards
  const validCards = packCards.filter(
    (pc: any) => pc.market_value && pc.market_value > 0
  );

  if (validCards.length === 0) {
    return [];
  }

  // Calculate probabilities
  const probabilities = calculateProbabilities(validCards, k);

  // Combine with card data
  return validCards.map((card: any, index: number) => ({
    card_uuid: card.card_uuid,
    market_value: card.market_value,
    probability: probabilities[index].probability,
    weight: probabilities[index].weight,
  }));
}
