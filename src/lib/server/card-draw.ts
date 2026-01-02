import { adminClient } from "./rips";

/**
 * Card Draw System
 *
 * Implements weighted random card drawing based on tier probabilities
 * with support for daily limits and max card value caps.
 */

export interface CardTier {
  id: string;
  name: string;
  default_probability: number;
  min_value_cents: number;
  max_value_cents: number;
  color_hex: string;
  description: string;
}

export interface DrawnCard {
  tier_id: string;
  tier_name: string;
  value_cents: number;
  card_uuid?: string;
  card_name?: string;
  card_image_url?: string;
  set_name?: string;
  set_code?: string;
  rarity?: string;
}

export interface DrawResult {
  success: boolean;
  card?: DrawnCard;
  error?: string;
}

/**
 * Get all card tiers with their probabilities
 */
export async function getCardTiers(): Promise<CardTier[]> {
  const { data, error } = await adminClient
    .from("card_tiers")
    .select("*")
    .eq("is_active", true)
    .order("default_probability", { ascending: false });

  if (error) {
    console.error("Error fetching card tiers:", error);
    return [];
  }

  return data || [];
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

  return data.value;
}

/**
 * Check if user has reached daily ultra-chase limit
 */
async function hasReachedDailyUltraChaseLimit(
  userId: string
): Promise<boolean> {
  const limitStr = await getSystemConfig("daily_ultra_chase_limit");
  const dailyLimit = limitStr ? parseInt(limitStr, 10) : 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await adminClient
    .from("pack_openings")
    .select("cards_pulled")
    .eq("user_id", userId)
    .gte("created_at", today.toISOString());

  if (error) {
    console.error("Error checking ultra-chase limit:", error);
    return false;
  }

  // Count Ultra Chase cards from cards_pulled JSONB array
  const ultraChaseCount = (data || []).reduce((count, opening) => {
    const cards = opening.cards_pulled || [];
    const ultraChaseCards = cards.filter(
      (card: any) => card.tier_name === "Ultra Chase"
    );
    return count + ultraChaseCards.length;
  }, 0);

  return ultraChaseCount >= dailyLimit;
}

/**
 * Perform weighted random selection from card tiers
 */
function selectTierByProbability(tiers: CardTier[]): CardTier {
  // Validate probabilities sum to ~1.0
  const totalProbability = tiers.reduce(
    (sum, tier) => sum + tier.default_probability,
    0
  );

  if (Math.abs(totalProbability - 1.0) > 0.01) {
    console.warn(
      `Tier probabilities sum to ${totalProbability}, expected 1.0. Normalizing...`
    );
  }

  const random = Math.random();
  let cumulative = 0;

  for (const tier of tiers) {
    cumulative += tier.default_probability;
    if (random <= cumulative) {
      return tier;
    }
  }

  // Fallback to most common tier (should never happen with correct probabilities)
  return tiers[0];
}

/**
 * Generate a random card value within the tier's range
 * Applies max card value cap from system config
 */
async function generateCardValue(tier: CardTier): Promise<number> {
  const maxCardValueStr = await getSystemConfig("max_card_value_cents");
  const maxCardValueCents = maxCardValueStr
    ? parseInt(maxCardValueStr, 10)
    : 50000; // Default $500

  // Generate random value within tier range
  const range = tier.max_value_cents - tier.min_value_cents;
  let valueCents = tier.min_value_cents + Math.floor(Math.random() * range);

  // Apply max card value cap
  valueCents = Math.min(valueCents, maxCardValueCents);

  return valueCents;
}

/**
 * Fetch a random card from mtg_cards table based on value range
 * Returns card data with extracted image URL
 */
async function fetchRandomCardFromDatabase(
  minValueCents: number,
  maxValueCents: number
): Promise<{
  id: string;
  name: string;
  image_url: string | null;
  set_name: string | null;
  set_code: string | null;
  rarity: string | null;
} | null> {
  try {
    // Fetch a reasonable sample of cards that might match the value range
    // We'll filter by price in memory since prices are stored as JSONB
    const { data: cards, error } = await adminClient
      .from("mtg_cards")
      .select("id, name, image_uri, set_name, set_code, rarity, prices")
      .limit(10000); // Limit to prevent memory issues

    if (error) {
      console.error("Error fetching cards from database:", error);
      return null;
    }

    if (!cards || cards.length === 0) {
      console.warn("No cards found in database");
      return null;
    }

    // Filter cards by price range
    const matchingCards = cards.filter((card: any) => {
      const prices = card.prices || {};
      const usdPrice = parseFloat(prices.usd || "0");
      const usdFoilPrice = parseFloat(prices.usd_foil || "0");
      const priceCents = Math.max(usdPrice, usdFoilPrice) * 100;

      return priceCents >= minValueCents && priceCents <= maxValueCents;
    });

    if (matchingCards.length === 0) {
      // If no cards match the exact range, use cards within a broader range
      const broaderMin = Math.max(0, minValueCents - minValueCents * 0.5);
      const broaderMax = maxValueCents + maxValueCents * 0.5;
      const broaderMatching = cards.filter((card: any) => {
        const prices = card.prices || {};
        const usdPrice = parseFloat(prices.usd || "0");
        const usdFoilPrice = parseFloat(prices.usd_foil || "0");
        const priceCents = Math.max(usdPrice, usdFoilPrice) * 100;
        return priceCents >= broaderMin && priceCents <= broaderMax;
      });

      if (broaderMatching.length === 0) {
        // Fallback: use any card
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        return extractCardData(randomCard);
      }

      const randomCard =
        broaderMatching[Math.floor(Math.random() * broaderMatching.length)];
      return extractCardData(randomCard);
    }

    // Select a random card from matching cards
    const randomCard =
      matchingCards[Math.floor(Math.random() * matchingCards.length)];
    return extractCardData(randomCard);
  } catch (error) {
    console.error("Error fetching random card:", error);
    return null;
  }
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
 * Draw a card from the available tiers
 *
 * This implements the core card draw algorithm with:
 * - Weighted random selection based on tier probabilities
 * - Daily ultra-chase limit enforcement
 * - Max card value cap enforcement
 */
export async function drawCard(userId: string): Promise<DrawResult> {
  try {
    // Get all active tiers
    const tiers = await getCardTiers();

    if (tiers.length === 0) {
      return {
        success: false,
        error: "No card tiers available",
      };
    }

    // Check ultra-chase limit
    const reachedLimit = await hasReachedDailyUltraChaseLimit(userId);

    // Filter out Ultra Chase tier if limit reached
    const availableTiers = reachedLimit
      ? tiers.filter((t) => t.name !== "Ultra Chase")
      : tiers;

    if (availableTiers.length === 0) {
      return {
        success: false,
        error: "No available tiers (ultra-chase limit reached)",
      };
    }

    // Normalize probabilities if we filtered out Ultra Chase
    if (availableTiers.length < tiers.length) {
      const totalProb = availableTiers.reduce(
        (sum, t) => sum + t.default_probability,
        0
      );
      availableTiers.forEach((t) => {
        t.default_probability = t.default_probability / totalProb;
      });
    }

    // Select tier using weighted random
    const selectedTier = selectTierByProbability(availableTiers);

    // Generate card value within tier range (with max cap)
    const valueCents = await generateCardValue(selectedTier);

    // Fetch a random card from the database that matches the tier's value range
    const cardData = await fetchRandomCardFromDatabase(
      selectedTier.min_value_cents,
      selectedTier.max_value_cents
    );

    const drawnCard: DrawnCard = {
      tier_id: selectedTier.id,
      tier_name: selectedTier.name,
      value_cents: valueCents,
      card_uuid: cardData?.id,
      card_name: cardData?.name,
      card_image_url: cardData?.image_url || undefined,
      set_name: cardData?.set_name || undefined,
      set_code: cardData?.set_code || undefined,
      rarity: cardData?.rarity || undefined,
    };

    return {
      success: true,
      card: drawnCard,
    };
  } catch (error) {
    console.error("Error drawing card:", error);
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
  const sellbackRateStr = await getSystemConfig("sellback_rate_percent");
  const sellbackRate = sellbackRateStr ? parseFloat(sellbackRateStr) : 85;

  const sellbackCents = Math.floor((valueCents * sellbackRate) / 100);

  // Convert cents to Rips (1 Rip = $1 = 100 cents)
  const rips = sellbackCents / 100;

  return rips;
}
