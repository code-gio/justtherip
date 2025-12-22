import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getCheckoutSession } from "$lib/server/stripe";
import { addRips, supabaseAdmin } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals, url }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return {
      error: "No session ID provided",
    };
  }

  try {
    // Retrieve the Stripe checkout session
    const checkoutSession = await getCheckoutSession(sessionId);

    if (!checkoutSession) {
      return {
        error: "Session not found",
      };
    }

    // Check if payment was successful
    if (checkoutSession.payment_status === "paid") {
      const userId = checkoutSession.metadata?.user_id;
      const bundleId = checkoutSession.metadata?.bundle_id;
      const rips = parseInt(checkoutSession.metadata?.rips || "0", 10);

      if (userId && bundleId && rips) {
        // Check if this checkout session was already processed
        const { data: existingTransaction } = await supabaseAdmin
          .from("rip_transactions")
          .select("id")
          .eq("user_id", userId)
          .contains("metadata", { stripe_checkout_session_id: sessionId })
          .maybeSingle();

        if (existingTransaction) {
          console.log(
            `ℹ️ Checkout ${sessionId} already processed (duplicate prevention)`
          );
          return {
            success: true,
            alreadyProcessed: true,
            sessionId,
          };
        }

        // Add Rips to user's account (in case webhook hasn't fired yet)
        // For local development, this acts as webhook backup
        const result = await addRips(userId, rips, {
          stripe_checkout_session_id: sessionId,
          bundle_id: bundleId,
          amount_cents: checkoutSession.amount_total || 0,
          note: "Added via success page (local dev - webhook backup)",
        });

        if (result.success) {
          console.log(
            `✅ Added ${rips} Rips via success page for user ${userId}`
          );
          return {
            success: true,
            rips,
            balance: result.balance,
          };
        } else {
          console.error("Failed to add Rips:", result.error);
          return {
            error: "Failed to credit Rips",
          };
        }
      }
    }

    return {
      success: true,
      sessionId,
    };
  } catch (error) {
    console.error("Error processing success page:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
