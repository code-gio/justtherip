import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * Shipping Addresses API Endpoint
 *
 * GET /api/shipping-addresses
 * POST /api/shipping-addresses
 *
 * GET: Returns all shipping addresses for the authenticated user
 * POST: Creates a new shipping address
 */

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: addresses, error } = await adminClient
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shipping addresses:", error);
      return json(
        { error: "Failed to fetch shipping addresses" },
        { status: 500 }
      );
    }

    return json({
      addresses: addresses || [],
    });
  } catch (error) {
    console.error("Error fetching shipping addresses:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country = "US",
      is_default = false,
      label,
    } = body;

    // Validate required fields
    if (!name || !address_line1 || !city || !state || !postal_code) {
      return json(
        { error: "Missing required fields: name, address_line1, city, state, postal_code" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await adminClient
        .from("shipping_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true);
    }

    // Create address
    const { data: address, error } = await adminClient
      .from("shipping_addresses")
      .insert({
        user_id: user.id,
        name,
        phone: phone || null,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        postal_code,
        country,
        is_default,
        label: label || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating shipping address:", error);
      return json(
        { error: "Failed to create shipping address" },
        { status: 500 }
      );
    }

    return json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Error creating shipping address:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};

