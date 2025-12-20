<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { signUpSchema, type SignUpSchema } from '$lib/schemas/sign-up';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import  {Progress} from '$lib/components/ui/progress';
	import Checkbox from '../ui/checkbox/checkbox.svelte';
	import Button from '../ui/button/button.svelte';
	import { IconEye, IconEyeOff, IconCircleCheck, IconCircleX } from '@tabler/icons-svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	const { data }: { data: SuperValidated<Infer<SignUpSchema>> } = $props();

	let showPassword = $state(false);
	let isSubmitting = $state(false);
	let passwordFocused = $state(false);

	// Password requirements and strength calculation
	const passwordRequirements = [
		{ label: 'At least 8 characters', test: (p: string) => p?.length >= 8, weight: 1 },
		{ label: 'Contains a number', test: (p: string) => p && /\d/.test(p), weight: 1 },
		{ label: 'Contains a special character', test: (p: string) => p && /[!@#$%^&*]/.test(p), weight: 2 },
		{ label: 'Contains uppercase letter', test: (p: string) => p && /[A-Z]/.test(p), weight: 1 },
		{ label: 'Contains lowercase letter', test: (p: string) => p && /[a-z]/.test(p), weight: 1 }
	];

	// Additional strength checks
	const additionalStrengthChecks = [
		{ test: (p: string) => p?.length >= 12, weight: 2 }, // Bonus for longer passwords
		{ test: (p: string) => p && /^(?!.*(.)\1{2,}).*$/.test(p), weight: 1 }, // No repeating characters
		{ test: (p: string) => p && /[!@#$%^&*]{2,}/.test(p), weight: 1 }, // Multiple special characters
		{ test: (p: string) => p && /\d{2,}/.test(p), weight: 1 }, // Multiple numbers
		{ test: (p: string) => p && /[A-Z]{2,}/.test(p), weight: 1 } // Multiple uppercase letters
	];

	function calculatePasswordStrength(password: string | undefined): {
		score: number;
		label: string;
		color: string;
	} {
		if (!password) {
			return { score: 0, label: 'Too Weak', color: 'bg-gray-200' };
		}

		let totalWeight = 0;
		let score = 0;

		// Calculate basic requirements score
		for (const req of passwordRequirements) {
			totalWeight += req.weight;
			if (req.test(password)) {
				score += req.weight;
			}
		}

		// Add bonus points for additional strength
		for (const check of additionalStrengthChecks) {
			totalWeight += check.weight;
			if (check.test(password)) {
				score += check.weight;
			}
		}

		// Calculate percentage
		const percentage = (score / totalWeight) * 100;

		// Determine strength label and color
		if (percentage < 40) {
			return { score: percentage, label: 'Too Weak', color: 'bg-red-500' };
		} else if (percentage < 60) {
			return { score: percentage, label: 'Moderate', color: 'bg-yellow-500' };
		} else if (percentage < 80) {
			return { score: percentage, label: 'Strong', color: 'bg-blue-500' };
		} else {
			return { score: percentage, label: 'Very Strong', color: 'bg-green-500' };
		}
	}

	const form = superForm(data, {
		validators: zodClient(signUpSchema),
		onSubmit: () => {
			isSubmitting = true;
		},
		onResult: async ({ result }) => {
			isSubmitting = false;

			if (result.type === 'failure') {
				toast.error(result.data?.message || 'Sign up failed', {
					description: 'Please check your input and try again.'
				});
				return;
			}

			if (result.type === 'success') {
				toast.success('Account created successfully', {
					description: 'Please check your email to verify your account.'
				});
				await goto('/verify-email?email=' + result.data?.form?.data?.email);
			}
		}
	});

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	const { form: formData, enhance, errors } = form;


	$effect(() => {
		if (isSubmitting) {
			showPassword = false;
		}
	});

	// Reactive password strength with null check
	let strength = $derived(calculatePasswordStrength($formData?.password));
</script>

<form
	method="POST"
	use:enhance
	class="space-y-3"
	aria-label="Sign up form"
	novalidate
>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<Form.Field {form} name="firstName">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label for="firstName">First Name</Form.Label>
					<Input
						{...props}
						id="firstName"
						bind:value={$formData.firstName}
						placeholder="John"
						autocomplete="given-name"
						required
						class="transition-all duration-200"
						aria-invalid={$errors.firstName ? 'true' : undefined}
						aria-describedby={$errors.firstName ? 'firstName-error' : undefined}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors
				class="text-sm text-red-500 mt-1"
				id="firstName-error"
				role="alert"
			/>
		</Form.Field>

		<Form.Field {form} name="lastName">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label for="lastName">Last Name</Form.Label>
					<Input
						{...props}
						id="lastName"
						bind:value={$formData.lastName}
						placeholder="Smith"
						autocomplete="family-name"
						required
						class="transition-all duration-200"
						aria-invalid={$errors.lastName ? 'true' : undefined}
						aria-describedby={$errors.lastName ? 'lastName-error' : undefined}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors
				class="text-sm text-red-500 mt-1"
				id="lastName-error"
				role="alert"
			/>
		</Form.Field>
	</div>

	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label for="email">Email</Form.Label>
				<Input
					{...props}
					id="email"
					type="email"
					bind:value={$formData.email}
					placeholder="you@email.com"
					autocomplete="email"
					required
					class="transition-all duration-200"
					aria-invalid={$errors.email ? 'true' : undefined}
					aria-describedby={$errors.email ? 'email-error' : undefined}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors
			class="text-sm text-red-500 mt-1"
			id="email-error"
			role="alert"
		/>
	</Form.Field>

	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label for="password">Password</Form.Label>
				<div class="space-y-2">
					<div class="relative">
						<Input
							{...props}
							id="password"
							bind:value={$formData.password}
							type={showPassword ? 'text' : 'password'}
							placeholder="Create a strong password"
							autocomplete="new-password"
							required
							onfocus={() => (passwordFocused = true)}
							onblur={() => (passwordFocused = false)}
							class="pr-10 transition-all duration-200"
							aria-invalid={$errors.password ? 'true' : undefined}
							aria-describedby="password-strength password-requirements password-error"
						/>
						<Button
							size="icon"
							variant="ghost"
							class="absolute right-3 top-1/2 -translate-y-1/2"
							onclick={togglePasswordVisibility}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{#if showPassword}
								<IconEyeOff size={16} />
							{:else}
								<IconEye size={16} />
							{/if}
						</Button>
					</div>

					{#if $formData?.password}
						<div
							class="space-y-1"
							id="password-strength"
							role="region"
							aria-label="Password strength indicator"
						>
							<div class="flex justify-between text-sm">
								<span>Password Strength:</span>
								<span
									class:text-red-500={strength.label === 'Too Weak'}
									class:text-yellow-500={strength.label === 'Moderate'}
									class:text-blue-500={strength.label === 'Strong'}
									class:text-green-500={strength.label === 'Very Strong'}
								>
									{strength.label}
								</span>
							</div>
							
								<Progress value={strength.score} max={100}
									class="h-full w-full flex-1 transition-all duration-300 {strength.color}"
									style="transform: translateX(-{100 - strength.score}%)"
								/>
						</div>
					{/if}
				</div>
			{/snippet}
		</Form.Control>
	

		{#if passwordFocused && $formData?.password}
			<div
				class="mt-2 space-y-2 text-sm"
				id="password-requirements"
				role="region"
				aria-label="Password requirements"
			>
				{#each passwordRequirements as requirement}
					{@const passes = requirement.test($formData?.password || '')}
					<div
						class="flex items-center gap-2"
						class:text-green-600={passes}
						class:text-gray-500={!passes}
					>
						{#if passes}
							<IconCircleCheck size={16} />
						{:else}
							<IconCircleX size={16} />
						{/if}
						{requirement.label}
					</div>
				{/each}
			</div>
		{/if}
	</Form.Field>

	<Form.Field {form} name="agreeToTerms">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center gap-2">
					<Checkbox
						{...props}
						id="terms"
						bind:checked={$formData.agreeToTerms}
						aria-invalid={$errors.agreeToTerms ? 'true' : undefined}
						aria-describedby={$errors.agreeToTerms ? 'terms-error' : undefined}
					/>
					<Form.Label for="terms" class="text-sm">
						I accept the
						<Button
							variant="link"
							href="/terms-and-conditions"
							class="px-1 py-0 h-auto font-medium"
						>
							Terms and Conditions
						</Button>
					</Form.Label>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors
			class="text-sm text-red-500 mt-1"
			id="terms-error"
			role="alert"
		/>
	</Form.Field>

	<Form.Button class="w-full" disabled={isSubmitting}>
		{#if isSubmitting}
			Creating account...
		{:else}
			Create Account
		{/if}
	</Form.Button>
</form>