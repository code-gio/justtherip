<script lang="ts">
	import type { DeckFolder } from '$lib/types/decks';
	import {
		IconLock,
		IconEyeOff,
		IconEye,
		IconEdit,
		IconTrash,
		IconCards,
		IconFolderSymlink,
		IconDotsVertical
	} from '@tabler/icons-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	interface Props {
		deck: DeckFolder;
		onEdit: (deck: DeckFolder) => void;
		onDelete: (id: string) => void;
		onMove: (deck: DeckFolder) => void;
		onClick?: (deck: DeckFolder) => void;
		viewCount?: number;
		cardCount?: number;
	}

	let { deck, onEdit, onDelete, onMove, onClick, viewCount = 1, cardCount = 28 }: Props = $props();

	const statusIcons = {
		private: IconLock,
		unlisted: IconEyeOff,
		public: IconEye
	};

	const StatusIcon = $derived(statusIcons[deck.status]);

	const colorMap: Record<string, string> = {
		all: 'bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500',
		pokemon: 'bg-yellow-500',
		mtg: 'bg-orange-500',
		yugioh: 'bg-purple-500',
		onepiece: 'bg-red-500'
	};

	const colors = $derived(() => {
		if (!deck.packages || deck.packages.length === 0) {
			return ['bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500'];
		}
		return deck.packages.map((pkg) => colorMap[pkg.toLowerCase()] || 'bg-gray-500');
	});

	function handleClick() {
		onClick?.(deck);
	}

	function handleEdit(event: MouseEvent) {
		event.stopPropagation();
		onEdit(deck);
	}

	function handleDelete(event: MouseEvent) {
		event.stopPropagation();
		onDelete(deck.id);
	}

	function handleMove(event: MouseEvent) {
		event.stopPropagation();
		onMove(deck);
	}
</script>

<div
	class="group relative flex flex-col rounded-lg border bg-card overflow-hidden transition-all hover:shadow-lg cursor-pointer"
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
	<div
		class="relative h-40 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center"
	>
		<IconCards class="h-16 w-16 text-muted-foreground/30" stroke={1} />

		<div class="absolute top-2 right-2 rounded-full bg-background/80 p-1.5">
			<StatusIcon class="h-4 w-4 text-muted-foreground" />
		</div>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
			onclick={(e) => e.stopPropagation()}
			role="group"
		>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button size="icon" variant="ghost" class="h-7 w-7 bg-background/80">
						<IconDotsVertical class="h-4 w-4" />
						<span class="sr-only">Open menu</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
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
	</div>

	<div class="p-4">
		<div class="flex gap-1 mb-3">
			{#each colors() as color}
				<div class="h-1 flex-1 rounded-full {color}"></div>
			{/each}
		</div>

		<div class="flex items-start justify-between gap-2 mb-2">
			{#if deck.status === 'private'}
				<div class="flex items-center gap-1">
					<IconLock class="h-3 w-3 text-muted-foreground flex-shrink-0" />
					<h3 class="font-semibold text-sm line-clamp-1">{deck.name}</h3>
				</div>
			{:else}
				<h3 class="font-semibold text-sm line-clamp-1">{deck.name}</h3>
			{/if}
		</div>

		<div class="flex items-center gap-3 text-xs text-muted-foreground">
			<span>{viewCount} {viewCount === 1 ? 'view' : 'views'}</span>
			<span>•</span>
			<span>{cardCount} cards</span>
		</div>

		{#if deck.packages && deck.packages.length > 0}
			<div class="flex flex-wrap gap-1 mt-2">
				{#each deck.packages as pkg}
					<Badge variant="secondary" class="text-xs">{pkg}</Badge>
				{/each}
			</div>
		{:else}
			<Badge variant="secondary" class="text-xs mt-2">All Packages</Badge>
		{/if}
	</div>

	<div class="px-4 pb-3 text-xs text-muted-foreground/60">No deck tags</div>
</div>
