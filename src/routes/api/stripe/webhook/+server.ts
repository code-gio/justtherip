import type { RequestHandler } from "./$types";
import { verifyWebhookSignature } from "$lib/server/stripe";
import {
  addRips,
  recordStripePayment,
  updateStripePaymentStatus,
} from "$lib/server/rips";
import { STRIPE_WEBHOOK_SECRET } from "$env/static/private";
import type Stripe from "stripe";

/**
 * Stripe Webhook Handler
 *
 * CRITICAL: This endpoint must be publicly accessible and NOT require authentication
 * It handles payment confirmation from Stripe
 */

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return new Response("No signature", { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = verifyWebhookSignature(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(
      "Webhook signature verification failed:",
      err instanceof Error ? err.message : err
    );
    return new Response("Invalid signature", { status: 400 });
  }

  console.log(`Received webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
};

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing checkout.session.completed:", session.id);

  const userId = session.metadata?.user_id;
  const bundleId = session.metadata?.bundle_id;
  const rips = parseInt(session.metadata?.rips || "0", 10);

  if (!userId || !bundleId || !rips) {
    console.error("Missing metadata in checkout session:", session.metadata);
    return;
  }

  // Record payment as pending
  await recordStripePayment({
    userId,
    stripePaymentIntentId: session.payment_intent as string,
    stripeCheckoutSessionId: session.id,
    bundleId,
    amountCents: session.amount_total || 0,
    ripsPurchased: rips,
    status: "pending",
    metadata: {
      customer_email: session.customer_email,
      customer_details: session.customer_details,
    },
  });

  console.log(
    `Recorded pending payment for user ${userId}: ${rips} Rips`
  );
}

/**
 * Handle successful payment - THIS IS WHERE WE CREDIT RIPS
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment_intent.succeeded:", paymentIntent.id);

  const userId = paymentIntent.metadata?.user_id;
  const bundleId = paymentIntent.metadata?.bundle_id;
  const rips = parseInt(paymentIntent.metadata?.rips || "0", 10);

  if (!userId || !bundleId || !rips) {
    console.error("Missing metadata in payment intent:", paymentIntent.metadata);
    return;
  }

  // Add Rips to user's account
  const result = await addRips(userId, rips, {
    stripe_payment_intent_id: paymentIntent.id,
    bundle_id: bundleId,
    amount_cents: paymentIntent.amount,
  });

  if (!result.success) {
    console.error(`Failed to add Rips for user ${userId}:`, result.error);
    // Don't return error - we'll handle it manually if needed
    // The payment succeeded in Stripe, so we must resolve this
    return;
  }

  // Update payment status to succeeded
  await updateStripePaymentStatus(paymentIntent.id, "succeeded");

  console.log(
    `✅ Successfully added ${rips} Rips to user ${userId}. New balance: ${result.balance}`
  );
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment_intent.payment_failed:", paymentIntent.id);

  // Update payment status to failed
  await updateStripePaymentStatus(paymentIntent.id, "failed");

  console.log(`❌ Payment failed: ${paymentIntent.id}`);
}

/**
 * Handle refunds - deduct Rips from user's account
 */
async function handleRefund(charge: Stripe.Charge) {
  console.log("Processing charge.refunded:", charge.id);

  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    console.error("No payment intent ID in refunded charge");
    return;
  }

  // Update payment status to refunded
  await updateStripePaymentStatus(paymentIntentId, "refunded");

  // TODO: Implement Rip deduction logic
  // This is complex because the user may have already spent the Rips
  // Options:
  // 1. Allow negative balance (with limits)
  // 2. Only refund if user has sufficient balance
  // 3. Manual admin review for refunds
  // 4. Ban user from future purchases if balance goes negative

  console.log(`⚠️ Refund processed for payment: ${paymentIntentId}`);
  console.log("Note: Manual review may be required to handle Rip balance");
}
