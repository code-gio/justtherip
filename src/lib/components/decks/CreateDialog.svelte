<script lang="ts">
	import type { DeckFolderType } from '$lib/types/decks';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	interface Props {
		open?: boolean;
		type: DeckFolderType;
		parentId?: string | null;
		onClose: () => void;
		onSubmit: (formData: {
			name: string;
			type: DeckFolderType;
			status: string;
			packages: string[] | null;
			parent_id: string | null;
		}) => void;
	}

	let {
		open = $bindable(false),
		type,
		parentId,
		onClose,
		onSubmit
	}: Props = $props();

	let name = $state('');
	let status = $state('draft');
	let packages = $state<string[] | null>(null);
	let isSubmitting = $state(false);

	const statusOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'active', label: 'Active' },
		{ value: 'archived', label: 'Archived' }
	];

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim()) return;

		isSubmitting = true;
		onSubmit({
			name: name.trim(),
			type,
			status,
			packages,
			parent_id: parentId || null
		});
		isSubmitting = false;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (!newOpen) {
			name = '';
			status = 'draft';
			packages = null;
			onClose();
		}
	}
</script>

<Dialog.Root bind:open={open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Create New {type === 'folder' ? 'Folder' : 'Deck'}</Dialog.Title>
			<Dialog.Description>
				Enter the details for your new {type === 'folder' ? 'folder' : 'deck'}.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Name *</Label>
				<Input
					id="name"
					bind:value={name}
					placeholder={`Enter ${type} name`}
					required
					disabled={isSubmitting}
				/>
			</div>

			{#if type === 'deck'}
				<div class="space-y-2">
					<Label for="status">Status</Label>
					<Select.Root bind:value={status}>
						<Select.Trigger id="status">
							{statusOptions.find((opt) => opt.value === status)?.label || 'Select status'}
						</Select.Trigger>
						<Select.Content>
							{#each statusOptions as option}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			{/if}

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting || !name.trim()}>
					{isSubmitting ? 'Creating...' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
