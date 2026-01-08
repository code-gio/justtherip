<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	let { status, error } = $props<{ status: number; error: App.Error }>();

	let message = $derived(error?.message || 'An unexpected error occurred');
	let errorTitle = $derived(status === 404 ? 'Page Not Found' : `Error ${status}`);
	let errorDescription = $derived(
		status === 404
			? "The page you're looking for doesn't exist."
			: status === 500
				? 'Something went wrong on our end.'
				: status === 403
					? "You don't have permission to access this page."
					: message
	);
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<div class="mb-4 text-6xl font-bold text-muted-foreground">{status}</div>
			<Card.Title class="text-2xl">{errorTitle}</Card.Title>
			<Card.Description class="text-base">{errorDescription}</Card.Description>
		</Card.Header>
		<Card.Footer class="flex justify-center">
			<Button href="/" variant="default">Go Home</Button>
		</Card.Footer>
	</Card.Root>
</div>
