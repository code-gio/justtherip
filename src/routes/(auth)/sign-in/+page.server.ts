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

const AUTH_FORM_ID = "sign-in-form";
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Store failed attempts in memory (consider using Redis in production)
const failedAttempts = new Map<string, { count: number; timestamp: number }>();

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

    // Check rate limiting
    const clientIp = getClientAddress();
    if (await isRateLimited(clientIp)) {
      return fail(429, {
        form: await superValidate(event, zod4(signInSchema), {
          id: AUTH_FORM_ID,
        }),
        type: "RATE_LIMITED" as AuthErrorType,
        message: AuthErrorMessages.RATE_LIMITED,
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
        await recordFailedAttempt(clientIp);
        const result = handleAuthError(form, authError);
        return fail(authError?.status || 500, {
          ...result,
          form,
        });
      }

      // Clear failed attempts on successful login
      failedAttempts.delete(clientIp);

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

async function isRateLimited(clientIp: string): Promise<boolean> {
  const attempt = failedAttempts.get(clientIp);
  if (!attempt) return false;

  const timeSinceFirstAttempt = Date.now() - attempt.timestamp;
  if (timeSinceFirstAttempt > RATE_LIMIT_WINDOW) {
    failedAttempts.delete(clientIp);
    return false;
  }

  return attempt.count >= MAX_ATTEMPTS;
}

async function recordFailedAttempt(clientIp: string): Promise<void> {
  const attempt = failedAttempts.get(clientIp);
  if (!attempt) {
    failedAttempts.set(clientIp, { count: 1, timestamp: Date.now() });
    return;
  }

  attempt.count += 1;
}

function handleAuthError(form: any, error: AuthError): AuthResult {
  let errorType: AuthErrorType = "SERVER_ERROR";
  let field = "password";

  switch (error.message) {
    case "Invalid login credentials":
      errorType = "INVALID_CREDENTIALS";
      field = "password";
      break;
    case "Email not confirmed":
      errorType = "EMAIL_NOT_CONFIRMED";
      field = "email";
      break;
    // Add more cases as needed
  }

  setError(form, field, AuthErrorMessages[errorType]);

  return {
    success: false,
    type: errorType,
    message: AuthErrorMessages[errorType],
  };
}
