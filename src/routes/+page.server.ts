import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { processProfilesWithAvatars } from "$lib/server/storage";

export const load: PageServerLoad = async () => {
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
    .limit(20);

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
    .limit(10);

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
    .limit(10);

  if (recentError || mythicError || rareRarityError) {
    console.error("Error fetching pulls:", recentError || mythicError || rareRarityError);
    return {
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
    recentPulls,
    rarePulls,
  };
};
