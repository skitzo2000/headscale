<script lang="ts">
	import type { FormField } from '$lib/api';

	let {
		field,
		onUpdate,
		onDelete
	}: {
		field: FormField;
		onUpdate: (field: Partial<Omit<FormField, 'id' | 'order'>>) => void;
		onDelete: () => void;
	} = $props();

	const FIELD_TYPES = [
		{ value: 'short_text', label: 'Short Text' },
		{ value: 'long_text', label: 'Long Text' },
		{ value: 'single_choice', label: 'Single Choice' },
		{ value: 'multiple_choice', label: 'Multiple Choice' },
		{ value: 'dropdown', label: 'Dropdown' },
		{ value: 'number', label: 'Number' },
		{ value: 'email', label: 'Email' },
		{ value: 'date', label: 'Date' }
	] as const;

	const hasOptions = $derived(
		field.type === 'single_choice' || field.type === 'multiple_choice' || field.type === 'dropdown'
	);

	let newOption = $state('');

	function addOption() {
		const trimmed = newOption.trim();
		if (!trimmed) return;
		const updated = [...(field.options ?? []), trimmed];
		onUpdate({ options: updated });
		newOption = '';
	}

	function removeOption(index: number) {
		const updated = (field.options ?? []).filter((_, i) => i !== index);
		onUpdate({ options: updated });
	}

	function moveOption(index: number, direction: -1 | 1) {
		const opts = [...(field.options ?? [])];
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= opts.length) return;
		[opts[index], opts[newIndex]] = [opts[newIndex], opts[index]];
		onUpdate({ options: opts });
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
	<div class="flex items-start justify-between gap-4 mb-4">
		<div class="flex-1 space-y-3">
			<div class="flex gap-3">
				<div class="flex-1">
					<label class="block text-xs font-medium text-gray-500 mb-1">Label</label>
					<input
						type="text"
						value={field.label}
						oninput={(e) => onUpdate({ label: (e.target as HTMLInputElement).value })}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
						placeholder="Field label"
					/>
				</div>
				<div class="w-44">
					<label class="block text-xs font-medium text-gray-500 mb-1">Type</label>
					<select
						value={field.type}
						onchange={(e) => onUpdate({ type: (e.target as HTMLSelectElement).value })}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
					>
						{#each FIELD_TYPES as ft}
							<option value={ft.value}>{ft.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div>
				<label class="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
				<input
					type="text"
					value={field.description ?? ''}
					oninput={(e) => onUpdate({ description: (e.target as HTMLInputElement).value })}
					class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
					placeholder="Help text for this field"
				/>
			</div>
		</div>

		<button
			onclick={onDelete}
			class="mt-5 rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
			title="Delete field"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
			</svg>
		</button>
	</div>

	<div class="flex items-center gap-4 mb-4">
		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				checked={field.required}
				onchange={(e) => onUpdate({ required: (e.target as HTMLInputElement).checked })}
				class="h-4 w-4 rounded text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
			/>
			<span class="text-sm text-gray-600">Required</span>
		</label>
	</div>

	{#if hasOptions}
		<div class="border-t border-gray-100 pt-4">
			<label class="block text-xs font-medium text-gray-500 mb-2">Options</label>
			<div class="space-y-2 mb-3">
				{#each field.options ?? [] as option, index}
					<div class="flex items-center gap-2">
						<div class="flex flex-col gap-0.5">
							<button
								onclick={() => moveOption(index, -1)}
								disabled={index === 0}
								class="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs leading-none"
								title="Move up"
							>&#9650;</button>
							<button
								onclick={() => moveOption(index, 1)}
								disabled={index === (field.options?.length ?? 0) - 1}
								class="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs leading-none"
								title="Move down"
							>&#9660;</button>
						</div>
						<span class="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">{option}</span>
						<button
							onclick={() => removeOption(index)}
							class="rounded-md p-1 text-gray-400 hover:text-red-500 transition-colors"
							title="Remove option"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={newOption}
					onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
					class="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
					placeholder="Add an option"
				/>
				<button
					onclick={addOption}
					class="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
				>
					Add
				</button>
			</div>
		</div>
	{/if}
</div>
