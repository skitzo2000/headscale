<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { forms, type Form, type FormField } from '$lib/api';
	import { getIsAuthenticated } from '$lib/stores/auth';
	import { getBrand } from '$lib/stores/brand';
	import FieldEditor from '$lib/components/FieldEditor.svelte';

	const brand = $derived(getBrand());
	const isAuthenticated = $derived(getIsAuthenticated());
	const formId = $derived(page.params.id);

	let form = $state<Form | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	let title = $state('');
	let description = $state('');
	let published = $state(false);

	onMount(() => {
		if (!isAuthenticated) {
			goto('/login');
			return;
		}
		loadForm();
	});

	async function loadForm() {
		loading = true;
		error = '';
		try {
			form = await forms.get(formId);
			title = form.title;
			description = form.description;
			published = form.published;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load form';
		} finally {
			loading = false;
		}
	}

	function scheduleSave() {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(saveForm, 1000);
	}

	async function saveForm() {
		if (!form) return;
		saving = true;
		try {
			form = await forms.update(formId, { title, description, published });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}

	async function addField() {
		if (!form) return;
		try {
			const field = await forms.addField(formId, {
				type: 'short_text',
				label: 'New Field',
				required: false
			});
			form = { ...form, fields: [...form.fields, field] };
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to add field';
		}
	}

	async function handleFieldUpdate(fieldId: string, updates: Partial<Omit<FormField, 'id' | 'order'>>) {
		if (!form) return;
		try {
			const updated = await forms.updateField(formId, fieldId, updates);
			form = {
				...form,
				fields: form.fields.map((f) => (f.id === fieldId ? updated : f))
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update field';
		}
	}

	async function handleFieldDelete(fieldId: string) {
		if (!form) return;
		try {
			await forms.deleteField(formId, fieldId);
			form = { ...form, fields: form.fields.filter((f) => f.id !== fieldId) };
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete field';
		}
	}

	async function moveField(index: number, direction: -1 | 1) {
		if (!form) return;
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= form.fields.length) return;

		const fields = [...form.fields];
		[fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
		form = { ...form, fields };

		try {
			await forms.reorderFields(
				formId,
				fields.map((f) => f.id)
			);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to reorder fields';
		}
	}
</script>

<svelte:head>
	<title>{title || 'Edit Form'} - {brand.metadata.title}</title>
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center py-24">
		<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style="border-top-color: var(--color-brand-primary)"></div>
	</div>
{:else if error && !form}
	<div class="mx-auto max-w-3xl px-4 py-12">
		<div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
		<a href="/forms" class="mt-4 inline-block text-sm" style="color: var(--color-brand-primary)">Back to forms</a>
	</div>
{:else if form}
	<!-- Top bar -->
	<div class="sticky top-16 z-40 border-b border-gray-200 bg-white px-4 py-3">
		<div class="mx-auto flex max-w-6xl items-center justify-between">
			<a href="/forms" class="text-sm text-gray-500 hover:text-gray-700 no-underline">
				&larr; Back to forms
			</a>
			<div class="flex items-center gap-3">
				{#if saving}
					<span class="text-xs text-gray-400">Saving...</span>
				{/if}
				<a
					href="/forms/{formId}/responses"
					class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors no-underline"
				>
					Responses
				</a>
				<a
					href="/f/{formId}"
					target="_blank"
					class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors no-underline"
				>
					Preview
				</a>
				<button
					onclick={saveForm}
					class="rounded-lg px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
					style="background-color: var(--color-brand-primary)"
				>
					Save
				</button>
			</div>
		</div>
	</div>

	{#if error}
		<div class="mx-auto max-w-6xl px-4 mt-4">
			<div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
		</div>
	{/if}

	<div class="mx-auto max-w-6xl px-4 py-8">
		<div class="grid gap-8 lg:grid-cols-[300px_1fr]">
			<!-- Left sidebar: form settings -->
			<div class="space-y-5">
				<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
					<h2 class="text-sm font-semibold text-gray-700 mb-4">Form Settings</h2>

					<div class="space-y-4">
						<div>
							<label for="edit-title" class="block text-xs font-medium text-gray-500 mb-1">Title</label>
							<input
								id="edit-title"
								type="text"
								bind:value={title}
								oninput={scheduleSave}
								class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
							/>
						</div>

						<div>
							<label for="edit-desc" class="block text-xs font-medium text-gray-500 mb-1">Description</label>
							<textarea
								id="edit-desc"
								bind:value={description}
								oninput={scheduleSave}
								rows="3"
								class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none resize-y"
							></textarea>
						</div>

						<label class="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={published}
								onchange={saveForm}
								class="h-4 w-4 rounded text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
							/>
							<div>
								<span class="text-sm font-medium text-gray-700">Published</span>
								<p class="text-xs text-gray-500">Make form publicly accessible</p>
							</div>
						</label>
					</div>
				</div>

				{#if form.published}
					<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
						<h3 class="text-sm font-semibold text-gray-700 mb-2">Share Link</h3>
						<div class="flex items-center gap-2">
							<input
								type="text"
								value="{typeof window !== 'undefined' ? window.location.origin : ''}/f/{formId}"
								readonly
								class="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600"
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Main: field editor -->
			<div>
				<div class="space-y-4">
					{#each form.fields as field, index (field.id)}
						<div class="flex gap-2">
							<div class="flex flex-col gap-1 pt-5">
								<button
									onclick={() => moveField(index, -1)}
									disabled={index === 0}
									class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 transition-colors"
									title="Move up"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
									</svg>
								</button>
								<button
									onclick={() => moveField(index, 1)}
									disabled={index === form!.fields.length - 1}
									class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 transition-colors"
									title="Move down"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
							</div>
							<div class="flex-1">
								<FieldEditor
									{field}
									onUpdate={(updates) => handleFieldUpdate(field.id, updates)}
									onDelete={() => handleFieldDelete(field.id)}
								/>
							</div>
						</div>
					{/each}
				</div>

				<button
					onclick={addField}
					class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-colors"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Add Field
				</button>
			</div>
		</div>
	</div>
{/if}
