<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { forgotPasswordSchema, type ForgotPasswordSchema } from '$lib/schemas/forgot-password';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { IconMail, IconLoader2, IconArrowLeft } from '@tabler/icons-svelte';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Alert from '$lib/components/ui/alert';

	let { data }: { data: SuperValidated<Infer<ForgotPasswordSchema>> } = $props();

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

	function formatTimer(seconds: number): string {
		return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
	}

	const form = superForm(() => data, {
		validators: zodClient(forgotPasswordSchema),
		clearOnSubmit: 'errors-and-message',
		resetForm: false,
		onSubmit: () => {
			isSubmitting = true;
		},
		onResult: async ({ result }) => {
			isSubmitting = false;

			if (result.type === 'failure') {
				emailSent = false;
				toast.error(result.data?.message || 'Failed to send reset email', {
					description: 'Please check your email address and try again.',
					duration: 5000
				});
				return;
			}

			if (result.type === 'success') {
				startResendTimer();
				toast.success('Reset email sent!', {
					description: 'Please check your email for the password reset link.',
					duration: 5000
				});
			}
		}
	});

	const { form: formData, enhance, errors } = form;
</script>

<div class="space-y-6">


	{#if emailSent}
		<Alert.Root>
			<IconMail size={16} />
			<Alert.Title>Check your email</Alert.Title>
			<Alert.Description>
				We've sent a password reset link to <strong>{$formData.email}</strong>
				{#if !canResend}
					<br />
					You can request another link in {formatTimer(resendTimer)}
				{/if}
			</Alert.Description>
		</Alert.Root>
	{/if}

	<form
		method="POST"
		use:enhance
		class="space-y-4"
		aria-label="Password reset form"
		novalidate
	>
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
						required
						disabled={isSubmitting}
						class="transition-all duration-200"
						aria-invalid={$errors.email ? 'true' : undefined}
						aria-describedby={$errors.email ? 'email-error' : undefined}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors
				class="text-sm text-destructive mt-1"
				id="email-error"
				role="alert"
			/>
		</Form.Field>

		<div class="space-y-2">
			<Form.Button
				class="w-full"
				disabled={isSubmitting || (emailSent && !canResend)}
				data-state={isSubmitting ? 'submitting' : undefined}
			>
				{#if isSubmitting}
					<IconLoader2 size={16} class="mr-2 animate-spin" />
					Sending reset link...
				{:else if emailSent && canResend}
					Send another link
				{:else if emailSent}
					Wait to resend
				{:else}
					Send reset link
				{/if}
			</Form.Button>
			{#if emailSent}
			<Button
				variant="outline"
				class="w-full"
				href="/sign-in"
			>
				<IconArrowLeft size={16} class="mr-2" />
				Back to sign in
			</Button>
			{/if}
		</div>
	</form>

	{#if !emailSent}
		<div class="text-center text-sm">
			<p class="text-muted-foreground">
				Remember your password?
				<Button variant="link" href="/sign-in" class="px-1 py-0 h-auto font-medium">
					Sign in
				</Button>
			</p>
		</div>
	{/if}
</div>