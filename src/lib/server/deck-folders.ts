import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	DeckFolder,
	DeckFolderWithChildren,
	CreateDeckFolderInput,
	UpdateDeckFolderInput,
	MoveDeckFolderInput
} from '$lib/types/decks';

export async function getDeckFolders(
	supabase: SupabaseClient,
	userId: string
): Promise<DeckFolder[]> {
	const { data, error } = await supabase
		.from('deck_folders')
		.select('*')
		.eq('user_id', userId)
		.order('position', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch deck folders: ${error.message}`);
	}

	return data || [];
}

export function buildFolderTree(folders: DeckFolder[]): DeckFolderWithChildren[] {
	const folderMap = new Map<string, DeckFolderWithChildren>();
	const rootFolders: DeckFolderWithChildren[] = [];

	folders.forEach((folder) => {
		folderMap.set(folder.id, { ...folder, children: [] });
	});

	folders.forEach((folder) => {
		const folderWithChildren = folderMap.get(folder.id)!;
		if (folder.parent_id === null) {
			rootFolders.push(folderWithChildren);
		} else {
			const parent = folderMap.get(folder.parent_id);
			if (parent) {
				parent.children.push(folderWithChildren);
			}
		}
	});

	return rootFolders;
}

export async function createDeckFolder(
	supabase: SupabaseClient,
	userId: string,
	input: CreateDeckFolderInput
): Promise<DeckFolder> {
	const maxPositionResult = await supabase
		.from('deck_folders')
		.select('position')
		.eq('user_id', userId)
		.eq('parent_id', input.parent_id || null)
		.order('position', { ascending: false })
		.limit(1)
		.single();

	const nextPosition = maxPositionResult.data ? maxPositionResult.data.position + 1 : 0;

	const { data, error } = await supabase
		.from('deck_folders')
		.insert({
			name: input.name,
			type: input.type,
			status: input.status || 'private',
			packages: input.packages || null,
			user_id: userId,
			parent_id: input.parent_id || null,
			position: input.position !== undefined ? input.position : nextPosition
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create deck folder: ${error.message}`);
	}

	return data;
}

export async function updateDeckFolder(
	supabase: SupabaseClient,
	userId: string,
	input: UpdateDeckFolderInput
): Promise<DeckFolder> {
	const updateData: Record<string, unknown> = {};

	if (input.name !== undefined) updateData.name = input.name;
	if (input.status !== undefined) updateData.status = input.status;
	if (input.packages !== undefined) updateData.packages = input.packages;
	if (input.parent_id !== undefined) updateData.parent_id = input.parent_id;
	if (input.position !== undefined) updateData.position = input.position;

	const { data, error } = await supabase
		.from('deck_folders')
		.update(updateData)
		.eq('id', input.id)
		.eq('user_id', userId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update deck folder: ${error.message}`);
	}

	return data;
}

export async function moveDeckFolder(
	supabase: SupabaseClient,
	userId: string,
	input: MoveDeckFolderInput
): Promise<void> {
	const itemToMove = await supabase
		.from('deck_folders')
		.select('*')
		.eq('id', input.id)
		.eq('user_id', userId)
		.single();

	if (itemToMove.error) {
		throw new Error(`Failed to find item to move: ${itemToMove.error.message}`);
	}

	if (itemToMove.data.type === 'folder' && input.parent_id) {
		const targetParent = await supabase
			.from('deck_folders')
			.select('*')
			.eq('id', input.parent_id)
			.eq('user_id', userId)
			.single();

		if (targetParent.error || targetParent.data.type === 'deck') {
			throw new Error('Cannot move folder into a deck');
		}
	}

	const { error } = await supabase
		.from('deck_folders')
		.update({
			parent_id: input.parent_id,
			position: input.position
		})
		.eq('id', input.id)
		.eq('user_id', userId);

	if (error) {
		throw new Error(`Failed to move deck folder: ${error.message}`);
	}
}

export async function deleteDeckFolder(
	supabase: SupabaseClient,
	userId: string,
	id: string
): Promise<void> {
	const { error } = await supabase.from('deck_folders').delete().eq('id', id).eq('user_id', userId);

	if (error) {
		throw new Error(`Failed to delete deck folder: ${error.message}`);
	}
}
