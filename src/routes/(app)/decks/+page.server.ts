import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getDeckFolders,
	buildFolderTree,
	createDeckFolder,
	updateDeckFolder,
	moveDeckFolder,
	deleteDeckFolder
} from '$lib/server/deck-folders';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();

	if (!user) {
		return {
			folders: [],
			flatFolders: []
		};
	}

	try {
		const folders = await getDeckFolders(supabase, user.id);
		const folderTree = buildFolderTree(folders);

		return {
			folders: folderTree,
			flatFolders: folders
		};
	} catch (error) {
		console.error('Error loading deck folders:', error);
		return {
			folders: [],
			flatFolders: []
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const type = formData.get('type') as 'folder' | 'deck';
		const status = (formData.get('status') as string) || 'private';
		const packagesStr = formData.get('packages') as string;
		const parentId = formData.get('parent_id') as string | null;

		if (!name || !type) {
			return fail(400, { message: 'Name and type are required' });
		}

		let packages: string[] | null = null;
		if (packagesStr) {
			try {
				packages = JSON.parse(packagesStr);
			} catch {
				packages = packagesStr === 'all' ? null : [packagesStr];
			}
		}

		try {
			const newItem = await createDeckFolder(supabase, user.id, {
				name,
				type,
				status: status as 'private' | 'unlisted' | 'public',
				packages,
				parent_id: parentId || null
			});

			return { success: true, item: newItem };
		} catch (error) {
			console.error('Error creating deck folder:', error);
			return fail(500, { message: 'Failed to create item' });
		}
	},

	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string | undefined;
		const status = formData.get('status') as string | undefined;
		const packagesStr = formData.get('packages') as string | undefined;

		if (!id) {
			return fail(400, { message: 'ID is required' });
		}

		let packages: string[] | null | undefined = undefined;
		if (packagesStr !== undefined) {
			try {
				packages = JSON.parse(packagesStr);
			} catch {
				packages = packagesStr === 'all' ? null : [packagesStr];
			}
		}

		try {
			const updatedItem = await updateDeckFolder(supabase, user.id, {
				id,
				name,
				status: status as 'private' | 'unlisted' | 'public' | undefined,
				packages
			});

			return { success: true, item: updatedItem };
		} catch (error) {
			console.error('Error updating deck folder:', error);
			return fail(500, { message: 'Failed to update item' });
		}
	},

	move: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const parentId = formData.get('parent_id') as string | null;
		const position = parseInt(formData.get('position') as string);

		if (!id || isNaN(position)) {
			return fail(400, { message: 'ID and position are required' });
		}

		try {
			await moveDeckFolder(supabase, user.id, {
				id,
				parent_id: parentId || null,
				position
			});

			return { success: true };
		} catch (error) {
			console.error('Error moving deck folder:', error);
			return fail(500, { message: 'Failed to move item' });
		}
	},

	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'ID is required' });
		}

		try {
			await deleteDeckFolder(supabase, user.id, id);
			return { success: true };
		} catch (error) {
			console.error('Error deleting deck folder:', error);
			return fail(500, { message: 'Failed to delete item' });
		}
	}
};
