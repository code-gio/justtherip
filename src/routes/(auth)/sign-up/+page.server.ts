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

    // Validate username after transformation (already lowercased and trimmed by schema)
    if (!username || username.length < 3 || username.length > 30) {
      return setError(
        form,
        "username",
        "Username must be between 3 and 30 characters"
      );
    }

    // Ensure username matches database constraint pattern
    // Database constraint likely requires: alphanumeric, underscore, hyphen, and possibly must start with letter
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return setError(
        form,
        "username",
        "Username can only contain letters, numbers, underscores, and hyphens"
      );
    }

    // Many database constraints require username to start with a letter
    if (!/^[a-zA-Z]/.test(username)) {
      return setError(
        form,
        "username",
        "Username must start with a letter"
      );
    }

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
        
        // Check if it's a username constraint violation
        if (profileError.message?.includes("profiles_username_check1") || 
            profileError.message?.includes("username")) {
          return setError(
            form,
            "username",
            "Username is invalid. Please choose a different username."
          );
        }
        
        // For other profile errors, still fail but with a generic message
        return fail(500, {
          form,
          message: "Account created but profile setup failed. Please try updating your profile later.",
        });
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

