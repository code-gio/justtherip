import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	DeckCard,
	CreateDeckCardInput,
	UpdateDeckCardInput,
	MoveDeckCardInput
} from '$lib/types/decks';

export async function getDeckCards(
	supabase: SupabaseClient,
	deckId: string
): Promise<DeckCard[]> {
	const { data, error } = await supabase
		.from('deck_cards')
		.select('*')
		.eq('deck_id', deckId)
		.order('position', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch deck cards: ${error.message}`);
	}

	return data || [];
}

export async function getPinnedDeckCards(
	supabase: SupabaseClient,
	deckId: string
): Promise<DeckCard[]> {
	const { data, error } = await supabase
		.from('deck_cards')
		.select('*')
		.eq('deck_id', deckId)
		.eq('is_pinned', true)
		.order('position', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch pinned deck cards: ${error.message}`);
	}

	return data || [];
}

export async function getDeckCardsByCategory(
	supabase: SupabaseClient,
	deckId: string,
	category: string
): Promise<DeckCard[]> {
	const { data, error } = await supabase
		.from('deck_cards')
		.select('*')
		.eq('deck_id', deckId)
		.eq('category', category)
		.order('position', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch deck cards by category: ${error.message}`);
	}

	return data || [];
}

export async function addCardToDeck(
	supabase: SupabaseClient,
	input: CreateDeckCardInput
): Promise<DeckCard> {
	const { data: existing } = await supabase
		.from('deck_cards')
		.select('id')
		.eq('deck_id', input.deck_id)
		.eq('card_id', input.card_id)
		.single();

	if (existing) {
		throw new Error('Card already exists in this deck');
	}

	const maxPositionResult = await supabase
		.from('deck_cards')
		.select('position')
		.eq('deck_id', input.deck_id)
		.order('position', { ascending: false })
		.limit(1)
		.single();

	const nextPosition = maxPositionResult.data ? maxPositionResult.data.position + 1 : 0;

	const { data, error } = await supabase
		.from('deck_cards')
		.insert({
			deck_id: input.deck_id,
			card_id: input.card_id,
			category: input.category || null,
			is_pinned: input.is_pinned || false,
			position: input.position !== undefined ? input.position : nextPosition
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to add card to deck: ${error.message}`);
	}

	return data;
}

export async function updateDeckCard(
	supabase: SupabaseClient,
	input: UpdateDeckCardInput
): Promise<DeckCard> {
	const updateData: Record<string, unknown> = {};

	if (input.category !== undefined) updateData.category = input.category;
	if (input.is_pinned !== undefined) updateData.is_pinned = input.is_pinned;
	if (input.position !== undefined) updateData.position = input.position;

	const { data, error } = await supabase
		.from('deck_cards')
		.update(updateData)
		.eq('id', input.id)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update deck card: ${error.message}`);
	}

	return data;
}

export async function moveDeckCard(
	supabase: SupabaseClient,
	input: MoveDeckCardInput
): Promise<void> {
	const { error } = await supabase
		.from('deck_cards')
		.update({
			position: input.position
		})
		.eq('id', input.id);

	if (error) {
		throw new Error(`Failed to move deck card: ${error.message}`);
	}
}

export async function removeCardFromDeck(supabase: SupabaseClient, id: string): Promise<void> {
	const { error } = await supabase.from('deck_cards').delete().eq('id', id);

	if (error) {
		throw new Error(`Failed to remove card from deck: ${error.message}`);
	}
}

export async function togglePinCard(
	supabase: SupabaseClient,
	id: string,
	isPinned: boolean
): Promise<DeckCard> {
	const { data, error } = await supabase
		.from('deck_cards')
		.update({ is_pinned: isPinned })
		.eq('id', id)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to toggle pin card: ${error.message}`);
	}

	return data;
}

export async function updateCardCategory(
	supabase: SupabaseClient,
	id: string,
	category: string | null
): Promise<DeckCard> {
	const { data, error } = await supabase
		.from('deck_cards')
		.update({ category })
		.eq('id', id)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update card category: ${error.message}`);
	}

	return data;
}

export async function bulkAddCardsToDeck(
	supabase: SupabaseClient,
	deckId: string,
	cardIds: string[],
	category?: string | null
): Promise<DeckCard[]> {
	const { data: existingCards } = await supabase
		.from('deck_cards')
		.select('card_id')
		.eq('deck_id', deckId)
		.in('card_id', cardIds);

	const existingCardIds = new Set(existingCards?.map((c) => c.card_id) || []);
	const newCardIds = cardIds.filter((id) => !existingCardIds.has(id));

	if (newCardIds.length === 0) {
		throw new Error('All cards already exist in this deck');
	}

	const maxPositionResult = await supabase
		.from('deck_cards')
		.select('position')
		.eq('deck_id', deckId)
		.order('position', { ascending: false })
		.limit(1)
		.single();

	const startPosition = maxPositionResult.data ? maxPositionResult.data.position + 1 : 0;

	const cardsToInsert = newCardIds.map((cardId, index) => ({
		deck_id: deckId,
		card_id: cardId,
		category: category || null,
		is_pinned: false,
		position: startPosition + index
	}));

	const { data, error } = await supabase.from('deck_cards').insert(cardsToInsert).select();

	if (error) {
		throw new Error(`Failed to bulk add cards to deck: ${error.message}`);
	}

	return data || [];
}
