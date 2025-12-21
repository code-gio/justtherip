import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createCheckoutSession } from "$lib/server/stripe";
import { getRipBundle } from "$lib/server/rips";
import { z } from "zod";

const checkoutSchema = z.object({
  bundle_id: z.string().uuid("Invalid bundle ID"),
});

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    const {
      user,
      session: authSession,
    } = await locals.safeGetSession();

    if (!authSession || !user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return json(
        {
          error: "Invalid request",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { bundle_id } = validation.data;

    // Get bundle details
    const bundle = await getRipBundle(bundle_id);

    if (!bundle || !bundle.is_active) {
      return json({ error: "Bundle not found or inactive" }, { status: 404 });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await createCheckoutSession({
      bundleId: bundle.id,
      bundleName: bundle.name,
      rips: bundle.rips,
      priceCents: bundle.price_cents,
      userId: user.id,
      userEmail: user.email!,
    });

    return json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
