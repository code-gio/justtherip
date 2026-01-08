import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

const CARDS_PER_PAGE = 50;

/**
 * Card Search API Endpoint
 * 
 * GET /api/admin/cards/search
 * 
 * Query params:
 * - game_code: 'mtg', 'pokemon', etc.
 * - search: search query (card name)
 * - page: page number (default 1)
 * - min_value_cents: minimum card value in cents
 * - max_value_cents: maximum card value in cents
 * - pack_id: optional, exclude already assigned cards
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const gameCode = url.searchParams.get("game_code");
  const rawSearchQuery = url.searchParams.get("search") || "";
  const searchQuery = rawSearchQuery.trim();
  const page = parseInt(url.searchParams.get("page") || "1");
  const minValueCents = parseInt(url.searchParams.get("min_value_cents") || "0");
  const maxValueCents = parseInt(url.searchParams.get("max_value_cents") || "999999999");
  const packId = url.searchParams.get("pack_id");

  if (!gameCode) {
    return json({ error: "game_code is required" }, { status: 400 });
  }

  // Use provided value range directly (no tier filtering)
  const effectiveMinValue = minValueCents;
  const effectiveMaxValue = maxValueCents;

  // Determine table name based on game
  const tableName = `${gameCode}_cards`;
  const offset = (page - 1) * CARDS_PER_PAGE;

  try {
    // Get already assigned card IDs if pack_id is provided
    let assignedCardIds: string[] = [];
    if (packId) {
      const { data: assignedCards } = await adminClient
        .from("pack_cards")
        .select("card_uuid")
        .eq("pack_id", packId);

      assignedCardIds = (assignedCards || []).map((ac) => ac.card_uuid);
    }

    // Build query based on game type
    let query = adminClient.from(tableName).select("*", { count: "exact" });

    // Handle MTG cards with JSONB prices field
    if (gameCode === "mtg") {
      // For MTG, if no search query, get a sample of cards ordered by name
      // to avoid loading too many cards and causing timeout
      if (!searchQuery) {
        // Just fetch a limited set ordered by name for initial display
        // Use proper range based on the current page
        const rangeStart = offset;
        const rangeEnd = offset + CARDS_PER_PAGE - 1;

        const { data: sampleCards, error: cardsError } = await query
          .order("name", { ascending: true })
          .range(rangeStart, rangeEnd);

        if (cardsError) {
          console.error("Error fetching cards:", cardsError);
          return json({ error: "Failed to fetch cards" }, { status: 500 });
        }

        // Filter by price range and assigned cards
        const filteredCards = (sampleCards || [])
          .filter((card: any) => {
            const prices = card.prices || {};
            const usdPrice = parseFloat(prices.usd || "0");
            const usdFoilPrice = parseFloat(prices.usd_foil || "0");
            const priceCents = Math.max(usdPrice, usdFoilPrice) * 100;

            return (
              priceCents >= effectiveMinValue &&
              priceCents <= effectiveMaxValue &&
              (!assignedCardIds.length || !assignedCardIds.includes(card.id))
            );
          })
          .sort((a: any, b: any) => {
            const aPrice = Math.max(
              parseFloat(a.prices?.usd || "0"),
              parseFloat(a.prices?.usd_foil || "0")
            );
            const bPrice = Math.max(
              parseFloat(b.prices?.usd || "0"),
              parseFloat(b.prices?.usd_foil || "0")
            );
            return bPrice - aPrice;
          });

        const paginatedCards = filteredCards;
        const hasMoreCards = sampleCards.length === CARDS_PER_PAGE;

        return json({
          cards: paginatedCards,
          total: filteredCards.length,
          page,
          perPage: CARDS_PER_PAGE,
          hasMore: hasMoreCards,
        });
      }

      // Filter by search query first to reduce dataset
      query = query.ilike("name", `%${searchQuery}%`);

      // With trigram index, we can handle more results
      // If you haven't created the trigram index yet, this might still timeout
      const maxFetch = 200; // Reasonable with trigram index
      const { data: allCards, error: cardsError } = await query
        .order("name", { ascending: true })
        .limit(maxFetch);

      if (cardsError) {
        console.error("Error fetching cards:", cardsError);
        return json({ error: "Failed to fetch cards" }, { status: 500 });
      }

      // Filter by price range and assigned cards in memory
      const filteredCards = (allCards || [])
        .filter((card: any) => {
          const prices = card.prices || {};
          const usdPrice = parseFloat(prices.usd || "0");
          const usdFoilPrice = parseFloat(prices.usd_foil || "0");
          const priceCents = Math.max(usdPrice, usdFoilPrice) * 100;

          return (
            priceCents >= effectiveMinValue &&
            priceCents <= effectiveMaxValue &&
            (!assignedCardIds.length || !assignedCardIds.includes(card.id))
          );
        })
        .sort((a: any, b: any) => {
          const aPrice = Math.max(
            parseFloat(a.prices?.usd || "0"),
            parseFloat(a.prices?.usd_foil || "0")
          );
          const bPrice = Math.max(
            parseFloat(b.prices?.usd || "0"),
            parseFloat(b.prices?.usd_foil || "0")
          );
          return bPrice - aPrice;
        });

      const total = filteredCards.length;
      const paginatedCards = filteredCards.slice(
        offset,
        offset + CARDS_PER_PAGE
      );

      return json({
        cards: paginatedCards,
        total,
        page,
        perPage: CARDS_PER_PAGE,
        hasMore: offset + CARDS_PER_PAGE < total,
      });
    } else {
      // For other games, assume they have market_value_cents column
      query = query
        .gte("market_value_cents", effectiveMinValue)
        .lte("market_value_cents", effectiveMaxValue);

      // Apply search filter only if search query is not empty
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (assignedCardIds.length > 0) {
        query = query.not("id", "in", `(${assignedCardIds.join(",")})`);
      }

      const { data: cards, error: cardsError, count } = await query
        .order("market_value_cents", { ascending: false })
        .range(offset, offset + CARDS_PER_PAGE - 1);

      if (cardsError) {
        console.error("Error fetching cards:", cardsError);
        return json({ error: "Failed to fetch cards" }, { status: 500 });
      }

      return json({
        cards: cards || [],
        total: count || 0,
        page,
        perPage: CARDS_PER_PAGE,
        hasMore: (count || 0) > offset + CARDS_PER_PAGE,
      });
    }
  } catch (error) {
    console.error("Error in card search:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};

