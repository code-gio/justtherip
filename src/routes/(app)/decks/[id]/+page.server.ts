import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.safeGetSession();
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const deckId = params.id;

	// Load deck info
	const { data: deck, error: deckError } = await locals.supabase
		.from('deck_folders')
		.select('*')
		.eq('id', deckId)
		.eq('type', 'deck')
		.single();

	if (deckError || !deck) {
		throw error(404, 'Deck not found');
	}

	// Check if user has access
	if (deck.user_id !== session.user.id && deck.status === 'private') {
		throw error(403, 'Forbidden');
	}

	// Load deck cards with card data
	const { data: deckCards, error: cardsError } = await locals.supabase
		.from('deck_cards')
		.select('*')
		.eq('deck_id', deckId)
		.order('position');

	if (cardsError) {
		console.error('Error loading deck cards:', cardsError);
	}

	// Group cards by category
	const cardsByCategory: Record<string, any[]> = {};
	const cardIds: string[] = [];

	(deckCards || []).forEach((dc) => {
		const category = dc.category || 'Uncategorized';
		if (!cardsByCategory[category]) {
			cardsByCategory[category] = [];
		}
		cardsByCategory[category].push(dc);
		cardIds.push(dc.card_id);
	});

	// Fetch card data from appropriate table(s) based on deck packages
	const cardsData: Record<string, any> = {};
	
	if (deck.packages && deck.packages.length > 0 && cardIds.length > 0) {
		for (const pkg of deck.packages) {
			const tableName = `${pkg}_cards`;
			
			const { data: cards, error: fetchError } = await locals.supabase
				.from(tableName)
				.select('*')
				.in('id', cardIds);

			if (!fetchError && cards) {
				cards.forEach((card) => {
					cardsData[card.id] = card;
				});
			}
		}
	}

	// Use deck's categories array, fallback to 'Uncategorized' if empty
	const categories = deck.categories && deck.categories.length > 0 
		? deck.categories 
		: ['Uncategorized'];

	// Fixed columns that always appear on the right
	const fixedColumns = ['Sideboard', 'Maybeboard'];
	
	// Combine regular categories with fixed columns
	const allCategories = [...categories, ...fixedColumns];

	// Attach card data to deck cards and organize by category
	const enrichedCardsByCategory: Record<string, any[]> = {};
	
	// Initialize all categories from deck (even empty ones)
	allCategories.forEach(cat => {
		enrichedCardsByCategory[cat] = [];
	});

	// Add cards to their respective categories
	Object.entries(cardsByCategory).forEach(([category, cards]) => {
		const targetCategory = allCategories.includes(category) ? category : 'Uncategorized';
		enrichedCardsByCategory[targetCategory] = cards.map((dc) => ({
			...dc,
			cardData: cardsData[dc.card_id] || null
		}));
	});

	return {
		deck,
		cardsByCategory: enrichedCardsByCategory,
		categories,
		fixedColumns
	};
};

export const actions: Actions = {
	addCards: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const cardIds = JSON.parse(formData.get('cardIds') as string);
		const category = formData.get('category') as string;

		// Verify deck ownership
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id')
			.eq('id', deckId)
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		// Get current max position for this category
		const { data: existingCards } = await locals.supabase
			.from('deck_cards')
			.select('position')
			.eq('deck_id', deckId)
			.eq('category', category)
			.order('position', { ascending: false })
			.limit(1);

		let nextPosition = existingCards && existingCards.length > 0 ? existingCards[0].position + 1 : 0;

		// Insert cards
		const cardsToInsert = cardIds.map((cardId: string) => ({
			deck_id: deckId,
			card_id: cardId,
			category: category || 'Uncategorized',
			position: nextPosition++
		}));

		const { error: insertError } = await locals.supabase
			.from('deck_cards')
			.insert(cardsToInsert);

		if (insertError) {
			console.error('Error adding cards:', insertError);
			return fail(500, { error: 'Failed to add cards' });
		}

		return { success: true };
	},

	removeCard: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const cardId = formData.get('cardId') as string;

		// Verify deck ownership
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id')
			.eq('id', deckId)
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		const { error: deleteError } = await locals.supabase
			.from('deck_cards')
			.delete()
			.eq('deck_id', deckId)
			.eq('card_id', cardId);

		if (deleteError) {
			console.error('Error removing card:', deleteError);
			return fail(500, { error: 'Failed to remove card' });
		}

		return { success: true };
	},

	moveCard: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const deckCardId = formData.get('deckCardId') as string;
		const targetCategory = formData.get('targetCategory') as string;
		const targetPosition = parseInt(formData.get('targetPosition') as string);

		// Verify deck ownership
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id')
			.eq('id', deckId)
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		const { error: updateError } = await locals.supabase
			.from('deck_cards')
			.update({
				category: targetCategory,
				position: targetPosition
			})
			.eq('id', deckCardId);

		if (updateError) {
			console.error('Error moving card:', updateError);
			return fail(500, { error: 'Failed to move card' });
		}

		return { success: true };
	},

	createCategory: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const categoryName = formData.get('name') as string;

		if (!categoryName || !categoryName.trim()) {
			return fail(400, { error: 'Category name is required' });
		}

		// Verify deck ownership and get current categories
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id, categories')
			.eq('id', deckId)
			.eq('type', 'deck')
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		const currentCategories = deck.categories || ['Uncategorized'];
		
		// Check if category already exists
		if (currentCategories.includes(categoryName.trim())) {
			return fail(400, { error: 'Category already exists' });
		}

		// Add new category to the array
		const updatedCategories = [...currentCategories, categoryName.trim()];

		const { error: updateError } = await locals.supabase
			.from('deck_folders')
			.update({ categories: updatedCategories })
			.eq('id', deckId);

		if (updateError) {
			console.error('Error creating category:', updateError);
			return fail(500, { error: 'Failed to create category' });
		}

		return { success: true, category: categoryName.trim() };
	},

	deleteCategory: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const categoryName = formData.get('name') as string;

		// Verify deck ownership and get current categories
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id, categories')
			.eq('id', deckId)
			.eq('type', 'deck')
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		const currentCategories = deck.categories || ['Uncategorized'];

		// Remove category from array
		const updatedCategories = currentCategories.filter(cat => cat !== categoryName);

		// Ensure at least one category exists
		if (updatedCategories.length === 0) {
			updatedCategories.push('Uncategorized');
		}

		// Update deck categories
		const { error: updateError } = await locals.supabase
			.from('deck_folders')
			.update({ categories: updatedCategories })
			.eq('id', deckId);

		if (updateError) {
			console.error('Error updating categories:', updateError);
			return fail(500, { error: 'Failed to update categories' });
		}

		// Delete all cards in this category OR move them to 'Uncategorized'
		// For now, we'll move them to 'Uncategorized'
		const { error: cardsError } = await locals.supabase
			.from('deck_cards')
			.update({ category: 'Uncategorized' })
			.eq('deck_id', deckId)
			.eq('category', categoryName);

		if (cardsError) {
			console.error('Error moving cards:', cardsError);
			return fail(500, { error: 'Failed to move cards' });
		}

		return { success: true };
	},

	reorderCategories: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const newOrder = JSON.parse(formData.get('categories') as string) as string[];

		if (!Array.isArray(newOrder) || newOrder.length === 0) {
			return fail(400, { error: 'Invalid categories order' });
		}

		// Verify deck ownership
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id, categories')
			.eq('id', deckId)
			.eq('type', 'deck')
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		// Update categories order
		const { error: updateError } = await locals.supabase
			.from('deck_folders')
			.update({ categories: newOrder })
			.eq('id', deckId);

		if (updateError) {
			console.error('Error reordering categories:', updateError);
			return fail(500, { error: 'Failed to reorder categories' });
		}

		return { success: true };
	},

	renameCategory: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const oldName = formData.get('oldName') as string;
		const newName = formData.get('newName') as string;

		if (!oldName || !newName || !newName.trim()) {
			return fail(400, { error: 'Category names are required' });
		}

		// Verify deck ownership
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id, categories')
			.eq('id', deckId)
			.eq('type', 'deck')
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		const currentCategories = deck.categories || ['Uncategorized'];

		// Check if new name already exists
		if (currentCategories.includes(newName.trim()) && oldName !== newName.trim()) {
			return fail(400, { error: 'Category name already exists' });
		}

		// Update category name in array
		const updatedCategories = currentCategories.map(cat => 
			cat === oldName ? newName.trim() : cat
		);

		// Update deck categories
		const { error: updateError } = await locals.supabase
			.from('deck_folders')
			.update({ categories: updatedCategories })
			.eq('id', deckId);

		if (updateError) {
			console.error('Error updating categories:', updateError);
			return fail(500, { error: 'Failed to update categories' });
		}

		// Update all cards with this category
		const { error: cardsError } = await locals.supabase
			.from('deck_cards')
			.update({ category: newName.trim() })
			.eq('deck_id', deckId)
			.eq('category', oldName);

		if (cardsError) {
			console.error('Error updating cards:', cardsError);
			return fail(500, { error: 'Failed to update cards' });
		}

		return { success: true };
	},

	togglePinned: async ({ request, locals, params }) => {
		const session = await locals.safeGetSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const deckId = params.id;
		const formData = await request.formData();
		const deckCardId = formData.get('deckCardId') as string;
		const isPinned = formData.get('isPinned') === 'true';

		// Verify deck ownership
		const { data: deck } = await locals.supabase
			.from('deck_folders')
			.select('user_id')
			.eq('id', deckId)
			.eq('type', 'deck')
			.single();

		if (!deck || deck.user_id !== session.user.id) {
			return fail(403, { error: 'Forbidden' });
		}

		// Update is_pinned status
		const { error: updateError } = await locals.supabase
			.from('deck_cards')
			.update({ is_pinned: isPinned })
			.eq('id', deckCardId);

		if (updateError) {
			console.error('Error updating pinned status:', updateError);
			return fail(500, { error: 'Failed to update pinned status' });
		}

		return { success: true };
	},
};
