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

    const { email, password, firstName, lastName } = form.data;

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

      return {
        form,
        success: true,
        message: "Please check your email to verify your account",
      };
    } catch (error) {
      console.error("Signup error:", error);
      return handleUnexpectedError(form, error);
    }
  },
};

function handleAuthError(form: any, error: AuthError): AuthResult {
  console.error("Auth error:", error);
  let errorType: AuthErrorType = "SERVER_ERROR";

  const errorMessages: Record<
    string,
    { field: keyof typeof form.data; message: string }
  > = {
    "Invalid login credentials": {
      field: "password",
      message: "Invalid credentials",
    },
    "Email already registered": {
      field: "email",
      message: "This email is already registered",
    },
    "Signup disabled": {
      field: "email",
      message: "Signups are currently disabled",
    },
    "Invalid email": {
      field: "email",
      message: "Please enter a valid email address",
    },
  };

  const errorInfo = errorMessages[error.message] || {
    field: "email",
    message: "An error occurred during signup",
  };

  return {
    success: false,
    type: errorType,
    message: errorInfo.message,
  };
}

function handleUnexpectedError(form: any, error: any): AuthResult {
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
