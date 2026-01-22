import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.safeGetSession();
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { table, query, limit = 50 } = await request.json();

		if (!table || !query) {
			return json({ error: 'Missing required parameters' }, { status: 400 });
		}

		// Validate table name to prevent SQL injection
		const validTables = ['mtg_cards', 'pokemon_cards', 'yugioh_cards'];
		if (!validTables.includes(table)) {
			return json({ error: 'Invalid table name' }, { status: 400 });
		}

		// Search for cards using ilike for case-insensitive search
		const { data: cards, error } = await locals.supabase
			.from(table)
			.select('*')
			.ilike('name', `%${query}%`)
			.limit(limit)
			.order('name');

		if (error) {
			console.error('Card search error:', error);
			return json({ error: 'Search failed' }, { status: 500 });
		}

		return json({ cards: cards || [] });
	} catch (error) {
		console.error('Card search error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
