<script lang="ts">
	import type { DeckFolderType, DeckFolderStatus } from '$lib/types/decks';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { IconLoader2 } from '@tabler/icons-svelte';

	interface Props {
		open?: boolean;
		type: DeckFolderType;
		parentId?: string | null;
		isSubmitting?: boolean;
		onClose: () => void;
		onSubmit: (data: {
			name: string;
			type: DeckFolderType;
			status: DeckFolderStatus;
			packages: string[] | null;
			parent_id: string | null;
		}) => void;
	}

	let { open = $bindable(false), type, parentId = null, isSubmitting = false, onClose, onSubmit }: Props = $props();

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

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim() || isSubmitting) return;

		const packages = allPackages ? null : selectedPackages.length > 0 ? selectedPackages : null;

		onSubmit({
			name: name.trim(),
			type,
			status,
			packages,
			parent_id: parentId
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
			name = '';
			status = 'private';
			allPackages = true;
			selectedPackages = [];
			onClose();
		}
	}

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
			<Dialog.Title>Create New {type === 'folder' ? 'Folder' : 'Deck'}</Dialog.Title>
			<Dialog.Description>
				Enter the details for your new {type === 'folder' ? 'folder' : 'deck'}.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={name} placeholder={`Enter ${type} name`} required disabled={isSubmitting} />
			</div>

		<div class="space-y-2">
			<Label for="status">Visibility</Label>
			<Select.Root type="single" name="status" bind:value={status} disabled={isSubmitting}>
				<Select.Trigger id="status" class="w-full" disabled={isSubmitting}>
					{statusOptions.find((opt) => opt.value === status)?.label || 'Select visibility'}
				</Select.Trigger>
				<Select.Content>
					{#each statusOptions as option}
						<Select.Item value={option.value}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

			{#if type === 'deck'}
				<div class="space-y-3">
					<Label>Packages</Label>

					<div class="flex items-center space-x-2">
						<Checkbox id="all-packages" bind:checked={allPackages} />
						<label
							for="all-packages"
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							All Packages
						</label>
					</div>

					{#if !allPackages}
						<div class="space-y-2 ml-6">
							{#each availablePackages as pkg}
								<div class="flex items-center space-x-2">
									<Checkbox
										id={`pkg-${pkg}`}
										checked={selectedPackages.includes(pkg)}
										onCheckedChange={() => togglePackage(pkg)}
										disabled={isSubmitting}
									/>
									<label
										for={`pkg-${pkg}`}
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
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						<IconLoader2 class="mr-2 h-4 w-4 animate-spin" />
						Creating...
					{:else}
						Create {type === 'folder' ? 'Folder' : 'Deck'}
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
