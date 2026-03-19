<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { forms, responses as responsesApi, type Form, type FormResponse } from '$lib/api';
	import { getIsAuthenticated } from '$lib/stores/auth';
	import { getBrand } from '$lib/stores/brand';

	const brand = $derived(getBrand());
	const isAuthenticated = $derived(getIsAuthenticated());
	const formId = $derived(page.params.id);

	let form = $state<Form | null>(null);
	let responseList = $state<FormResponse[]>([]);
	let loading = $state(true);
	let error = $state('');
	let expandedId = $state<string | null>(null);

	const totalResponses = $derived(responseList.length);
	const latestDate = $derived(
		responseList.length > 0
			? new Date(
					Math.max(...responseList.map((r) => new Date(r.submittedAt).getTime()))
				).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
			: 'N/A'
	);

	onMount(() => {
		if (!isAuthenticated) {
			goto('/login');
			return;
		}
		loadData();
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [f, r] = await Promise.all([forms.get(formId), responsesApi.list(formId)]);
			form = f;
			responseList = r;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load responses';
		} finally {
			loading = false;
		}
	}

	async function handleExport() {
		try {
			const blob = await responsesApi.exportCsv(formId);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${form?.title ?? 'responses'}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to export';
		}
	}

	function getFieldLabel(fieldId: string): string {
		return form?.fields.find((f) => f.id === fieldId)?.label ?? fieldId;
	}

	function truncate(val: unknown, maxLen: number = 50): string {
		const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
		return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Responses - {form?.title ?? 'Form'} - {brand.metadata.title}</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
	{#if loading}
		<div class="flex items-center justify-center py-24">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style="border-top-color: var(--color-brand-primary)"></div>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-6">
			<a href="/forms/{formId}/edit" class="text-sm text-gray-500 hover:text-gray-700 no-underline">&larr; Back to editor</a>
			<h1 class="mt-2 text-2xl font-bold" style="color: var(--color-brand-text)">Responses: {form?.title}</h1>
		</div>

		{#if error}
			<div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
		{/if}

		<!-- Summary bar -->
		<div class="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div class="flex gap-8">
				<div>
					<p class="text-xs text-gray-500">Total Responses</p>
					<p class="text-2xl font-bold" style="color: var(--color-brand-primary)">{totalResponses}</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">Latest Response</p>
					<p class="text-sm font-medium text-gray-700">{latestDate}</p>
				</div>
			</div>
			<button
				onclick={handleExport}
				disabled={responseList.length === 0}
				class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
			>
				Export CSV
			</button>
		</div>

		{#if responseList.length === 0}
			<div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16">
				<p class="text-lg font-medium text-gray-500">No responses yet</p>
				<p class="mt-1 text-sm text-gray-400">Share your form to start collecting responses</p>
			</div>
		{:else}
			<!-- Table -->
			<div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 bg-gray-50">
						<tr>
							<th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
							{#each form?.fields ?? [] as field}
								<th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{field.label}</th>
							{/each}
							<th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Submitted</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each responseList as response, index}
							<tr
								class="cursor-pointer hover:bg-gray-50 transition-colors"
								onclick={() => (expandedId = expandedId === response.id ? null : response.id)}
							>
								<td class="px-4 py-3 text-gray-400">{index + 1}</td>
								{#each form?.fields ?? [] as field}
									<td class="px-4 py-3 text-gray-700 max-w-[200px]">
										{#if expandedId === response.id}
											{String(response.data[field.id] ?? '')}
										{:else}
											{truncate(response.data[field.id])}
										{/if}
									</td>
								{/each}
								<td class="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(response.submittedAt)}</td>
							</tr>

							{#if expandedId === response.id}
								<tr class="bg-gray-50">
									<td colspan={((form?.fields.length ?? 0) + 2)} class="px-6 py-4">
										<div class="space-y-3">
											{#each form?.fields ?? [] as field}
												<div>
													<p class="text-xs font-medium text-gray-500">{field.label}</p>
													<p class="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">
														{#if Array.isArray(response.data[field.id])}
															{(response.data[field.id] as string[]).join(', ')}
														{:else}
															{String(response.data[field.id] ?? '-')}
														{/if}
													</p>
												</div>
											{/each}
											<p class="text-xs text-gray-400">Submitted: {formatDate(response.submittedAt)}</p>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
