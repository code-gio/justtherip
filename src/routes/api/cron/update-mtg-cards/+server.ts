import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { updateMtgCards } from "$lib/server/update-mtg-cards";

/**
 * Cron endpoint for updating MTG cards from Scryfall
 * 
 * This endpoint can be called by external cron services (e.g., Vercel Cron, GitHub Actions)
 * to periodically update the MTG cards database.
 * 
 * TODO: Add authentication/authorization (API key, secret token, etc.)
 */
export const GET: RequestHandler = async ({ request }) => {
  try {
    const result = await updateMtgCards();

    if (!result.success) {
      return json(
        {
          success: false,
          error: result.error,
          message: result.message,
        },
        { status: 500 }
      );
    }

    return json({
      success: true,
      message: result.message,
      data: {
        downloadUri: result.defaultCardsData?.download_uri,
        updatedAt: result.defaultCardsData?.updated_at,
        size: result.defaultCardsData?.size,
        contentType: result.defaultCardsData?.content_type,
        cardsDataFetched: result.cardsDataFetched,
        cardsCount: result.cardsCount,
        cardsProcessed: result.cardsProcessed,
        batchesProcessed: result.batchesProcessed,
        newCards: result.newCards,
        updatedCards: result.updatedCards,
        errorCards: result.errorCards,
      },
    });
  } catch (error) {
    console.error("Error in update-mtg-cards cron endpoint:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  return GET({ request } as any);
};

