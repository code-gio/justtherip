<script lang="ts">
	import type { PageData } from './$types';
	import type { DeckFolder, DeckFolderWithChildren, DeckFolderType } from '$lib/types/decks';
	import { invalidateAll } from '$app/navigation';
	import { IconPlus, IconFolderPlus, IconFileText, IconLoader2 } from '@tabler/icons-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import FolderCard from '$lib/components/decks/FolderCard.svelte';
	import DeckCard from '$lib/components/decks/DeckCard.svelte';
	import CreateDialog from '$lib/components/decks/CreateDialog.svelte';
	import EditDialog from '$lib/components/decks/EditDialog.svelte';
	import MoveDialog from '$lib/components/decks/MoveDialog.svelte';

	let { data }: { data: PageData } = $props();

	let currentFolder = $state<DeckFolderWithChildren | null>(null);
	let breadcrumbs = $state<DeckFolderWithChildren[]>([]);
	let createDialogOpen = $state(false);
	let createDialogType = $state<DeckFolderType>('folder');
	let editDialogOpen = $state(false);
	let editingItem = $state<DeckFolder | null>(null);
	let moveDialogOpen = $state(false);
	let movingItem = $state<DeckFolder | null>(null);
	let isSubmitting = $state(false);

	let draggedItem = $state<DeckFolderWithChildren | null>(null);
	let dragOverIndex = $state<number | null>(null);
	let dragOverFolder = $state<string | null>(null);

	// Track folder navigation with IDs to avoid infinite loops
	let currentFolderId = $state<string | null>(null);
	let breadcrumbIds = $state<string[]>([]);

	// Helper function to find folder by id
	function findFolder(folders: DeckFolderWithChildren[], id: string): DeckFolderWithChildren | null {
		for (const folder of folders) {
			if (folder.id === id) return folder;
			if (folder.children.length > 0) {
				const found = findFolder(folder.children, id);
				if (found) return found;
			}
		}
		return null;
	}
	
	// Effect to update currentFolder and breadcrumbs when data changes
	$effect(() => {
		// Only observe data.folders, currentFolderId, and breadcrumbIds
		data.folders;
		
		// Update currentFolder
		if (currentFolderId) {
			const updated = findFolder(data.folders, currentFolderId);
			if (updated) {
				currentFolder = updated;
			}
		}
		
		// Update breadcrumbs
		if (breadcrumbIds.length > 0) {
			const updatedBreadcrumbs: DeckFolderWithChildren[] = [];
			for (const id of breadcrumbIds) {
				const updated = findFolder(data.folders, id);
				if (updated) {
					updatedBreadcrumbs.push(updated);
				}
			}
			// Only update if we found all breadcrumbs
			if (updatedBreadcrumbs.length === breadcrumbIds.length) {
				breadcrumbs = updatedBreadcrumbs;
			}
		}
	});

	const currentItems = $derived(() => {
		if (!currentFolder) {
			return data.folders;
		}
		return currentFolder.children;
	});

	const draggableItems = $derived(currentItems());

	function openFolder(folder: DeckFolderWithChildren) {
		if (currentFolder) {
			breadcrumbs = [...breadcrumbs, currentFolder];
			breadcrumbIds = [...breadcrumbIds, currentFolder.id];
		}
		currentFolder = folder;
		currentFolderId = folder.id;
	}

	function navigateToBreadcrumb(index: number) {
		if (index === -1) {
			currentFolder = null;
			currentFolderId = null;
			breadcrumbs = [];
			breadcrumbIds = [];
		} else {
			currentFolder = breadcrumbs[index];
			currentFolderId = breadcrumbs[index].id;
			breadcrumbs = breadcrumbs.slice(0, index);
			breadcrumbIds = breadcrumbIds.slice(0, index);
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

	function openMoveDialog(item: DeckFolder) {
		movingItem = item;
		moveDialogOpen = true;
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

	async function handleEdit(formData: {
		id: string;
		name: string;
		status: string;
		packages: string[] | null;
	}) {
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
			throw error;
		}
	}

	async function handleMoveDragDrop(id: string, parentId: string | null, position: number) {
		if (isSubmitting) return;
		isSubmitting = true;
		
		try {
			await handleMove(id, parentId, position);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleMoveDialog(targetParentId: string | null) {
		if (!movingItem) return;
		if (isSubmitting) return;
		isSubmitting = true;

		try {
			await handleMove(movingItem.id, targetParentId, 0);
			moveDialogOpen = false;
			movingItem = null;
		} catch (error) {
			console.error('Failed to move item:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleDragStart(e: DragEvent, item: DeckFolderWithChildren) {
		if (!e.dataTransfer) return;
		draggedItem = item;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', item.id);
		if (e.target instanceof HTMLElement) {
			e.target.style.opacity = '0.5';
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		if (!draggedItem) return;
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		dragOverIndex = index;
	}

	function handleDragOverFolder(e: DragEvent, folderId: string) {
		if (!draggedItem) return;
		
		// Can't drop a folder into itself
		if (draggedItem.id === folderId) return;
		
		// Can't drop a folder into a deck
		const targetFolder = draggableItems.find(item => item.id === folderId);
		if (targetFolder && targetFolder.type === 'deck') return;
		
		// Can't drop a folder into its own descendant
		if (draggedItem.type === 'folder') {
			if (isDescendant(folderId, draggedItem)) return;
		}
		
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';
		dragOverFolder = folderId;
	}

	function isDescendant(checkId: string, parent: DeckFolderWithChildren): boolean {
		for (const child of parent.children) {
			if (child.id === checkId) return true;
			if (isDescendant(checkId, child)) return true;
		}
		return false;
	}

	function handleDragLeave() {
		dragOverIndex = null;
		dragOverFolder = null;
	}

	async function handleDrop(e: DragEvent, dropIndex: number) {
		e.preventDefault();
		if (!draggedItem || isSubmitting) return;

		const draggedIndex = draggableItems.findIndex((item) => item.id === draggedItem!.id);

		if (draggedIndex !== dropIndex && draggedIndex !== -1) {
			// Reorder within the same parent
			await handleMoveDragDrop(draggedItem.id, currentFolder?.id || null, dropIndex);
		}

		draggedItem = null;
		dragOverIndex = null;
		dragOverFolder = null;
	}

	async function handleDropOnFolder(e: DragEvent, folderId: string) {
		e.preventDefault();
		if (!draggedItem || isSubmitting) return;

		const targetFolder = draggableItems.find(item => item.id === folderId);
		if (!targetFolder || targetFolder.type === 'deck') return;
		if (draggedItem.id === folderId) return;
		if (draggedItem.type === 'folder' && isDescendant(folderId, draggedItem)) return;

		// Move item into the folder
		await handleMoveDragDrop(draggedItem.id, folderId, 0);

		draggedItem = null;
		dragOverIndex = null;
		dragOverFolder = null;
	}

	function handleDragEnd(e: DragEvent) {
		if (e.target instanceof HTMLElement) {
			e.target.style.opacity = '1';
		}
		draggedItem = null;
		dragOverIndex = null;
		dragOverFolder = null;
	}
</script>

<div class="container mx-auto py-8 px-4 max-w-7xl relative">
	<!-- Loading overlay -->
	{#if isSubmitting}
		<div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
			<div class="flex flex-col items-center gap-2">
				<IconLoader2 class="h-8 w-8 animate-spin text-primary" />
				<p class="text-sm text-muted-foreground">Processing...</p>
			</div>
		</div>
	{/if}

	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h1 class="text-3xl font-bold">Decks</h1>
			<div class="flex gap-2">
				<Button onclick={() => openCreateDialog('folder')} variant="outline">
					<IconFolderPlus class="h-4 w-4 mr-2" />
					New Folder
				</Button>
				<Button onclick={() => openCreateDialog('deck')}>
					<IconPlus class="h-4 w-4 mr-2" />
					New Deck
				</Button>
			</div>
		</div>

		{#if breadcrumbs.length > 0 || currentFolder}
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<button class="hover:text-foreground transition-colors" onclick={() => navigateToBreadcrumb(-1)}>
					Home
				</button>
				{#each breadcrumbs as crumb, index}
					<span>/</span>
					<button class="hover:text-foreground transition-colors" onclick={() => navigateToBreadcrumb(index)}>
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

	<div class="space-y-8">
		{#if draggableItems.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{#each draggableItems as item, index (item.id)}
					<div
						draggable="true"
						role="button"
						tabindex="0"
						aria-label="Drag {item.type} {item.name}"
						class="transition-all
							{dragOverIndex === index ? 'ring-2 ring-primary scale-105' : ''}
							{draggedItem?.id === item.id ? 'opacity-50' : ''}
							{dragOverFolder === item.id && item.type === 'folder' ? 'ring-2 ring-blue-500 scale-105' : ''}"
						ondragstart={(e) => handleDragStart(e, item)}
						ondragover={(e) => handleDragOver(e, index)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, index)}
						ondragend={handleDragEnd}
					>
					{#if item.type === 'folder'}
						<div
							role="button"
							tabindex="0"
							ondragover={(e) => handleDragOverFolder(e, item.id)}
							ondrop={(e) => handleDropOnFolder(e, item.id)}
						>
								<FolderCard
									folder={item}
									onClick={openFolder}
									onEdit={openEditDialog}
									onDelete={handleDelete}
									onMove={openMoveDialog}
								/>
							</div>
						{:else}
							<DeckCard
								deck={item}
								onEdit={openEditDialog}
								onDelete={handleDelete}
								onMove={openMoveDialog}
							/>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<IconFileText class="h-16 w-16 text-muted-foreground/50 mb-4" />
				<h3 class="text-xl font-semibold mb-2">No decks or folders yet</h3>
				<p class="text-muted-foreground mb-6">
					Create your first deck or folder to get started organizing your collection
				</p>
				<div class="flex gap-2">
					<Button onclick={() => openCreateDialog('folder')} variant="outline">
						<IconFolderPlus class="h-4 w-4 mr-2" />
						Create Folder
					</Button>
					<Button onclick={() => openCreateDialog('deck')}>
						<IconPlus class="h-4 w-4 mr-2" />
						Create Deck
					</Button>
				</div>
			</div>
		{/if}
	</div>

	<CreateDialog
		bind:open={createDialogOpen}
		type={createDialogType}
		parentId={currentFolder?.id}
		isSubmitting={isSubmitting}
		onClose={() => (createDialogOpen = false)}
		onSubmit={handleCreate}
	/>

	<EditDialog
		bind:open={editDialogOpen}
		item={editingItem}
		isSubmitting={isSubmitting}
		onClose={() => {
			editDialogOpen = false;
			editingItem = null;
		}}
		onSubmit={handleEdit}
	/>

	<MoveDialog
		bind:open={moveDialogOpen}
		item={movingItem}
		allFolders={data.folders}
		currentParentId={movingItem?.parent_id}
		isSubmitting={isSubmitting}
		onClose={() => {
			moveDialogOpen = false;
			movingItem = null;
		}}
		onSubmit={handleMoveDialog}
	/>
</div>

<style>
	[draggable='true'] {
		cursor: grab;
	}

	[draggable='true']:active {
		cursor: grabbing;
	}
</style>
