<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthState, getIsAuthenticated, logoutUser } from '$lib/stores/auth';
	import { getBrand } from '$lib/stores/brand';

	const brand = $derived(getBrand());
	const authState = $derived(getAuthState());
	const isAuthenticated = $derived(getIsAuthenticated());

	function handleLogout() {
		logoutUser();
		goto('/');
	}
</script>

<nav class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center gap-2 text-lg font-bold no-underline" style="color: var(--color-brand-primary)">
				{#if brand.logo}
					<img src={brand.logo} alt={brand.name} class="h-8 w-8 object-contain" />
				{/if}
				<span>{brand.name}</span>
			</a>

			{#if isAuthenticated}
				<div class="hidden sm:flex items-center gap-4">
					<a
						href="/forms"
						class="text-sm font-medium text-gray-600 hover:text-[var(--color-brand-primary)] transition-colors no-underline"
					>
						My Forms
					</a>
				</div>
			{/if}
		</div>

		<div class="flex items-center gap-3">
			{#if isAuthenticated}
				<span class="hidden sm:inline text-sm text-gray-600">{authState.user?.name}</span>
				<button
					onclick={handleLogout}
					class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
				>
					Logout
				</button>
			{:else}
				<a
					href="/login"
					class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors no-underline"
				>
					Log in
				</a>
				<a
					href="/register"
					class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors no-underline"
					style="background-color: var(--color-brand-primary)"
				>
					Sign up
				</a>
			{/if}
		</div>
	</div>
</nav>
