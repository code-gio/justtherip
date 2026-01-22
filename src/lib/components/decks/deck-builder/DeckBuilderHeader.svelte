<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconArrowLeft } from '@tabler/icons-svelte';

	interface Props {
		deckName: string;
		totalCards: number;
	}

	let { deckName, totalCards }: Props = $props();
</script>

<div class="mb-6">
	<div class="flex items-center gap-4 mb-4">
		<Button variant="ghost" size="icon" onclick={() => goto('/decks')}>
			<IconArrowLeft class="h-5 w-5" />
		</Button>
		<div class="flex-1">
			<h1 class="text-3xl font-bold">{deckName}</h1>
			<p class="text-sm text-muted-foreground mt-1">
				{totalCards} card{totalCards !== 1 ? 's' : ''} total
			</p>
		</div>
	</div>
</div>
