<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import {
		IconChevronDown,
		IconLoader2,
		IconUpload,
		IconAlertCircle,
		IconCheck,
		IconArrowLeft,
		IconX
	} from '@tabler/icons-svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		open?: boolean;
		packages: string[] | null;
		selectedCardIds?: Set<string>;
		onClose: () => void;
		onCardsVerified: (cards: any[]) => void;
	}

	let {
		open = $bindable(false),
		packages,
		selectedCardIds = new Set(),
		onClose,
		onCardsVerified
	}: Props = $props();

	let textInput = $state('');
	let fileInput = $state<HTMLInputElement | undefined>(undefined);
	let isVerifying = $state(false);
	let verificationResult = $state<{ found: any[]; notFound: string[] } | null>(null);
	let showExamples = $state(false);
	let showResults = $state(false);

	function parseCardNames(input: string): string[] {
		return input
			.split('\n')
			.map((line: string) => {
				let cleaned = line.trim();
				// Remove quantity prefix (e.g., "2x ", "10x ")
				cleaned = cleaned.replace(/^\d+x?\s+/i, '');
				// Remove parentheses and their content
				cleaned = cleaned.replace(/\([^)]*\)/g, '');
				// Remove square brackets and their content
				cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
				// Remove hash/hashtag prefix
				cleaned = cleaned.replace(/^#\s*/g, '');
				// Remove special markers
				cleaned = cleaned.replace(/\^[^\s]*\^?/g, '');
				// Clean up extra whitespace
				cleaned = cleaned.replace(/\s+/g, ' ').trim();
				return cleaned;
			})
			.filter((line: string) => line.length > 0);
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (file.size > 1024 * 1024) {
			toast.error('File too large', {
				description: 'Maximum file size is 1MB'
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			textInput = content;
		};
		reader.onerror = () => {
			toast.error('Failed to read file');
		};
		reader.readAsText(file);
	}

	async function handleVerify() {
		if (!textInput.trim()) {
			toast.error('Please enter card names');
			return;
		}

		if (!packages || packages.length === 0) {
			toast.error('No packages configured for this deck');
			return;
		}

		const cardNamesArray = parseCardNames(textInput);

		if (cardNamesArray.length === 0) {
			toast.error('No valid card names found');
			return;
		}

		isVerifying = true;
		verificationResult = null;

		try {
			const allFound: any[] = [];
			const notFoundSet = new Set(cardNamesArray);

			// Search in each package table
			for (const pkg of packages) {
				const tableName = `${pkg}_cards`;

				const response = await fetch('/api/cards/bulk-verify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						table: tableName,
						card_names: cardNamesArray,
						game_code: pkg
					})
				});

				if (response.ok) {
					const result = await response.json();
					if (result.found) {
						result.found.forEach((card: any) => {
							allFound.push({
								...card,
								game_code: pkg,
								card_table: tableName
							});
							notFoundSet.delete(card.name);
						});
					}
				}
			}

			verificationResult = {
				found: allFound,
				notFound: Array.from(notFoundSet)
			};

			showResults = true;

			if (allFound.length === 0) {
				toast.warning('No cards found', {
					description: 'None of the card names matched cards in the database'
				});
			} else {
				toast.success(`Found ${allFound.length} card${allFound.length !== 1 ? 's' : ''}`, {
					description:
						notFoundSet.size > 0
							? `${notFoundSet.size} card${notFoundSet.size !== 1 ? 's' : ''} not found`
							: 'All cards found successfully'
				});
			}
		} catch (error) {
			console.error('Error verifying cards:', error);
			toast.error('Verification failed', {
				description: 'An unexpected error occurred'
			});
		} finally {
			isVerifying = false;
		}
	}

	function handleImport() {
		if (!verificationResult || verificationResult.found.length === 0) {
			return;
		}

		// Filter out cards already in deck
		const newCards = verificationResult.found.filter(
			(card) => !selectedCardIds.has(card.id)
		);

		if (newCards.length === 0) {
			toast.info('All cards are already in the deck');
			return;
		}

		onCardsVerified(newCards);

		toast.success('Cards added', {
			description: `${newCards.length} card${newCards.length !== 1 ? 's' : ''} added to the deck`
		});

		// Reset state
		textInput = '';
		verificationResult = null;
		showResults = false;
		open = false;
	}

	function handleClear() {
		textInput = '';
		verificationResult = null;
	}

	function handleBack() {
		showResults = false;
	}

	function handleRemoveCard(cardId: string) {
		if (!verificationResult) return;

		verificationResult = {
			...verificationResult,
			found: verificationResult.found.filter((card) => card.id !== cardId)
		};
	}

	function handleCancel() {
		textInput = '';
		verificationResult = null;
		showResults = false;
		open = false;
		onClose();
	}

	function getCardImageUrl(card: any): string | null {
		if (!card.image_uri) return null;

		if (typeof card.image_uri === 'string') {
			return card.image_uri;
		}

		if (typeof card.image_uri === 'object') {
			return card.image_uri.normal || card.image_uri.small || card.image_uri.large || null;
		}

		return null;
	}

	function getCardPrice(card: any): string {
		if (card.prices) {
			const usd = parseFloat(card.prices.usd || '0');
			const usdFoil = parseFloat(card.prices.usd_foil || '0');
			const maxPrice = Math.max(usd, usdFoil);
			return maxPrice > 0 ? `$${maxPrice.toFixed(2)}` : 'N/A';
		}

		if (card.market_value_cents) {
			return `$${(card.market_value_cents / 100).toFixed(2)}`;
		}

		return 'N/A';
	}

	function isCardInDeck(cardId: string): boolean {
		return selectedCardIds.has(cardId);
	}
</script>

<Dialog.Root bind:open onOpenChange={(newOpen) => !newOpen && handleCancel()}>
	<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Bulk Import Cards</Dialog.Title>
			<Dialog.Description>
				{#if showResults}
					Review the cards found before importing
				{:else}
					Bulk import cards by entering card names or uploading a CSV file
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if !showResults}
			<!-- STEP 1: Input Form -->
			<div class="space-y-6">
				<!-- Formatting Examples -->
				<div class="space-y-2">
					<Button
						variant="outline"
						class="w-full justify-between"
						onclick={() => {
							showExamples = !showExamples;
						}}
					>
						<span>Formatting Examples</span>
						<IconChevronDown
							size={16}
							class="transition-transform duration-200"
							style={showExamples ? 'transform: rotate(180deg)' : ''}
						/>
					</Button>
					{#if showExamples}
						<div class="border rounded-lg p-4 bg-muted/50 space-y-2 text-sm">
							<p class="font-medium">Enter card names, one per line:</p>
							<div class="bg-background rounded p-3 font-mono text-xs space-y-1">
								<div>Lightning Bolt</div>
								<div>Counterspell</div>
								<div>Dark Ritual</div>
								<div>Swords to Plowshares</div>
								<div>Sol Ring</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Upload File -->
				<div class="space-y-2">
					<Label>Upload CSV or Text File</Label>
					<div class="flex gap-2">
						<input
							type="file"
							accept=".csv,.txt"
							class="hidden"
							bind:this={fileInput}
							onchange={handleFileSelect}
						/>
						<Button variant="outline" class="w-full" onclick={() => fileInput?.click()}>
							<IconUpload size={16} class="mr-2" />
							Select file (Max 1MB)
						</Button>
					</div>
					<p class="text-xs text-muted-foreground">Supported formats: CSV, TXT</p>
				</div>

				<!-- Manual Text Input -->
				<div class="space-y-2">
					<Label>Or enter card names manually</Label>
					<Textarea
						bind:value={textInput}
						placeholder="Enter card names, one per line..."
						rows={10}
						class="font-mono text-sm"
					/>
					<div class="flex justify-between items-center">
						<p class="text-xs text-muted-foreground">
							{textInput.trim()
								? textInput
										.trim()
										.split('\n')
										.filter((line) => line.trim()).length
								: 0} lines
						</p>
						{#if textInput.trim()}
							<Button variant="ghost" size="sm" onclick={handleClear}> Clear </Button>
						{/if}
					</div>
				</div>

				<!-- Verify Button -->
				<Button class="w-full" onclick={handleVerify} disabled={!textInput.trim() || isVerifying}>
					{#if isVerifying}
						<IconLoader2 size={16} class="mr-2 animate-spin" />
						Verifying...
					{:else}
						Verify Cards
					{/if}
				</Button>
			</div>
		{:else}
			<!-- STEP 2: Verification Results -->
			<div class="space-y-4">
				<!-- Back Button -->
				<Button variant="outline" onclick={handleBack} class="w-full">
					<IconArrowLeft size={16} class="mr-2" />
					Back to Edit
				</Button>

				<h3 class="font-semibold">Verification Results</h3>

				<!-- Found Cards -->
				{#if verificationResult && verificationResult.found.length > 0}
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<IconCheck size={16} class="text-green-600" />
							<span class="font-medium text-sm">
								Found ({verificationResult.found.length})
							</span>
						</div>
						<div class="max-h-[400px] overflow-y-auto border rounded-lg bg-muted/50 p-3">
							<div class="grid grid-cols-3 gap-3">
								{#each verificationResult.found as card}
									{@const imageUrl = getCardImageUrl(card)}
									{@const price = getCardPrice(card)}
									{@const alreadyInDeck = isCardInDeck(card.id)}
									<div class="relative group">
										<!-- Remove button -->
										<button
											onclick={() => handleRemoveCard(card.id)}
											class="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
											title="Remove card"
										>
											<IconX size={16} />
										</button>

										<!-- Already in deck indicator -->
										{#if alreadyInDeck}
											<div
												class="absolute top-1 left-1 z-10 bg-blue-500 text-white rounded px-2 py-1 text-xs font-semibold"
											>
												In Deck
											</div>
										{/if}

										<div
											class="border-2 border-green-500/50 rounded-lg overflow-hidden bg-background"
										>
											{#if imageUrl}
												<img
													src={imageUrl}
													alt={card.name}
													class="w-full h-auto object-cover"
													loading="lazy"
												/>
											{:else}
												<div
													class="aspect-[2.5/3.5] flex items-center justify-center bg-muted"
												>
													<span class="text-xs text-muted-foreground text-center p-2">
														{card.name}
													</span>
												</div>
											{/if}
											<div
												class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<p class="text-white text-xs font-semibold truncate">
													{card.name}
												</p>
												<div class="flex justify-between items-center mt-1">
													{#if card.set_code}
														<span class="text-white/80 text-xs uppercase">{card.set_code}</span>
													{/if}
													<span class="text-white font-bold text-xs">{price}</span>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- Not Found Cards -->
				{#if verificationResult && verificationResult.notFound.length > 0}
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<IconAlertCircle size={16} class="text-amber-600" />
							<span class="font-medium text-sm">
								Not Found ({verificationResult.notFound.length})
							</span>
						</div>
						<div class="max-h-48 overflow-y-auto border rounded-lg bg-muted/50">
							<div class="p-3 space-y-1">
								{#each verificationResult.notFound as cardName}
									<div class="text-sm text-muted-foreground py-1">
										{cardName}
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- Import Button -->
				{#if verificationResult && verificationResult.found.length > 0}
					<Button class="w-full" onclick={handleImport}>
						Import {verificationResult.found.length} Card{verificationResult.found.length !==
						1
							? 's'
							: ''}
					</Button>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
