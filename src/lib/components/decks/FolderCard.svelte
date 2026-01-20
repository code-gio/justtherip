<script lang="ts">
	import type { DeckFolderWithChildren } from '$lib/types/decks';
	import { IconFolder, IconEdit, IconTrash, IconFolderSymlink, IconDotsVertical } from '@tabler/icons-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	interface Props {
		folder: DeckFolderWithChildren;
		onClick: (folder: DeckFolderWithChildren) => void;
		onEdit: (folder: DeckFolderWithChildren) => void;
		onDelete: (id: string) => void;
		onMove: (folder: DeckFolderWithChildren) => void;
	}

	let { folder, onClick, onEdit, onDelete, onMove }: Props = $props();

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

	function handleMove(event: MouseEvent) {
		event.stopPropagation();
		onMove(folder);
	}
</script>

<div
	class="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-card p-6 transition-all hover:border-primary/50 hover:bg-accent cursor-pointer"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			handleClick();
		}
	}}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onclick={(e) => e.stopPropagation()} role="group">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button size="icon" variant="ghost" class="h-7 w-7">
					<IconDotsVertical class="h-4 w-4" />
					<span class="sr-only">Open menu</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item onclick={handleEdit}>
					<IconEdit class="mr-2 h-4 w-4" />
					<span>Edit</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={handleMove}>
					<IconFolderSymlink class="mr-2 h-4 w-4" />
					<span>Move</span>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleDelete} class="text-destructive">
					<IconTrash class="mr-2 h-4 w-4" />
					<span>Delete</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<IconFolder class="h-12 w-12 mb-3 text-muted-foreground" stroke={1.5} />

	<h3 class="font-semibold text-sm text-center line-clamp-2">{folder.name}</h3>

	{#if folder.children && folder.children.length > 0}
		<p class="text-xs text-muted-foreground mt-1">
			{folder.children.length}
			{folder.children.length === 1 ? 'item' : 'items'}
		</p>
	{/if}
</div>
