<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import {
    magicLinkSchema,
    type MagicLinkSchema,
  } from "$lib/schemas/magic-link";
  import { toast } from "svelte-sonner";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { IconMail, IconLoader2 } from "@tabler/icons-svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  let { data }: { data: SuperValidated<Infer<MagicLinkSchema>> } = $props();

  let isSubmitting = $state(false);
  let emailSent = $state(false);
  let resendTimer = $state(0);
  let canResend = $state(true);

  function startResendTimer() {
    emailSent = true;
    canResend = false;
    resendTimer = 60;

    const timer = setInterval(() => {
      resendTimer--;
      if (resendTimer <= 0) {
        clearInterval(timer);
        canResend = true;
      }
    }, 1000);
  }

  const form = superForm(data, {
    validators: zod4Client(magicLinkSchema),
    clearOnSubmit: "errors-and-message",
    resetForm: false,
    onSubmit: () => {
      isSubmitting = true;
    },
    onResult: async ({ result }) => {
      isSubmitting = false;

      if (result.type === "failure") {
        emailSent = false;
        toast.error(result.data?.message || "An error occurred", {
          description: "Please check your email address and try again.",
          duration: 5000,
        });
        return;
      }

      if (result.type === "success") {
        startResendTimer();
        toast.success("Magic link sent!", {
          description: "Please check your email for the sign-in link.",
          duration: 5000,
        });
      }
    },
  });

  const { form: formData, enhance, errors } = form;

  function formatTimer(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  }
</script>

<form
  method="POST"
  use:enhance
  class="space-y-6"
  aria-label="Magic link sign in form"
  novalidate
>
  {#if emailSent}
    <div
      class="rounded-lg bg-muted p-4 text-center space-y-3"
      role="status"
      aria-live="polite"
    >
      <div
        class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <IconMail size={24} class="text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-medium">Check your email</h3>
        <p class="text-sm text-muted-foreground">
          We've sent a magic link to <strong class="text-normal"
            >{$formData.email}</strong
          >
        </p>
      </div>
    </div>
  {/if}

  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for="email">Email address</Form.Label>
        <Input
          {...props}
          id="email"
          type="email"
          bind:value={$formData.email}
          placeholder="you@example.com"
          autocomplete="email"
          disabled={isSubmitting}
          required
          class="transition-all duration-200"
          aria-invalid={$errors.email ? "true" : undefined}
          aria-describedby={$errors.email ? "email-error" : undefined}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors
      class="text-sm text-destructive mt-1"
      id="email-error"
      role="alert"
    />
    {#if emailSent}
      <p class="text-xs text-muted-foreground mt-2">
        Didn't receive the email? You can request another link
        {#if !canResend}
          in {formatTimer(resendTimer)}
        {/if}
      </p>
    {/if}
  </Form.Field>

  <Form.Button
    class="w-full text-white"
    disabled={isSubmitting || (emailSent && !canResend)}
    data-state={isSubmitting ? "submitting" : undefined}
  >
    {#if isSubmitting}
      <IconLoader2 size={16} class="mr-2 animate-spin" />
      Sending magic link...
    {:else if emailSent && canResend}
      Send another link
    {:else if emailSent}
      Wait to resend
    {:else}
      Send magic link
    {/if}
  </Form.Button>

  <div class="text-center text-sm text-muted-foreground">
    <p>
      By continuing, you agree to our
      <Button variant="link" href="/terms" class="px-1 py-0 h-auto font-medium">
        Terms of Service
      </Button>
      and
      <Button
        variant="link"
        href="/privacy"
        class="px-1 py-0 h-auto font-medium"
      >
        Privacy Policy
      </Button>
    </p>
  </div>
</form>
