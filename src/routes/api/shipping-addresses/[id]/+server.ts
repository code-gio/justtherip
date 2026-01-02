import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * Shipping Address API Endpoint
 *
 * PUT /api/shipping-addresses/[id]
 * DELETE /api/shipping-addresses/[id]
 *
 * PUT: Updates a shipping address
 * DELETE: Deletes a shipping address
 */

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const addressId = params.id;

    // Verify address belongs to user
    const { data: existingAddress, error: fetchError } = await adminClient
      .from("shipping_addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingAddress) {
      return json(
        { error: "Shipping address not found" },
        { status: 404 }
      );
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
      country,
      is_default,
      label,
    } = body;

    // If setting as default, unset other defaults
    if (is_default && !existingAddress.is_default) {
      await adminClient
        .from("shipping_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true)
        .neq("id", addressId);
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address_line1 !== undefined) updateData.address_line1 = address_line1;
    if (address_line2 !== undefined) updateData.address_line2 = address_line2 || null;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (country !== undefined) updateData.country = country;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (label !== undefined) updateData.label = label || null;

    // Update address
    const { data: address, error } = await adminClient
      .from("shipping_addresses")
      .update(updateData)
      .eq("id", addressId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating shipping address:", error);
      return json(
        { error: "Failed to update shipping address" },
        { status: 500 }
      );
    }

    return json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Error updating shipping address:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const addressId = params.id;

    // Verify address belongs to user
    const { data: existingAddress, error: fetchError } = await adminClient
      .from("shipping_addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingAddress) {
      return json(
        { error: "Shipping address not found" },
        { status: 404 }
      );
    }

    // Delete address
    const { error } = await adminClient
      .from("shipping_addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting shipping address:", error);
      return json(
        { error: "Failed to delete shipping address" },
        { status: 500 }
      );
    }

    return json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting shipping address:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};

