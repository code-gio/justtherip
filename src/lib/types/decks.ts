export type DeckFolderType = 'folder' | 'deck';

export interface DeckFolder {
	id: string;
	name: string;
	type: DeckFolderType;
	status: string;
	packages: string[] | null;
	parent_id: string | null;
	position: number;
	created_at: string;
	updated_at: string;
}

export interface DeckFolderWithChildren extends DeckFolder {
	children: DeckFolderWithChildren[];
}
