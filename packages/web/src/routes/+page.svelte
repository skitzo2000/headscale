<script lang="ts">
	import { getIsAuthenticated } from '$lib/stores/auth';
	import { getBrand } from '$lib/stores/brand';

	const brand = $derived(getBrand());
	const isAuthenticated = $derived(getIsAuthenticated());
</script>

<svelte:head>
	<title>{brand.metadata.title}</title>
	<meta name="description" content={brand.metadata.description} />
</svelte:head>

<div class="flex flex-col items-center justify-center px-4 py-24 sm:py-32">
	<div class="mx-auto max-w-2xl text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-6xl" style="color: var(--color-brand-text)">
			{brand.name}
		</h1>
		<p class="mt-6 text-lg leading-8 text-gray-600">
			Create beautiful forms in minutes. Collect responses, analyze data, and share with your team.
		</p>
		<div class="mt-10 flex items-center justify-center gap-4">
			{#if isAuthenticated}
				<a
					href="/forms"
					class="rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors no-underline hover:opacity-90"
					style="background-color: var(--color-brand-primary)"
				>
					My Forms
				</a>
			{:else}
				<a
					href="/register"
					class="rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors no-underline hover:opacity-90"
					style="background-color: var(--color-brand-primary)"
				>
					Get Started
				</a>
				<a
					href="/login"
					class="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition-colors no-underline hover:bg-gray-50"
				>
					Log in
				</a>
			{/if}
		</div>
	</div>

	<div class="mt-20 grid max-w-4xl gap-8 sm:grid-cols-3">
		<div class="text-center">
			<div
				class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
				style="background-color: var(--color-brand-primary); opacity: 0.1"
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
					style="color: var(--color-brand-primary)"
				>
					+
				</div>
			</div>
			<h3 class="mt-4 text-base font-semibold">Create Forms</h3>
			<p class="mt-2 text-sm text-gray-500">Drag-and-drop builder with multiple field types.</p>
		</div>
		<div class="text-center">
			<div
				class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
				style="background-color: var(--color-brand-secondary); opacity: 0.1"
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
					style="color: var(--color-brand-secondary)"
				>
					&#9993;
				</div>
			</div>
			<h3 class="mt-4 text-base font-semibold">Collect Responses</h3>
			<p class="mt-2 text-sm text-gray-500">Share links and collect responses from anyone.</p>
		</div>
		<div class="text-center">
			<div
				class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
				style="background-color: var(--color-brand-primary); opacity: 0.1"
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
					style="color: var(--color-brand-primary)"
				>
					&#8595;
				</div>
			</div>
			<h3 class="mt-4 text-base font-semibold">Export Data</h3>
			<p class="mt-2 text-sm text-gray-500">Download responses as CSV for analysis.</p>
		</div>
	</div>
</div>
