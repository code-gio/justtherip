<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { IconSearch, IconUpload, IconPlus, IconPin } from '@tabler/icons-svelte';

	interface Props {
		localFilter?: string;
		pinnedCount: number;
		isCreatingCategory: boolean;
		onSearchOpen: () => void;
		onBulkImportOpen: () => void;
		onNewCategory: () => void;
	}

	let {
		localFilter = $bindable(''),
		pinnedCount,
		isCreatingCategory,
		onSearchOpen,
		onBulkImportOpen,
		onNewCategory
	}: Props = $props();
</script>

<div class="flex gap-2 items-center">
	<div class="flex-1 max-w-md">
		<Input bind:value={localFilter} placeholder="Filter cards..." class="w-full">
			<IconSearch slot="icon-left" class="h-4 w-4 text-muted-foreground" />
		</Input>
	</div>

	<Button onclick={onSearchOpen} class="text-white">
		<IconSearch class="h-4 w-4 mr-2" />
		Card Search
	</Button>

	<Button onclick={onBulkImportOpen} variant="outline">
		<IconUpload class="h-4 w-4 mr-2" />
		Bulk Import
	</Button>

	<Button onclick={onNewCategory} variant="outline" disabled={isCreatingCategory}>
		<IconPlus class="h-4 w-4 mr-2" />
		New Category
	</Button>

	<Button variant="outline" class="pointer-events-none">
		<IconPin class="h-4 w-4 mr-2" />
		Pinned Cards ({pinnedCount})
	</Button>
</div>
