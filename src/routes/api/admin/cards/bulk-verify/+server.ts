import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * Bulk Card Verification API Endpoint
 *
 * POST /api/admin/cards/bulk-verify
 *
 * Body:
 * - game_code: 'mtg', 'pokemon', etc.
 * - card_names: string with card names (one per line)
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { game_code, card_names } = body;

    if (!game_code) {
      return json({ error: "game_code is required" }, { status: 400 });
    }

    if (!card_names || typeof card_names !== "string") {
      return json(
        { error: "card_names is required and must be a string" },
        { status: 400 }
      );
    }

    const cardNamesArray = card_names
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    if (cardNamesArray.length === 0) {
      return json({ error: "No card names provided" }, { status: 400 });
    }

    if (cardNamesArray.length > 500) {
      return json(
        { error: "Maximum 500 cards can be verified at once" },
        { status: 400 }
      );
    }

    const tableName = `${game_code}_cards`;
    const found: any[] = [];
    const notFound: string[] = [];
    const seenCardIds = new Set<string>();

    // Different column selection based on game type
    const selectColumns =
      game_code === "mtg"
        ? "id, name, set_code, set_name, rarity, image_uri, prices"
        : "id, name, set_code, set_name, rarity, image_uri, prices, market_value_cents";

    for (const cardName of cardNamesArray) {
      try {
        // First, try exact match (case-insensitive) using lower()
        const { data: exactMatch, error: exactError } = await adminClient
          .from(tableName)
          .select(selectColumns)
          .ilike("name", cardName)
          .limit(5);

        let matchedCard = null;

        if (exactError) {
          console.error(`Error searching for card "${cardName}":`, exactError);
        } else if (exactMatch && exactMatch.length > 0) {
          // Find the best match (exact case-insensitive match first)
          const lowerCardName = cardName.toLowerCase();
          matchedCard = exactMatch.find(
            (c: any) => c.name.toLowerCase() === lowerCardName
          );

          // If no exact match, take the first result that contains the search term
          if (!matchedCard) {
            matchedCard = exactMatch[0];
          }
        }

        // If no match found, try fuzzy search with ILIKE pattern
        if (!matchedCard) {
          const { data: fuzzyMatch, error: fuzzyError } = await adminClient
            .from(tableName)
            .select(selectColumns)
            .ilike("name", `%${cardName}%`)
            .limit(5);

          if (!fuzzyError && fuzzyMatch && fuzzyMatch.length > 0) {
            // Find best match from fuzzy results
            const lowerCardName = cardName.toLowerCase();
            matchedCard = fuzzyMatch.find(
              (c: any) => c.name.toLowerCase() === lowerCardName
            );

            if (!matchedCard) {
              matchedCard = fuzzyMatch[0];
            }
          }
        }

        if (matchedCard) {
          // Check if we already added this card
          if (seenCardIds.has(matchedCard.id)) {
            continue;
          }

          if (game_code === "mtg" && matchedCard.prices) {
            const usd = parseFloat(matchedCard.prices.usd || "0");
            const usdFoil = parseFloat(matchedCard.prices.usd_foil || "0");
            const maxPrice = Math.max(usd, usdFoil);

            if (maxPrice > 0) {
              seenCardIds.add(matchedCard.id);
              found.push({
                ...matchedCard,
                set: matchedCard.set_code || matchedCard.set_name,
              });
            } else {
              notFound.push(cardName);
            }
          } else if (
            (matchedCard as any).market_value_cents &&
            (matchedCard as any).market_value_cents > 0
          ) {
            seenCardIds.add(matchedCard.id);
            found.push({
              ...matchedCard,
              set: matchedCard.set_code || matchedCard.set_name,
            });
          } else {
            notFound.push(cardName);
          }
        } else {
          notFound.push(cardName);
        }
      } catch (err) {
        console.error(`Error processing card "${cardName}":`, err);
        notFound.push(cardName);
      }
    }

    return json({
      found,
      notFound,
      total: cardNamesArray.length,
    });
  } catch (error) {
    console.error("Error in bulk card verification:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
