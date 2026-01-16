<script lang="ts">
	import type { PageData } from './$types';
	import type { DeckFolder, DeckFolderWithChildren, DeckFolderType } from '$lib/types/decks';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { PlusIcon, FolderPlusIcon, FileTextIcon } from '@tabler/icons-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import FolderCard from '$lib/components/decks/FolderCard.svelte';
	import DeckCard from '$lib/components/decks/DeckCard.svelte';
	import CreateDialog from '$lib/components/decks/CreateDialog.svelte';
	import EditDialog from '$lib/components/decks/EditDialog.svelte';
	import { dndzone, TRIGGERS, SOURCES } from '@dnd-kit-svelte/svelte';
	import { flip } from 'svelte/animate';

	let { data }: { data: PageData } = $props();

	let currentFolder = $state<DeckFolderWithChildren | null>(null);
	let breadcrumbs = $state<DeckFolderWithChildren[]>([]);
	let createDialogOpen = $state(false);
	let createDialogType = $state<DeckFolderType>('folder');
	let editDialogOpen = $state(false);
	let editingItem = $state<DeckFolder | null>(null);
	let isSubmitting = $state(false);

	const currentItems = $derived(() => {
		if (!currentFolder) {
			return data.folders;
		}
		return currentFolder.children;
	});

	const folders = $derived(() => currentItems().filter((item) => item.type === 'folder'));
	const decks = $derived(() => currentItems().filter((item) => item.type === 'deck'));

	let draggableFolders = $state<DeckFolderWithChildren[]>([]);
	let draggableDecks = $state<DeckFolderWithChildren[]>([]);

	$effect(() => {
		draggableFolders = folders();
		draggableDecks = decks();
	});

	function openFolder(folder: DeckFolderWithChildren) {
		breadcrumbs = [...breadcrumbs, currentFolder].filter(Boolean) as DeckFolderWithChildren[];
		currentFolder = folder;
	}

	function navigateToBreadcrumb(index: number) {
		if (index === -1) {
			currentFolder = null;
			breadcrumbs = [];
		} else {
			currentFolder = breadcrumbs[index];
			breadcrumbs = breadcrumbs.slice(0, index);
		}
	}

	function openCreateDialog(type: DeckFolderType) {
		createDialogType = type;
		createDialogOpen = true;
	}

	function openEditDialog(item: DeckFolder) {
		editingItem = item;
		editDialogOpen = true;
	}

	async function handleCreate(formData: {
		name: string;
		type: DeckFolderType;
		status: string;
		packages: string[] | null;
		parent_id: string | null;
	}) {
		if (isSubmitting) return;
		isSubmitting = true;

		const form = new FormData();
		form.append('name', formData.name);
		form.append('type', formData.type);
		form.append('status', formData.status);
		form.append('packages', JSON.stringify(formData.packages));
		form.append('parent_id', currentFolder?.id || '');

		try {
			const response = await fetch('?/create', {
				method: 'POST',
				body: form
			});

			if (response.ok) {
				await invalidateAll();
				createDialogOpen = false;
			}
		} catch (error) {
			console.error('Failed to create:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleEdit(formData: { id: string; name: string; status: string; packages: string[] | null }) {
		if (isSubmitting) return;
		isSubmitting = true;

		const form = new FormData();
		form.append('id', formData.id);
		form.append('name', formData.name);
		form.append('status', formData.status);
		form.append('packages', JSON.stringify(formData.packages));

		try {
			const response = await fetch('?/update', {
				method: 'POST',
				body: form
			});

			if (response.ok) {
				await invalidateAll();
				editDialogOpen = false;
				editingItem = null;
			}
		} catch (error) {
			console.error('Failed to update:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete(id: string) {
		if (isSubmitting || !confirm('Are you sure you want to delete this item?')) return;
		isSubmitting = true;

		const form = new FormData();
		form.append('id', id);

		try {
			const response = await fetch('?/delete', {
				method: 'POST',
				body: form
			});

			if (response.ok) {
				await invalidateAll();
			}
		} catch (error) {
			console.error('Failed to delete:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleMove(id: string, parentId: string | null, position: number) {
		const form = new FormData();
		form.append('id', id);
		form.append('parent_id', parentId || '');
		form.append('position', position.toString());

		try {
			await fetch('?/move', {
				method: 'POST',
				body: form
			});
			await invalidateAll();
		} catch (error) {
			console.error('Failed to move:', error);
		}
	}

	function handleFolderDndConsider(e: CustomEvent) {
		draggableFolders = e.detail.items;
	}

	function handleFolderDndFinalize(e: CustomEvent) {
		draggableFolders = e.detail.items;

		if (e.detail.info.source === SOURCES.POINTER || e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
			draggableFolders.forEach((folder, index) => {
				if (folder.position !== index) {
					handleMove(folder.id, currentFolder?.id || null, index);
				}
			});
		}
	}

	function handleDeckDndConsider(e: CustomEvent) {
		draggableDecks = e.detail.items;
	}

	function handleDeckDndFinalize(e: CustomEvent) {
		draggableDecks = e.detail.items;

		if (e.detail.info.source === SOURCES.POINTER || e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
			draggableDecks.forEach((deck, index) => {
				if (deck.position !== index) {
					handleMove(deck.id, currentFolder?.id || null, index);
				}
			});
		}
	}
</script>

<div class="container mx-auto py-8 px-4 max-w-7xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h1 class="text-3xl font-bold">Decks</h1>
			<div class="flex gap-2">
				<Button onclick={() => openCreateDialog('folder')} variant="outline">
					<FolderPlusIcon class="h-4 w-4 mr-2" />
					New Folder
				</Button>
				<Button onclick={() => openCreateDialog('deck')}>
					<PlusIcon class="h-4 w-4 mr-2" />
					New Deck
				</Button>
			</div>
		</div>

		<!-- Breadcrumbs -->
		{#if breadcrumbs.length > 0 || currentFolder}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<button
					class="hover:text-foreground transition-colors"
					onclick={() => navigateToBreadcrumb(-1)}
				>
					Home
				</button>
				{#each breadcrumbs as crumb, index}
					<span>/</span>
					<button
						class="hover:text-foreground transition-colors"
						onclick={() => navigateToBreadcrumb(index)}
					>
						{crumb.name}
					</button>
				{/each}
				{#if currentFolder}
					<span>/</span>
					<span class="text-foreground font-medium">{currentFolder.name}</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Content Grid -->
	<div class="space-y-8">
		<!-- Folders Section -->
		{#if draggableFolders.length > 0}
			<div>
				<h2 class="text-lg font-semibold mb-4">Folders</h2>
				<div
					class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
					use:dndzone={{
						items: draggableFolders,
						flipDurationMs: 200,
						type: 'folder'
					}}
					onconsider={handleFolderDndConsider}
					onfinalize={handleFolderDndFinalize}
				>
					{#each draggableFolders as folder (folder.id)}
						<div animate:flip={{ duration: 200 }}>
							<FolderCard
								{folder}
								onClick={openFolder}
								onEdit={openEditDialog}
								onDelete={handleDelete}
							/>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Decks Section -->
		{#if draggableDecks.length > 0}
			<div>
				<h2 class="text-lg font-semibold mb-4">Decks</h2>
				<div
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
					use:dndzone={{
						items: draggableDecks,
						flipDurationMs: 200,
						type: 'deck'
					}}
					onconsider={handleDeckDndConsider}
					onfinalize={handleDeckDndFinalize}
				>
					{#each draggableDecks as deck (deck.id)}
						<div animate:flip={{ duration: 200 }}>
							<DeckCard {deck} onEdit={openEditDialog} onDelete={handleDelete} />
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Empty State -->
		{#if draggableFolders.length === 0 && draggableDecks.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<FileTextIcon class="h-16 w-16 text-muted-foreground/50 mb-4" strokeWidth={1.5} />
				<h3 class="text-xl font-semibold mb-2">No decks or folders yet</h3>
				<p class="text-muted-foreground mb-6">
					Create your first deck or folder to get started organizing your collection
				</p>
				<div class="flex gap-2">
					<Button onclick={() => openCreateDialog('folder')} variant="outline">
						<FolderPlusIcon class="h-4 w-4 mr-2" />
						Create Folder
					</Button>
					<Button onclick={() => openCreateDialog('deck')}>
						<PlusIcon class="h-4 w-4 mr-2" />
						Create Deck
					</Button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Dialogs -->
	<CreateDialog
		bind:open={createDialogOpen}
		type={createDialogType}
		parentId={currentFolder?.id}
		onClose={() => (createDialogOpen = false)}
		onSubmit={handleCreate}
	/>

	<EditDialog
		bind:open={editDialogOpen}
		item={editingItem}
		onClose={() => {
			editDialogOpen = false;
			editingItem = null;
		}}
		onSubmit={handleEdit}
	/>
</div>

<style>
	:global([data-dnd-kit-draggable-dragging]) {
		opacity: 0.5;
	}

	:global([data-dnd-kit-droppable-over]) {
		background-color: hsl(var(--accent));
		border-color: hsl(var(--primary));
	}
</style>
