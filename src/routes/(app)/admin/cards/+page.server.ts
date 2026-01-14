import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async ({ url }) => {
  // Admin check is handled by /admin/+layout.server.ts

  const gameFilter = url.searchParams.get("game") || "all";
  const searchQuery = url.searchParams.get("search") || "";
  const setFilter = url.searchParams.get("set") || "";
  const rarityFilter = url.searchParams.get("rarity") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  // Determine which tables to query
  const tablesToQuery: string[] = [];
  if (gameFilter === "all") {
    tablesToQuery.push("mtg_cards", "pokemon_cards", "yugioh_cards");
  } else {
    tablesToQuery.push(`${gameFilter}_cards`);
  }

  // Fetch cards from all relevant tables
  const cardPromises = tablesToQuery.map(async (table) => {
    try {
      let query = adminClient
        .from(table)
        .select("*", { count: "exact" })
        .order("name", { ascending: true });

      // Apply search filter
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      // Apply set filter
      if (setFilter) {
        query = query.eq("set_code", setFilter);
      }

      // Apply rarity filter
      if (rarityFilter) {
        query = query.eq("rarity", rarityFilter);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error(`Error fetching cards from ${table}:`, error);
        return { table, cards: [], count: 0 };
      }

      // Transform cards to include game_code
      const transformedCards = (data || []).map((card: any) => {
        const gameCode = table.replace("_cards", "");
        return {
          ...card,
          game_code: gameCode,
          card_table: table,
          // Extract market value from prices JSONB
          market_value_cents: card.prices?.usd
            ? Math.round(parseFloat(card.prices.usd) * 100)
            : null,
          // Extract image URL
          image_url:
            card.image_uri?.normal ||
            card.image_uri?.large ||
            card.image_uri?.small ||
            null,
        };
      });

      return { table, cards: transformedCards, count: count || 0 };
    } catch (error) {
      console.error(`Error querying ${table}:`, error);
      return { table, cards: [], count: 0 };
    }
  });

  const results = await Promise.all(cardPromises);

  // Combine all cards
  const allCards = results.flatMap((r) => r.cards);
  const totalCount = results.reduce((sum, r) => sum + r.count, 0);

  // Get unique sets and rarities for filters
  const setsSet = new Set<string>();
  const raritiesSet = new Set<string>();

  // Fetch unique sets and rarities from all tables
  const metadataPromises = tablesToQuery.map(async (table) => {
    try {
      const { data: cards } = await adminClient
        .from(table)
        .select("set_code, rarity")
        .limit(10000); // Get a large sample for filter options

      (cards || []).forEach((card: any) => {
        if (card.set_code) setsSet.add(card.set_code);
        if (card.rarity) raritiesSet.add(card.rarity);
      });
    } catch (error) {
      console.error(`Error fetching metadata from ${table}:`, error);
    }
  });

  await Promise.all(metadataPromises);

  return {
    cards: allCards,
    total: totalCount,
    page,
    limit,
    hasMore: totalCount > offset + limit,
    filters: {
      sets: Array.from(setsSet).sort(),
      rarities: Array.from(raritiesSet).sort(),
    },
  };
};
