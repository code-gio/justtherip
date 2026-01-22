export type DeckFolderType = 'folder' | 'deck';

export type DeckFolderStatus = 'private' | 'unlisted' | 'public';

export interface DeckFolder {
	id: string;
	name: string;
	type: DeckFolderType;
	status: DeckFolderStatus;
	packages: string[] | null;
	categories: string[] | null;
	user_id: string;
	parent_id: string | null;
	position: number;
	created_at: string;
	updated_at: string;
}

export interface DeckFolderWithChildren extends DeckFolder {
	children: DeckFolderWithChildren[];
}

export interface CreateDeckFolderInput {
	name: string;
	type: DeckFolderType;
	status?: DeckFolderStatus;
	packages?: string[] | null;
	categories?: string[] | null;
	parent_id?: string | null;
	position?: number;
}

export interface UpdateDeckFolderInput {
	id: string;
	name?: string;
	status?: DeckFolderStatus;
	packages?: string[] | null;
	categories?: string[] | null;
	parent_id?: string | null;
	position?: number;
}

export interface MoveDeckFolderInput {
	id: string;
	parent_id: string | null;
	position: number;
}

// Deck Cards Types
export interface DeckCard {
	id: string;
	deck_id: string;
	card_id: string;
	category: string | null;
	is_pinned: boolean;
	position: number;
	created_at: string;
	updated_at: string;
}

export interface CreateDeckCardInput {
	deck_id: string;
	card_id: string;
	category?: string | null;
	is_pinned?: boolean;
	position?: number;
}

export interface UpdateDeckCardInput {
	id: string;
	category?: string | null;
	is_pinned?: boolean;
	position?: number;
}

export interface MoveDeckCardInput {
	id: string;
	position: number;
}
