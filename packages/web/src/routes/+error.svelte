<script lang="ts">
	import { page } from '$app/state';
	import { getBrand } from '$lib/stores/brand';

	const brand = $derived(getBrand());
	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Something went wrong');
</script>

<svelte:head>
	<title>Error {status} - {brand.metadata.title}</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
	<h1 class="text-6xl font-bold" style="color: var(--color-brand-primary)">{status}</h1>
	<p class="mt-4 text-lg text-gray-600">{message}</p>
	<a
		href="/"
		class="mt-8 rounded-lg px-6 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:opacity-90"
		style="background-color: var(--color-brand-primary)"
	>
		Go Home
	</a>
</div>
