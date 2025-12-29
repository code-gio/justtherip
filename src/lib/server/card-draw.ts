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
  card_name?: string;
  card_image_url?: string;
  set_name?: string;
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

    const drawnCard: DrawnCard = {
      tier_id: selectedTier.id,
      tier_name: selectedTier.name,
      value_cents: valueCents,
      // TODO: Integrate with actual card API (TCGPlayer, etc.)
      // For now, we just have tier and value
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
