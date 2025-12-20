import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  try {
    const { password } = await event.request.json();
    const {
      locals: { supabase },
    } = event;

    if (!password) {
      return new Response("Password is required", { status: 400 });
    }

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Reset error:", error);
      return new Response(error.message, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in reset password:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
