import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} from "$env/static/public";
import { SUPABASE_SERVICE_ROLE_KEY } from "$env/static/private";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

/**
 * Service role client for privileged operations
 * ONLY use this for server-side operations that require bypassing RLS
 */
export const supabaseAdmin = createClient(
  PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Export alias for convenience
export const adminClient = supabaseAdmin;

/**
 * Get user's Rip balance
 */
export async function getUserRipBalance(
  userId: string
): Promise<number | null> {
  const { data, error } = await supabaseAdmin.rpc("get_user_rip_balance", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error getting Rip balance:", error);
    return null;
  }

  return data;
}

/**
 * Add Rips to user's account (after successful payment)
 */
export async function addRips(
  userId: string,
  amount: number,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; balance?: number; error?: string }> {
  const { data, error } = await supabaseAdmin.rpc("add_rips", {
    p_user_id: userId,
    p_amount: amount,
    p_metadata: metadata,
  });

  if (error) {
    console.error("Error adding Rips:", error);
    return { success: false, error: error.message };
  }

  return {
    success: data.success,
    balance: data.balance,
  };
}

/**
 * Spend Rips (for pack opening)
 */
export async function spendRips(
  userId: string,
  amount: number,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; balance?: number; error?: string }> {
  const { data, error } = await supabaseAdmin.rpc("spend_rips", {
    p_user_id: userId,
    p_amount: amount,
    p_metadata: metadata,
  });

  if (error) {
    console.error("Error spending Rips:", error);
    return { success: false, error: error.message };
  }

  if (!data.success) {
    return { success: false, error: data.error };
  }

  return {
    success: data.success,
    balance: data.balance,
  };
}

/**
 * Record a Stripe payment in database
 */
export async function recordStripePayment({
  userId,
  stripePaymentIntentId,
  stripeCheckoutSessionId,
  bundleId,
  amountCents,
  ripsPurchased,
  status,
  metadata,
}: {
  userId: string;
  stripePaymentIntentId: string;
  stripeCheckoutSessionId?: string;
  bundleId: string;
  amountCents: number;
  ripsPurchased: number;
  status: "pending" | "succeeded" | "failed" | "refunded";
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from("stripe_payments").insert({
    user_id: userId,
    stripe_payment_intent_id: stripePaymentIntentId,
    stripe_checkout_session_id: stripeCheckoutSessionId,
    bundle_id: bundleId,
    amount_cents: amountCents,
    rips_purchased: ripsPurchased,
    status,
    metadata: metadata || {},
  });

  if (error) {
    console.error("Error recording Stripe payment:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update Stripe payment status
 */
export async function updateStripePaymentStatus(
  paymentIntentId: string,
  status: "pending" | "succeeded" | "failed" | "refunded"
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from("stripe_payments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all active Rip bundles
 */
export async function getRipBundles() {
  const { data, error } = await supabaseAdmin
    .from("rip_bundles")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching bundles:", error);
    return null;
  }

  return data;
}

/**
 * Get a specific bundle
 */
export async function getRipBundle(bundleId: string) {
  const { data, error } = await supabaseAdmin
    .from("rip_bundles")
    .select("*")
    .eq("id", bundleId)
    .single();

  if (error) {
    console.error("Error fetching bundle:", error);
    return null;
  }

  return data;
}

/**
 * Get card tiers for pack opening
 * @deprecated Tier system has been removed. This function is no longer used.
 */
export async function getCardTiers() {
  // Tier system removed - this function is deprecated
  console.warn("getCardTiers() is deprecated - tier system has been removed");
  return null;
}

/**
 * Get system config value
 */
export async function getSystemConfig(key: string): Promise<any | null> {
  const { data, error } = await supabaseAdmin
    .from("system_config")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    console.error("Error fetching system config:", error);
    return null;
  }

  return data?.value;
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 50
) {
  const { data, error } = await supabaseAdmin
    .from("rip_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return null;
  }

  return data;
}
