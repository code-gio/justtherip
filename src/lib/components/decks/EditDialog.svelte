<script lang="ts">
	import type { DeckFolder } from '$lib/types/decks';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	interface Props {
		open?: boolean;
		item: DeckFolder | null;
		onClose: () => void;
		onSubmit: (formData: { id: string; name: string; status: string; packages: string[] | null }) => void;
	}

	let {
		open = $bindable(false),
		item,
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

	$effect(() => {
		if (item) {
			name = item.name;
			status = item.status || 'draft';
			packages = item.packages;
		}
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim() || !item) return;

		isSubmitting = true;
		onSubmit({
			id: item.id,
			name: name.trim(),
			status,
			packages
		});
		isSubmitting = false;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (!newOpen) {
			onClose();
		}
	}
</script>

<Dialog.Root bind:open={open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Edit {item?.type === 'folder' ? 'Folder' : 'Deck'}</Dialog.Title>
			<Dialog.Description>Update the details for this {item?.type || 'item'}.</Dialog.Description>
		</Dialog.Header>

		{#if item}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name *</Label>
					<Input
						id="name"
						bind:value={name}
						placeholder="Enter name"
						required
						disabled={isSubmitting}
					/>
				</div>

				{#if item.type === 'deck'}
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
						{isSubmitting ? 'Saving...' : 'Save'}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
