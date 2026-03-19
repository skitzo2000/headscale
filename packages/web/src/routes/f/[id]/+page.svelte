<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { forms, responses, type Form, ApiError } from '$lib/api';
	import { getBrand } from '$lib/stores/brand';
	import FormFieldComponent from '$lib/components/FormField.svelte';

	const brand = $derived(getBrand());
	const formId = $derived(page.params.id);

	let form = $state<Form | null>(null);
	let loading = $state(true);
	let submitting = $state(false);
	let submitted = $state(false);
	let error = $state('');
	let validationErrors = $state<string[]>([]);
	let fieldValues = $state<Record<string, unknown>>({});

	onMount(async () => {
		try {
			form = await forms.get(formId);
			if (!form.published) {
				error = 'This form is not currently accepting responses.';
				form = null;
			}
		} catch (err) {
			if (err instanceof ApiError && err.status === 404) {
				error = 'Form not found.';
			} else {
				error = err instanceof Error ? err.message : 'Failed to load form';
			}
		} finally {
			loading = false;
		}
	});

	function validate(): boolean {
		if (!form) return false;
		const errors: string[] = [];

		for (const field of form.fields) {
			if (field.required) {
				const value = fieldValues[field.id];
				if (value === undefined || value === null || value === '') {
					errors.push(`"${field.label}" is required`);
				} else if (Array.isArray(value) && value.length === 0) {
					errors.push(`"${field.label}" is required`);
				}
			}
		}

		validationErrors = errors;
		return errors.length === 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate()) return;

		submitting = true;
		error = '';
		try {
			const answersArray = Object.entries(fieldValues)
				.filter(([_, v]) => v !== undefined && v !== null && v !== '')
				.map(([fieldId, value]) => ({ fieldId: Number(fieldId), value }));
			await responses.submit(formId, answersArray);
			submitted = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit response';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{form?.title ?? 'Form'} - {brand.metadata.title}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-12">
	{#if loading}
		<div class="flex items-center justify-center py-24">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style="border-top-color: var(--color-brand-primary)"></div>
		</div>
	{:else if submitted}
		<div class="text-center py-16">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style="background-color: var(--color-brand-secondary)">
				<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<h2 class="text-2xl font-bold" style="color: var(--color-brand-text)">Thank you!</h2>
			<p class="mt-2 text-gray-500">Your response has been submitted successfully.</p>
		</div>
	{:else if error && !form}
		<div class="text-center py-16">
			<h2 class="text-xl font-bold text-gray-700">{error}</h2>
			<a href="/" class="mt-4 inline-block text-sm" style="color: var(--color-brand-primary)">Go home</a>
		</div>
	{:else if form}
		<div class="mb-8">
			<h1 class="text-2xl font-bold" style="color: var(--color-brand-text)">{form.title}</h1>
			{#if form.description}
				<p class="mt-2 text-gray-500">{form.description}</p>
			{/if}
		</div>

		{#if error}
			<div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
		{/if}

		{#if validationErrors.length > 0}
			<div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				<p class="font-medium mb-1">Please fix the following:</p>
				<ul class="list-disc list-inside">
					{#each validationErrors as ve}
						<li>{ve}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<form onsubmit={handleSubmit}>
			{#each form.fields.sort((a, b) => a.order - b.order) as field (field.id)}
				<FormFieldComponent {field} bind:value={fieldValues[field.id]} />
			{/each}

			<button
				type="submit"
				disabled={submitting}
				class="mt-4 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
				style="background-color: var(--color-brand-primary)"
			>
				{submitting ? 'Submitting...' : 'Submit'}
			</button>
		</form>
	{/if}
</div>
