import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { stripe } from "$lib/server/stripe";
import { supabaseAdmin } from "$lib/server/rips";
import { PUBLIC_APP_URL } from "$env/static/public";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  try {
    // Check if user already has a Stripe customer ID
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching user profile:", fetchError);
      return {
        error: `Database error: ${fetchError.message}`,
      };
    }

    let customerId = userData?.stripe_customer_id;

    // If no customer exists, create one
    if (!customerId) {
      console.log("Creating new Stripe customer for user:", user.id);

      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;
      console.log("Created Stripe customer:", customerId);

      // Save customer ID to database (update existing profile)
      const { error: upsertError } = await supabaseAdmin
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
        })
        .eq("id", user.id);

      if (upsertError) {
        console.error("Error saving customer ID to database:", upsertError);
        return {
          error: `Failed to save customer: ${upsertError.message}`,
        };
      }

      console.log("Saved customer ID to database");
    } else {
      console.log("Using existing Stripe customer:", customerId);
    }

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${PUBLIC_APP_URL}/wallet`,
    });

    // Redirect to Stripe Customer Portal (outside try-catch)
    throw redirect(303, portalSession.url);
  } catch (error) {
    // If it's a redirect, let it through
    if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
      throw error;
    }

    // Log actual errors only
    console.error("Error creating billing portal session:", error);

    // For other errors, show error page
    return {
      error: error instanceof Error ? error.message : "Failed to access billing portal",
    };
  }
};
