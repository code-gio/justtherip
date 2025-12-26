import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "$env/static/private";
import { PUBLIC_APP_URL } from "$env/static/public";

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

/**
 * Create a Stripe Checkout Session for purchasing Rips
 */
export async function createCheckoutSession({
  bundleId,
  bundleName,
  rips,
  priceCents,
  userId,
  userEmail,
  customerId,
}: {
  bundleId: string;
  bundleName: string;
  rips: number;
  priceCents: number;
  userId: string;
  userEmail: string;
  customerId?: string;
}): Promise<Stripe.Checkout.Session> {
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    // Use existing customer or create new one
    ...(customerId ? { customer: customerId } : { customer_email: userEmail }),
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: bundleName,
            description: `${rips} Rips - Use to open card packs!`,
            images: [`${PUBLIC_APP_URL}/rip-icon.png`], // Add your icon
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${PUBLIC_APP_URL}/wallet/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${PUBLIC_APP_URL}/wallet?canceled=true`,
    metadata: {
      bundle_id: bundleId,
      user_id: userId,
      rips: rips.toString(),
    },
    payment_intent_data: {
      metadata: {
        bundle_id: bundleId,
        user_id: userId,
        rips: rips.toString(),
      },
    },
  };

  return await stripe.checkout.sessions.create(sessionConfig);
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Create a Stripe Customer (optional, for recurring)
 */
export async function createStripeCustomer({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name?: string;
}): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId,
    },
  });
}

/**
 * Retrieve a Checkout Session
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Create a refund (for admin purposes)
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount, // Optional: partial refund
  });
}
