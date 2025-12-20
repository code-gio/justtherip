// src/routes/sign-in/+page.server.ts
import { signInSchema } from "$lib/schemas/sign-in.js";
import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types.js";
import { superValidate, setError, fail } from "sveltekit-superforms";
import { AuthError } from "@supabase/supabase-js";
import {
  AuthErrorMessages,
  type AuthErrorType,
  type AuthResult,
} from "$lib/types/auth";
import { zod4 } from "sveltekit-superforms/adapters";
import { handleAuthError } from "$lib/utils/auth-errors";
import { RateLimiter, RateLimitPresets } from "$lib/utils/rate-limit";

const AUTH_FORM_ID = "sign-in-form";

// Initialize rate limiter
const rateLimiter = new RateLimiter(RateLimitPresets.signIn);

export const load: PageServerLoad = async () => {
  const form = await superValidate(zod4(signInSchema), {
    id: AUTH_FORM_ID,
  });

  return { form };
};

export const actions: Actions = {
  default: async (event: RequestEvent) => {
    const {
      locals: { supabase, safeGetSession },
      getClientAddress,
    } = event;

    const clientIp = getClientAddress();

    // Clean up expired rate limit entries
    rateLimiter.cleanup();

    // Check rate limiting
    const rateLimitResult = rateLimiter.check(clientIp);
    if (!rateLimitResult.allowed) {
      return fail(429, {
        form: await superValidate(event, zod4(signInSchema), {
          id: AUTH_FORM_ID,
        }),
        type: "RATE_LIMITED" as AuthErrorType,
        message: rateLimitResult.message,
      });
    }

    const form = await superValidate(event, zod4(signInSchema), {
      id: AUTH_FORM_ID,
    });

    if (!form.valid) {
      return fail(400, {
        form,
        type: "INVALID_EMAIL",
        message: "Please check your input and try again",
      });
    }

    const { email, password } = form.data;

    try {
      const session = await safeGetSession();
      if (session?.user) {
        return fail(400, {
          form,
          type: "ALREADY_LOGGED_IN",
          message: AuthErrorMessages.ALREADY_LOGGED_IN,
        });
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        rateLimiter.recordAttempt(clientIp);
        return handleAuthError(form, authError);
      }

      // Clear rate limit on successful login
      rateLimiter.clear(clientIp);

      return {
        form,
        success: true,
        type: "success",
        message: "Successfully signed in",
        data,
      };
    } catch (error) {
      console.error("Unexpected error during authentication:", error);
      return fail(500, {
        form,
        type: "SERVER_ERROR",
        message: AuthErrorMessages.SERVER_ERROR,
      });
    }
  },
};
