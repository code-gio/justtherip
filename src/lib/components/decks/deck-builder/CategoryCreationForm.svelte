<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { IconCheck, IconX } from '@tabler/icons-svelte';

	interface Props {
		newCategoryName?: string;
		onSave: () => void;
		onCancel: () => void;
	}

	let { newCategoryName = $bindable(''), onSave, onCancel }: Props = $props();
</script>

<div class="mb-4 p-4 border rounded-lg bg-muted/50">
	<Label class="mb-2 block">New Category Name</Label>
	<div class="flex gap-2">
		<Input
			bind:value={newCategoryName}
			placeholder="e.g., Creatures, Spells, etc."
			class="flex-1"
			onkeypress={(e) => {
				if (e.key === 'Enter') onSave();
				if (e.key === 'Escape') onCancel();
			}}
		/>
		<Button size="icon" variant="default" class="text-white" onclick={onSave} disabled={!newCategoryName.trim()}>
			<IconCheck class="h-4 w-4" />
		</Button>
		<Button size="icon" variant="ghost" onclick={onCancel} class="text-white">
			<IconX class="h-4 w-4" />
		</Button>
	</div>
</div>
