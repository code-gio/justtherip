import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.safeGetSession();
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { table, card_names, game_code } = await request.json();

		if (!table || !card_names) {
			return json({ error: 'Missing required parameters' }, { status: 400 });
		}

		// Validate table name
		const validTables = ['mtg_cards', 'pokemon_cards', 'yugioh_cards'];
		if (!validTables.includes(table)) {
			return json({ error: 'Invalid table name' }, { status: 400 });
		}

		// Parse card names
		const cardNamesArray = Array.isArray(card_names) ? card_names : card_names.split('\n');
		const cleanedNames = cardNamesArray
			.map((name: string) => name.trim())
			.filter((name: string) => name.length > 0);

		if (cleanedNames.length === 0) {
			return json({ found: [], notFound: [] });
		}

		if (cleanedNames.length > 500) {
			return json({ error: 'Maximum 500 cards can be verified at once' }, { status: 400 });
		}

		const found: any[] = [];
		const notFound: string[] = [];
		const seenCardIds = new Set<string>();

		// Process each card name individually for accurate matching
		for (const cardName of cleanedNames) {
			try {
				// First, try exact match (case-insensitive)
				const { data: exactMatch, error: exactError } = await locals.supabase
					.from(table)
					.select('*')
					.ilike('name', cardName)
					.limit(5);

				let matchedCard = null;

				if (!exactError && exactMatch && exactMatch.length > 0) {
					// Find the best match (exact case-insensitive match first)
					const lowerCardName = cardName.toLowerCase();
					matchedCard = exactMatch.find(
						(c: any) => c.name.toLowerCase() === lowerCardName
					);

					// If no exact match, take the first result
					if (!matchedCard) {
						matchedCard = exactMatch[0];
					}
				}

				// If no match found, try fuzzy search
				if (!matchedCard) {
					const { data: fuzzyMatch, error: fuzzyError } = await locals.supabase
						.from(table)
						.select('*')
						.ilike('name', `%${cardName}%`)
						.limit(5);

					if (!fuzzyError && fuzzyMatch && fuzzyMatch.length > 0) {
						// Find best match from fuzzy results
						const lowerCardName = cardName.toLowerCase();
						matchedCard = fuzzyMatch.find(
							(c: any) => c.name.toLowerCase() === lowerCardName
						);

						if (!matchedCard) {
							matchedCard = fuzzyMatch[0];
						}
					}
				}

				if (matchedCard && !seenCardIds.has(matchedCard.id)) {
					seenCardIds.add(matchedCard.id);
					found.push(matchedCard);
				} else if (!matchedCard) {
					notFound.push(cardName);
				}
			} catch (err) {
				console.error(`Error processing card "${cardName}":`, err);
				notFound.push(cardName);
			}
		}

		return json({ found, notFound });
	} catch (error) {
		console.error('Card verification error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
