<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/api';
	import { loginUser } from '$lib/stores/auth';
	import { getBrand } from '$lib/stores/brand';

	const brand = $derived(getBrand());

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await auth.login(email, password);
			loginUser(res.token, res.user);
			goto('/forms');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Log in - {brand.metadata.title}</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-2xl font-bold" style="color: var(--color-brand-text)">Welcome back</h1>
			<p class="mt-2 text-sm text-gray-500">Log in to your account</p>
		</div>

		{#if error}
			<div class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{error}
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-5">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					autocomplete="email"
					class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:outline-none"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					autocomplete="current-password"
					class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:outline-none"
					placeholder="Your password"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
				style="background-color: var(--color-brand-primary)"
			>
				{loading ? 'Logging in...' : 'Log in'}
			</button>
		</form>

		<p class="mt-6 text-center text-sm text-gray-500">
			Don't have an account?
			<a href="/register" class="font-medium hover:underline" style="color: var(--color-brand-primary)">Sign up</a>
		</p>
	</div>
</div>
