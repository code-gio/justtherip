<script lang="ts">
	import KanbanColumn from './KanbanColumn.svelte';

	interface Props {
		categories: string[];
		fixedColumns: string[];
		cardsByCategory: Record<string, any[]>;
		localFilter: string;
		dragOverCategory: string | null;
		renamingCategory: string | null;
		renameCategoryValue?: string;
		hoveredCard: string | null;
		loadingCards: Set<string>;
		loadingCategories: Set<string>;
		onDragOver: (e: DragEvent, category: string) => void;
		onDragLeave: () => void;
		onDrop: (e: DragEvent, category: string) => void;
		onRenameStart: (category: string) => void;
		onRenameSave: (category: string) => void;
		onDeleteCategory: (category: string) => void;
		onCardDragStart: (e: DragEvent, card: any, category: string) => void;
		onCardDragEnd: (e: DragEvent) => void;
		onCardHover: (cardId: string | null) => void;
		onCardTogglePin: (cardId: string, isPinned: boolean) => void;
		onCardRemove: (deckCardId: string, cardId: string, category: string) => void;
	}

	let {
		categories,
		fixedColumns,
		cardsByCategory,
		localFilter,
		dragOverCategory,
		renamingCategory,
		renameCategoryValue = $bindable(''),
		hoveredCard,
		loadingCards,
		loadingCategories,
		onDragOver,
		onDragLeave,
		onDrop,
		onRenameStart,
		onRenameSave,
		onDeleteCategory,
		onCardDragStart,
		onCardDragEnd,
		onCardHover,
		onCardTogglePin,
		onCardRemove
	}: Props = $props();

	function getFilteredCards(categoryCards: any[]) {
		if (!localFilter.trim()) return categoryCards;

		const query = localFilter.toLowerCase();
		return categoryCards.filter((card) => {
			const cardName = card.cardData?.name?.toLowerCase() || '';
			return cardName.includes(query);
		});
	}

	function getCategoryCount(category: string): number {
		return cardsByCategory[category]?.length || 0;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex gap-3 h-[1800px]">
	<!-- Scrollable Categories Container -->
	<div class="flex gap-3 overflow-x-auto pb-4 flex-1">
		<!-- Regular Categories -->
		{#each categories as category}
			{@const categoryCards = cardsByCategory[category] || []}
			{@const filteredCards = getFilteredCards(categoryCards)}
			{@const count = getCategoryCount(category)}
			{@const isFixed = fixedColumns.includes(category)}

			<div class="flex-shrink-0 w-[240px] h-full">
				<KanbanColumn
					{category}
					cards={filteredCards}
					{count}
					{isFixed}
					isDragOver={dragOverCategory === category}
					isRenaming={renamingCategory === category}
					bind:renamingValue={renameCategoryValue}
					{hoveredCard}
					{loadingCards}
					isLoading={loadingCategories.has(category)}
					onDragOver={(e) => onDragOver(e, category)}
					{onDragLeave}
					onDrop={(e) => onDrop(e, category)}
					{onRenameStart}
					{onRenameSave}
					onDelete={onDeleteCategory}
					{onCardDragStart}
					{onCardDragEnd}
					{onCardHover}
					{onCardTogglePin}
					{onCardRemove}
				/>
			</div>
		{/each}
	</div>

	<!-- Fixed Columns (Sideboard & Maybeboard) - Right Side -->
	<div class="flex flex-col gap-6 flex-shrink-0 w-[240px]">
		{#each fixedColumns as category}
			{@const categoryCards = cardsByCategory[category] || []}
			{@const filteredCards = getFilteredCards(categoryCards)}
			{@const count = getCategoryCount(category)}

			<KanbanColumn
				{category}
				cards={filteredCards}
				{count}
				isFixed={true}
				isDragOver={dragOverCategory === category}
				isRenaming={false}
				renamingValue=""
				{hoveredCard}
				{loadingCards}
				isLoading={loadingCategories.has(category)}
				onDragOver={(e) => onDragOver(e, category)}
				{onDragLeave}
				onDrop={(e) => onDrop(e, category)}
				onRenameStart={() => {}}
				onRenameSave={() => {}}
				onDelete={() => {}}
				{onCardDragStart}
				{onCardDragEnd}
				{onCardHover}
				{onCardTogglePin}
				{onCardRemove}
			/>
		{/each}
	</div>
</div>
