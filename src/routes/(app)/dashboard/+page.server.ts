import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient, getUserRipBalance } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch all dashboard data in parallel
  const [
    balance,
    packOpeningsResult,
    inventoryResult,
    allInventoryResult,
    transactionsResult,
    shipmentsResult,
  ] = await Promise.all([
    getUserRipBalance(user.id),
    // Pack openings stats (with pack_id for most opened pack)
    adminClient
      .from("pack_openings")
      .select("pack_id, rips_spent, total_value_cents, cards_pulled, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    // Current inventory stats (unsold only)
    adminClient
      .from("user_inventory")
      .select("card_value_cents, game_code, is_sold, created_at")
      .eq("user_id", user.id)
      .eq("is_sold", false),
    // All inventory (including sold) for total value pulled
    adminClient
      .from("user_inventory")
      .select("card_value_cents, game_code, is_sold, sellback_rips, card_name, created_at")
      .eq("user_id", user.id),
    // All transactions for comprehensive stats
    adminClient
      .from("rip_transactions")
      .select("amount, type, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    // Shipments (if shipments table exists)
    (async () => {
      try {
        const result = await adminClient
          .from("shipments")
          .select("status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        return result;
      } catch {
        return { data: [], error: null };
      }
    })(),
  ]);

  // Calculate pack opening stats
  const packOpenings = packOpeningsResult.data || [];
  const totalPacksOpened = packOpenings.length;
  const totalRipsSpent = packOpenings.reduce(
    (sum: number, po: any) => sum + (po.rips_spent || 0),
    0
  );

  // Calculate packs opened this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const packsThisWeek = packOpenings.filter(
    (po: any) => new Date(po.created_at) >= oneWeekAgo
  ).length;

  // Calculate packs opened this month
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const packsThisMonth = packOpenings.filter(
    (po: any) => new Date(po.created_at) >= oneMonthAgo
  ).length;

  // Find most opened pack
  const packCounts: Record<string, number> = {};
  packOpenings.forEach((po: any) => {
    if (po.pack_id) {
      packCounts[po.pack_id] = (packCounts[po.pack_id] || 0) + 1;
    }
  });
  const mostOpenedPackId = Object.entries(packCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  // Fetch pack name for most opened pack
  let mostOpenedPackName = null;
  if (mostOpenedPackId) {
    const { data: packData } = await adminClient
      .from("packs")
      .select("name")
      .eq("id", mostOpenedPackId)
      .single();
    mostOpenedPackName = packData?.name || null;
  }

  // Calculate opening streak (consecutive days with at least one pack opened)
  const openingDates = new Set(
    packOpenings.map((po: any) => {
      const date = new Date(po.created_at);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );
  const sortedDates = Array.from(openingDates).sort().reverse();
  let openingStreak = 0;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let checkDate = new Date(today);
  
  for (let i = 0; i < 365; i++) {
    const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (openingDates.has(dateStr)) {
      openingStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Find best pull and top valuable cards
  let bestPull: any = null;
  let bestPullValue = 0;
  const allPulledCards: any[] = [];
  
  packOpenings.forEach((po: any) => {
    const cards = Array.isArray(po.cards_pulled)
      ? po.cards_pulled
      : [po.cards_pulled];
    cards.forEach((card: any) => {
      const value = card.value_cents || card.card_value_cents || 0;
      allPulledCards.push({
        card_name: card.card_name || "Card",
        value_cents: value,
        card_image_url: card.card_image_url || null,
      });
      if (value > bestPullValue) {
        bestPullValue = value;
        bestPull = {
          card_name: card.card_name || "Card",
          value_cents: value,
        };
      }
    });
  });

  // Get top 5 most valuable cards
  const topValuableCards = allPulledCards
    .sort((a, b) => (b.value_cents || 0) - (a.value_cents || 0))
    .slice(0, 5);

  // Calculate inventory stats
  const inventory = inventoryResult.data || [];
  const allInventory = allInventoryResult.data || [];
  const totalCardsOwned = inventory.length;
  const totalInventoryValue = inventory.reduce(
    (sum: number, card: any) => sum + (card.card_value_cents || 0),
    0
  );

  // Calculate total value pulled (all cards ever, including sold)
  const totalValuePulled = allInventory.reduce(
    (sum: number, card: any) => sum + (card.card_value_cents || 0),
    0
  );

  // Count rare cards (high value cards >= $50)
  let rareCardsCount = 0;
  inventory.forEach((card: any) => {
    if ((card.card_value_cents || 0) >= 5000) {
      rareCardsCount++;
    }
  });

  // Count cards by game
  const cardsByGame: Record<string, number> = {};
  inventory.forEach((card: any) => {
    const game = card.game_code || "mtg";
    cardsByGame[game] = (cardsByGame[game] || 0) + 1;
  });

  // Calculate sold cards stats
  const soldCards = allInventory.filter((card: any) => card.is_sold);
  const cardsSoldCount = soldCards.length;
  const totalRipsFromSellbacks = soldCards.reduce(
    (sum: number, card: any) => sum + (parseFloat(card.sellback_rips || 0) || 0),
    0
  );

  // Calculate wallet stats
  const transactions = transactionsResult.data || [];
  const totalRipsPurchased = transactions
    .filter((t: any) => t.type === "credit" && t.reason === "purchase")
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
  const totalRipsSpentOnPacks = transactions
    .filter((t: any) => t.type === "debit" && t.reason === "pack_opening")
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
  const totalRipsFromSellbacksTransactions = transactions
    .filter((t: any) => t.type === "credit" && t.reason === "card_sellback")
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

  // ROI and Performance Metrics
  const totalValuePulledCents = totalValuePulled;
  const totalRipsSpentCents = totalRipsSpent * 100; // Convert Rips to cents (1 Rip = $1 = 100 cents)
  const netProfitLoss = totalValuePulledCents - totalRipsSpentCents;
  const roiPercentage = totalRipsSpent > 0 
    ? ((netProfitLoss / totalRipsSpentCents) * 100) 
    : 0;
  
  const averagePackValue = totalPacksOpened > 0
    ? totalValuePulledCents / totalPacksOpened
    : 0;
  
  const averageCardValue = allPulledCards.length > 0
    ? totalValuePulledCents / allPulledCards.length
    : 0;
  
  const packOpeningEfficiency = totalRipsSpent > 0
    ? totalValuePulledCents / (totalRipsSpent * 100)
    : 0;

  // Calculate win rate (packs where value > cost)
  const winningPacks = packOpenings.filter((po: any) => {
    const packValue = po.total_value_cents || 0;
    const packCost = (po.rips_spent || 0) * 100;
    return packValue > packCost;
  }).length;
  const winRate = totalPacksOpened > 0
    ? (winningPacks / totalPacksOpened) * 100
    : 0;

  // Calculate average packs per day/week
  let avgPacksPerDay = 0;
  let avgPacksPerWeek = 0;
  if (packOpenings.length > 0) {
    const firstOpening = new Date(packOpenings[packOpenings.length - 1].created_at);
    const daysSinceFirst = Math.max(
      1,
      Math.floor((Date.now() - firstOpening.getTime()) / (1000 * 60 * 60 * 24))
    );
    avgPacksPerDay = totalPacksOpened / daysSinceFirst;
    avgPacksPerWeek = avgPacksPerDay * 7;
  }

  // Calculate shipment stats
  const shipments = shipmentsResult.data || [];
  const pendingShipments = shipments.filter(
    (s: any) => s.status === "pending" || s.status === "processing"
  ).length;
  const shippedShipments = shipments.filter(
    (s: any) => s.status === "shipped"
  ).length;
  const deliveredShipments = shipments.filter(
    (s: any) => s.status === "delivered"
  ).length;

  // Build recent activity from transactions and pack openings
  const recentActivity: any[] = [];
  
  // Add recent pack openings
  packOpenings.slice(0, 5).forEach((po: any, packIndex: number) => {
    const cards = Array.isArray(po.cards_pulled)
      ? po.cards_pulled
      : [po.cards_pulled];
    cards.forEach((card: any, cardIndex: number) => {
      const date = new Date(po.created_at);
      const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
      const timeAgo =
        hoursAgo < 1
          ? "Just now"
          : hoursAgo < 24
            ? `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`
            : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) > 1 ? "s" : ""} ago`;

      recentActivity.push({
        id: `pack-${po.id ?? packIndex}-${cardIndex}-${card.card_uuid ?? `${packIndex}-${cardIndex}`}`,
        type: "pack_open",
        description: `Opened pack and pulled ${card.card_name || "a card"}`,
        timestamp: timeAgo,
        value: `$${((card.value_cents || card.card_value_cents || 0) / 100).toFixed(2)}`,
      });
    });
  });

  // Add recent transactions (purchases, sellbacks)
  transactions.slice(0, 5).forEach((t: any) => {
    const date = new Date(t.created_at);
    const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    const timeAgo =
      hoursAgo < 1
        ? "Just now"
        : hoursAgo < 24
          ? `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`
          : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) > 1 ? "s" : ""} ago`;

    if (t.type === "credit" && t.reason === "purchase") {
      recentActivity.push({
        id: `purchase-${t.id}`,
        type: "purchase",
        description: `Purchased ${Math.abs(t.amount || 0)} Rips`,
        timestamp: timeAgo,
        value: `+${Math.abs(t.amount || 0).toFixed(2)} Rips`,
      });
    } else if (t.type === "credit" && t.reason === "card_sellback") {
      recentActivity.push({
        id: `sellback-${t.id}`,
        type: "sell",
        description: `Sold card for Rips`,
        timestamp: timeAgo,
        value: `+${Math.abs(t.amount || 0).toFixed(2)} Rips`,
      });
    }
  });

  // Sort by timestamp and limit to 10 most recent
  recentActivity.sort((a, b) => {
    // Simple sort by id (which includes timestamp info)
    return b.id.localeCompare(a.id);
  });

  return {
    stats: {
      // Basic stats
      packsOpened: totalPacksOpened,
      packsThisWeek,
      packsThisMonth,
      cardsOwned: totalCardsOwned,
      rareCardsCount,
      inventoryValue: totalInventoryValue,
      
      // Shipments
      pendingShipments,
      shippedShipments,
      deliveredShipments,
      
      // Financial
      totalRipsSpent,
      totalRipsPurchased,
      totalRipsFromSellbacks: totalRipsFromSellbacks || totalRipsFromSellbacksTransactions,
      
      // ROI & Performance
      totalValuePulled: totalValuePulledCents,
      netProfitLoss,
      roiPercentage,
      averagePackValue,
      averageCardValue,
      packOpeningEfficiency,
      winRate,
      winningPacks,
      
      // Collection
      bestPull,
      topValuableCards,
      cardsSoldCount,
      cardsByGame,
      
      // Activity
      mostOpenedPack: mostOpenedPackName,
      openingStreak,
      avgPacksPerDay,
      avgPacksPerWeek,
    },
    balance: balance || 0,
    recentActivity: recentActivity.slice(0, 10),
  };
};

