import type { PageServerLoad, Actions } from "./$types.js";
import { superValidate, setError, fail } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { signUpSchema } from "$lib/schemas/sign-up.js";
import { AuthError } from "@supabase/supabase-js";
import {
  AuthErrorMessages,
  type AuthErrorType,
  type AuthResult,
} from "$lib/types/auth.js";
import { handleAuthError, handleUnexpectedError } from "$lib/utils/auth-errors";
import { supabaseAdmin } from "$lib/server/rips.js";

const AUTH_FORM_ID = "sign-up-form";

export const load: PageServerLoad = async () => {
  return {
    form: await superValidate(zod4(signUpSchema), {
      id: AUTH_FORM_ID,
    }),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const {
      locals: { supabase, safeGetSession },
    } = event;
    const form = await superValidate(event, zod4(signUpSchema), {
      id: AUTH_FORM_ID,
    });

    if (!form.valid) {
      return fail(400, {
        form,
        message: "Please check your input",
      });
    }

    const { email, password, firstName, lastName, username } = form.data;

    try {
      // Check if session exists
      const session = await safeGetSession();
      if (session && session.user) {
        return fail(400, {
          form,
          message: "You are already logged in",
        });
      }

      // Attempt to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${event.url.origin}/auth/callback`,
        },
      });

      if (authError) {
        const result = handleAuthError(form, authError);
        return fail(authError?.status || 500, {
          ...result,
          form,
        });
      }

      // Check for existing user
      if (!authError && authData.user && !authData.user.identities?.length) {
        return setError(
          form,
          "email",
          "An account with this email already exists"
        );
      }

      if (!authData.user) {
        return fail(500, {
          form,
          message: "Failed to create user account",
        });
      }

      // Create profile with username using admin client to bypass RLS
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: authData.user.id,
        username,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail the signup if profile creation fails - user can update it later
        // But log it for debugging
      }

      return {
        form,
        success: true,
        message: "Please check your email to verify your account",
      };
    } catch (error) {
      console.error("Signup error:", error);
      const result = handleUnexpectedError(form, error);
      return fail(500, {
        form,
        type: result.type,
        message: result.message,
      });
    }
  },
};

