import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { processProfilesWithAvatars } from "$lib/server/storage";

/**
 * Extract card image URL from image_uri field
 */
function extractCardImageUrl(imageUri: any): string | null {
  if (!imageUri) return null;

  if (typeof imageUri === "string") {
    try {
      const parsed = JSON.parse(imageUri);
      if (typeof parsed === "object") {
        return (
          parsed.normal ||
          parsed.large ||
          parsed.png ||
          parsed.small ||
          null
        );
      }
      return imageUri;
    } catch {
      return imageUri;
    }
  }

  if (typeof imageUri === "object") {
    return (
      imageUri.normal ||
      imageUri.large ||
      imageUri.png ||
      imageUri.small ||
      null
    );
  }

  return null;
}

export const load: PageServerLoad = async () => {
  // Get the 4 most opened packs based on pack_openings count
  const { data: packOpeningsCount, error: openingsError } = await adminClient
    .from("pack_openings")
    .select("pack_id");


  const { data: packsActived, error: packsError } = await adminClient
    .from("packs")
    .select(`
        id,
        name,
        slug,
        image_url,
        game_code,
        rip_cost,
        total_openings
      `)
    .eq("is_active", true);


  const packsByCode = Object.values(
    packsActived?.reduce((acc: any, pack: any) => {
      if (!acc[pack.game_code]) {
        acc[pack.game_code] = {
          game_code: pack.game_code,
          packs: 0
        };
      }

      acc[pack.game_code].packs += 1;
      return acc;
    }, {})
  )


  // Count openings per pack
  const openingsMap = new Map<string, number>();
  (packOpeningsCount || []).forEach((opening: any) => {
    const count = openingsMap.get(opening.pack_id) || 0;
    openingsMap.set(opening.pack_id, count + 1);
  });


  // Get top 4 pack IDs by count
  const topPackIds = Array.from(openingsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([packId]) => packId);


  // Fetch pack details for the top 4 packs
  let topPacksData: any[] = [];
  if (topPackIds.length > 0) {
    const { data, error: packsError } = await adminClient
      .from("packs")
      .select(`
        id,
        name,
        slug,
        image_url,
        game_code,
        rip_cost,
        total_openings
      `)
      .in("id", topPackIds)
      .eq("is_active", true);


    topPacksData = data || [];
    // Sort by the original order from openingsMap
    topPacksData.sort((a, b) => {
      return topPackIds.indexOf(a.id) - topPackIds.indexOf(b.id);
    });
  }


  // Fetch top 3 cards for each pack
  const topPacksWithCards = await Promise.all(
    topPacksData.map(async (pack: any) => {
      const packData: any = {
        id: pack.id,
        name: pack.name,
        slug: pack.slug,
        image_url: pack.image_url,
        game_code: pack.game_code,
        rip_cost: pack.rip_cost,
        total_openings: pack.total_openings,
        topCards: [],
      };

      if (pack.game_code) {
        try {
          // Fetch top 3 most expensive cards from pack_cards
          const { data: packCardsResult, error: cardsError } = await adminClient
            .from("pack_cards")
            .select("card_uuid, market_value")
            .eq("pack_id", pack.id)
            .order("market_value", { ascending: false })
            .limit(3);

          if (cardsError) console.log(`❌ Cards error for ${pack.name}:`, cardsError);

          if (packCardsResult && packCardsResult.length > 0) {
            const cardTable = `${pack.game_code}_cards`;
            const cardUuids = packCardsResult.map((pc: any) => pc.card_uuid);

            // Fetch card data from game-specific table
            const { data: cardsData } = await adminClient
              .from(cardTable)
              .select("id, name, image_uri")
              .in("id", cardUuids);

            if (cardsData) {
              // Create a map of card data by UUID
              const cardDataMap = new Map<string, any>();
              cardsData.forEach((card: any) => {
                if (card.image_uri && typeof card.image_uri === "string") {
                  try {
                    card.image_uri = JSON.parse(card.image_uri);
                  } catch {
                    // Keep as string if not JSON
                  }
                }
                cardDataMap.set(card.id, card);
              });

              // Build topCards array matching packCardsResult order
              packData.topCards = packCardsResult
                .map((pc: any) => {
                  const cardData = cardDataMap.get(pc.card_uuid);
                  if (!cardData) return null;

                  return {
                    id: cardData.id,
                    name: cardData.name || "Unknown Card",
                    image_url: extractCardImageUrl(cardData.image_uri),
                    market_value: pc.market_value,
                  };
                })
                .filter((card: any) => card !== null);
            }
          }
        } catch (error) {
          console.error(`Error fetching cards for pack ${pack.id}:`, error);
        }
      }

      return packData;
    })
  );

  // Fetch the 20 most recent cards
  const { data: recentInventoryData, error: recentError } = await adminClient
    .from("user_inventory")
    .select(
      `
      id,
      card_name,
      card_image_url,
      card_value_cents,
      created_at,
      game_code,
      rarity,
      is_foil,
      user_id
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch 10 mythic cards
  const { data: mythicInventoryData, error: mythicError } = await adminClient
    .from("user_inventory")
    .select(
      `
      id,
      card_name,
      card_image_url,
      card_value_cents,
      created_at,
      game_code,
      rarity,
      is_foil,
      user_id
    `
    )
    .eq("rarity", "mythic")
    .order("created_at", { ascending: false })
    .limit(25);

  // Fetch 10 rare cards
  const { data: rareRarityInventoryData, error: rareRarityError } = await adminClient
    .from("user_inventory")
    .select(
      `
      id,
      card_name,
      card_image_url,
      card_value_cents,
      created_at,
      game_code,
      rarity,
      is_foil,
      user_id
    `
    )
    .eq("rarity", "rare")
    .order("created_at", { ascending: false })
    .limit(25);

  if (recentError || mythicError || rareRarityError) {
    console.error("Error fetching pulls:", recentError || mythicError || rareRarityError);
    return {
      topPacks: topPacksWithCards || [],
      recentPulls: [],
      rarePulls: [],
    };
  }

  // Combine mythic and rare cards (10 + 10 = 20)
  const rareInventoryData = [
    ...(mythicInventoryData || []),
    ...(rareRarityInventoryData || [])
  ];

  // Combine all user IDs
  const allInventoryData = [
    ...(recentInventoryData || []),
    ...rareInventoryData
  ];

  if (allInventoryData.length === 0) {
    return {
      topPacks: topPacksWithCards || [],
      recentPulls: [],
      rarePulls: [],
    };
  }

  const userIds = [...new Set(allInventoryData.map((item) => item.user_id))];

  // Fetch profiles for these users
  const { data: profilesData, error: profilesError } = await adminClient
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // Process profiles with signed URLs
  const processedProfiles = await processProfilesWithAvatars(
    adminClient,
    profilesData || []
  );

  // Create a map of profiles by user_id
  const profilesMap = new Map(
    processedProfiles.map((profile) => [profile.id, profile])
  );

  // Combine the data for recent pulls (20 cards)
  const recentPulls = (recentInventoryData || []).map((item) => ({
    ...item,
    profiles: profilesMap.get(item.user_id) || null,
  }));

  // Combine the data for rare pulls (10 mythic + 10 rare = 20 cards)
  const rarePulls = rareInventoryData.map((item) => ({
    ...item,
    profiles: profilesMap.get(item.user_id) || null,
  }));


  return {
    topPacks: topPacksWithCards || [],
    recentPulls,
    rarePulls,
    packsByGame: packsByCode,
  };
};
