<script lang="ts">
	import type { DeckFolderWithChildren } from '$lib/types/decks';
	import { IconFolder, IconEdit, IconTrash } from '@tabler/icons-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	interface Props {
		folder: DeckFolderWithChildren;
		onClick: (folder: DeckFolderWithChildren) => void;
		onEdit: (folder: DeckFolderWithChildren) => void;
		onDelete: (id: string) => void;
	}

	let { folder, onClick, onEdit, onDelete }: Props = $props();

	function handleClick() {
		onClick(folder);
	}

	function handleEdit(event: MouseEvent) {
		event.stopPropagation();
		onEdit(folder);
	}

	function handleDelete(event: MouseEvent) {
		event.stopPropagation();
		onDelete(folder.id);
	}
</script>

<Card.Root class="cursor-pointer hover:shadow-md transition-shadow group relative" onclick={handleClick}>
	<Card.Content class="p-4">
		<div class="flex flex-col items-center justify-center gap-2 min-h-[120px]">
			<IconFolder class="h-12 w-12 text-primary" />
			<h3 class="font-semibold text-center text-sm line-clamp-2">{folder.name}</h3>
			{#if folder.children && folder.children.length > 0}
				<p class="text-xs text-muted-foreground">{folder.children.length} items</p>
			{/if}
		</div>
	</Card.Content>
	<div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7"
			onclick={handleEdit}
			title="Edit folder"
		>
			<IconEdit class="h-4 w-4" />
		</Button>
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 text-destructive hover:text-destructive"
			onclick={handleDelete}
			title="Delete folder"
		>
			<IconTrash class="h-4 w-4" />
		</Button>
	</div>
</Card.Root>

<style>
	:global(.group:hover .opacity-0) {
		opacity: 1;
	}
</style>
