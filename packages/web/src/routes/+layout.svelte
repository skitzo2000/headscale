<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { loadBrand, applyBrandColors } from '$lib/stores/brand';
	import { initAuth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		initAuth();
		await loadBrand();
		applyBrandColors();
	});
</script>

<div class="flex min-h-screen flex-col">
	<Navbar />
	<main class="flex-1">
		{@render children()}
	</main>
</div>
