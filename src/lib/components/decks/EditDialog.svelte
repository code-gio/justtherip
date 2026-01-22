<script lang="ts">
	import type { DeckFolder, DeckFolderStatus } from '$lib/types/decks';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { IconLoader2 } from '@tabler/icons-svelte';

	interface Props {
		open?: boolean;
		item: DeckFolder | null;
		isSubmitting?: boolean;
		onClose: () => void;
		onSubmit: (data: {
			id: string;
			name: string;
			status: DeckFolderStatus;
			packages: string[] | null;
		}) => void;
	}

	let { open = $bindable(false), item, isSubmitting = false, onClose, onSubmit }: Props = $props();

	let name = $state('');
	let status = $state<DeckFolderStatus>('private');
	let allPackages = $state(true);
	let selectedPackages = $state<string[]>([]);

	const availablePackages = ['mtg'];

	const statusOptions = [
		{ value: 'private', label: 'Private' },
		{ value: 'unlisted', label: 'Unlisted' },
		{ value: 'public', label: 'Public' }
	];

	$effect(() => {
		if (item && open) {
			name = item.name;
			status = item.status;
			if (item.type === 'deck') {
				if (!item.packages || item.packages.length === 0) {
					allPackages = true;
					selectedPackages = [];
				} else {
					allPackages = false;
					selectedPackages = item.packages;
				}
			}
		}
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim() || !item || isSubmitting) return;
		
		// Validate packages for decks
		if (item.type === 'deck' && !allPackages && selectedPackages.length === 0) {
			return;
		}

		const packages =
			item.type === 'deck'
				? allPackages
					? null
					: selectedPackages.length > 0
						? selectedPackages
						: null
				: item.packages;

		onSubmit({
			id: item.id,
			name: name.trim(),
			status,
			packages
		});
	}

	function resetForm() {
		name = '';
		status = 'private';
		allPackages = true;
		selectedPackages = [];
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (!newOpen) {
			resetForm();
			onClose();
		}
	}

	$effect(() => {
		if (!open && !isSubmitting) {
			resetForm();
		}
	});

	function togglePackage(pkg: string) {
		if (selectedPackages.includes(pkg)) {
			selectedPackages = selectedPackages.filter((p) => p !== pkg);
		} else {
			selectedPackages = [...selectedPackages, pkg];
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit {item?.type === 'folder' ? 'Folder' : 'Deck'}</Dialog.Title>
			<Dialog.Description>
				Update the details for this {item?.type || 'item'}.
			</Dialog.Description>
		</Dialog.Header>

		{#if item}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="edit-name">Name</Label>
					<Input id="edit-name" bind:value={name} placeholder="Enter name" required disabled={isSubmitting} />
				</div>

			<div class="space-y-2">
				<Label for="edit-status">Visibility</Label>
				<Select.Root type="single" name="edit-status" bind:value={status} disabled={isSubmitting}>
					<Select.Trigger id="edit-status" class="w-full" disabled={isSubmitting}>
						{statusOptions.find((opt) => opt.value === status)?.label || 'Select visibility'}
					</Select.Trigger>
					<Select.Content>
						{#each statusOptions as option}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

				{#if item.type === 'deck'}
					<div class="space-y-3">
						<Label>Packages</Label>

						<div class="flex items-center space-x-2">
							<Checkbox id="edit-all-packages" bind:checked={allPackages} disabled={isSubmitting} />
							<label
								for="edit-all-packages"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								All Packages
							</label>
						</div>

					{#if !allPackages}
						<div class="space-y-2 ml-6">
							{#if selectedPackages.length === 0}
								<p class="text-sm text-red-500">Please select at least one package</p>
							{/if}
							{#each availablePackages as pkg}
								<div class="flex items-center space-x-2">
									<Checkbox
										id={`edit-pkg-${pkg}`}
										checked={selectedPackages.includes(pkg)}
										onCheckedChange={() => togglePackage(pkg)}
										disabled={isSubmitting}
									/>
									<label
										for={`edit-pkg-${pkg}`}
										class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
									>
										{pkg}
									</label>
								</div>
							{/each}
						</div>
					{/if}
					</div>
				{/if}

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>Cancel</Button>
				<Button type="submit" disabled={isSubmitting || (item?.type === 'deck' && !allPackages && selectedPackages.length === 0)}>
					{#if isSubmitting}
						<IconLoader2 class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else}
						Save Changes
					{/if}
				</Button>
			</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
