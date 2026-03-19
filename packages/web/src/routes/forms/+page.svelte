<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { forms, type Form } from '$lib/api';
	import { getIsAuthenticated } from '$lib/stores/auth';
	import { getBrand } from '$lib/stores/brand';

	const brand = $derived(getBrand());
	const isAuthenticated = $derived(getIsAuthenticated());

	let formsList = $state<Form[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showCreate = $state(false);
	let newTitle = $state('');
	let newDescription = $state('');
	let creating = $state(false);

	onMount(() => {
		if (!isAuthenticated) {
			goto('/login');
			return;
		}
		loadForms();
	});

	async function loadForms() {
		loading = true;
		error = '';
		try {
			formsList = await forms.list();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load forms';
		} finally {
			loading = false;
		}
	}

	async function handleCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!newTitle.trim()) return;
		creating = true;
		try {
			const form = await forms.create(newTitle.trim(), newDescription.trim());
			goto(`/forms/${form.id}/edit`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create form';
		} finally {
			creating = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Forms - {brand.metadata.title}</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-2xl font-bold" style="color: var(--color-brand-text)">My Forms</h1>
		<button
			onclick={() => (showCreate = true)}
			class="rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
			style="background-color: var(--color-brand-primary)"
		>
			New Form
		</button>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{error}
		</div>
	{/if}

	{#if showCreate}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold mb-4">Create New Form</h2>
			<form onsubmit={handleCreate} class="space-y-4">
				<div>
					<label for="form-title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
					<input
						id="form-title"
						type="text"
						bind:value={newTitle}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:outline-none"
						placeholder="My awesome form"
					/>
				</div>
				<div>
					<label for="form-desc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea
						id="form-desc"
						bind:value={newDescription}
						rows="2"
						class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:outline-none resize-y"
						placeholder="What is this form about?"
					></textarea>
				</div>
				<div class="flex gap-3">
					<button
						type="submit"
						disabled={creating}
						class="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
						style="background-color: var(--color-brand-primary)"
					>
						{creating ? 'Creating...' : 'Create Form'}
					</button>
					<button
						type="button"
						onclick={() => { showCreate = false; newTitle = ''; newDescription = ''; }}
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-16">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style="border-top-color: var(--color-brand-primary)"></div>
		</div>
	{:else if formsList.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16">
			<p class="text-lg font-medium text-gray-500">No forms yet</p>
			<p class="mt-1 text-sm text-gray-400">Create your first form to get started</p>
			<button
				onclick={() => (showCreate = true)}
				class="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
				style="background-color: var(--color-brand-primary)"
			>
				Create Form
			</button>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each formsList as form}
				<a
					href="/forms/{form.id}/edit"
					class="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md no-underline"
				>
					<div class="flex items-start justify-between mb-2">
						<h3 class="text-base font-semibold text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-primary)] transition-colors">
							{form.title}
						</h3>
						<span
							class="ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
							class:bg-green-100={form.published}
							class:text-green-700={form.published}
							class:bg-gray-100={!form.published}
							class:text-gray-500={!form.published}
						>
							{form.published ? 'Published' : 'Draft'}
						</span>
					</div>
					{#if form.description}
						<p class="text-sm text-gray-500 line-clamp-2 mb-3">{form.description}</p>
					{/if}
					<div class="flex items-center justify-between text-xs text-gray-400">
						<span>{form.responseCount ?? 0} responses</span>
						<span>{formatDate(form.createdAt)}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
