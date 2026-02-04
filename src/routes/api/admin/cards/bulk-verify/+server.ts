import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

interface CardEntry {
  name: string;
  collector_number?: string;
}

function normalizeCardEntries(body: {
  game_code: string;
  card_names?: string;
  card_entries?: CardEntry[];
}): CardEntry[] {
  if (Array.isArray(body.card_entries) && body.card_entries.length > 0) {
    return body.card_entries
      .map((e) => ({
        name: typeof e.name === "string" ? e.name.trim() : "",
        collector_number:
          typeof e.collector_number === "string"
            ? e.collector_number.trim() || undefined
            : undefined,
      }))
      .filter((e) => e.name.length > 0);
  }
  if (typeof body.card_names === "string") {
    return body.card_names
      .split("\n")
      .map((line) => ({ name: line.trim() }))
      .filter((e) => e.name.length > 0);
  }
  return [];
}

/**
 * Bulk Card Verification API Endpoint
 *
 * POST /api/admin/cards/bulk-verify
 *
 * Body:
 * - game_code: 'mtg', 'pokemon', etc.
 * - card_entries: array of { name: string, collector_number?: string } (preferred)
 * - card_names: string with card names, one per line (legacy)
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { game_code } = body;

    if (!game_code) {
      return json({ error: "game_code is required" }, { status: 400 });
    }

    const cardEntries = normalizeCardEntries(body);

    if (cardEntries.length === 0) {
      return json(
        { error: "card_entries or card_names is required and must be non-empty" },
        { status: 400 }
      );
    }

    if (cardEntries.length > 500) {
      return json(
        { error: "Maximum 500 cards can be verified at once" },
        { status: 400 }
      );
    }

    const tableName = `${game_code}_cards`;
    const found: any[] = [];
    const notFound: string[] = [];
    const seenCardIds = new Set<string>();

    const NAME_SEARCH_LIMIT = 10;

    const selectColumns =
      game_code === "mtg"
        ? "id, name, set_code, set_name, rarity, image_uri, prices, collector_number"
        : "id, name, set_code, set_name, rarity, image_uri, prices, market_value_cents";

    for (const entry of cardEntries) {
      const { name: cardName, collector_number: collectorNumber } = entry;
      const displayName = collectorNumber
        ? `${cardName} (${collectorNumber})`
        : cardName;

      try {
        let matchedCard: any = null;

        if (game_code === "mtg" && collectorNumber) {
          const normalizedNum = collectorNumber.replace(/[()]/g, "").trim() || collectorNumber;
          const numVariants = [collectorNumber, normalizedNum].filter(
            (v, i, a) => a.indexOf(v) === i
          );

          for (const num of numVariants) {
            const { data: byCollectorAndName, error: collectorError } = await adminClient
              .from(tableName)
              .select(selectColumns)
              .eq("collector_number", num)
              .ilike("name", `%${cardName}%`);

            if (collectorError || !byCollectorAndName?.length) continue;

            const lowerName = cardName.toLowerCase().trim();
            matchedCard =
              byCollectorAndName.find(
                (c: any) => (c.name ?? "").toLowerCase().trim() === lowerName
              ) ?? byCollectorAndName[0];
            break;
          }
        }

        if (!matchedCard) {
          // Sin collector_number: solo por name, con límite para no traer miles (tabla ~100k).
          const { data: exactMatch, error: exactError } = await adminClient
            .from(tableName)
            .select(selectColumns)
            .ilike("name", cardName)
            .limit(NAME_SEARCH_LIMIT);

          if (exactError) {
            console.error(`Error searching for card "${cardName}":`, exactError);
          } else if (exactMatch && exactMatch.length > 0) {
            const lowerCardName = cardName.toLowerCase();
            matchedCard = exactMatch.find(
              (c: any) => c.name?.toLowerCase() === lowerCardName
            );
            if (!matchedCard) matchedCard = exactMatch[0];
          }
        }

        if (!matchedCard) {
          const { data: fuzzyMatch, error: fuzzyError } = await adminClient
            .from(tableName)
            .select(selectColumns)
            .ilike("name", `%${cardName}%`)
            .limit(NAME_SEARCH_LIMIT);

          if (!fuzzyError && fuzzyMatch && fuzzyMatch.length > 0) {
            const lowerCardName = cardName.toLowerCase();
            matchedCard = fuzzyMatch.find(
              (c: any) => c.name?.toLowerCase() === lowerCardName
            );
            if (!matchedCard) matchedCard = fuzzyMatch[0];
          }
        }

        if (matchedCard) {
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
              notFound.push(displayName);
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
            notFound.push(displayName);
          }
        } else {
          notFound.push(displayName);
        }
      } catch (err) {
        console.error(`Error processing card "${cardName}":`, err);
        notFound.push(displayName);
      }
    }

    return json({
      found,
      notFound,
      total: cardEntries.length,
    });
  } catch (error) {
    console.error("Error in bulk card verification:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
