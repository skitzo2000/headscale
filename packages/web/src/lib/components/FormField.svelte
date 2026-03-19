<script lang="ts">
	import type { FormField as FormFieldType } from '$lib/api';

	let {
		field,
		value = $bindable<unknown>(undefined),
		readonly = false
	}: {
		field: FormFieldType;
		value?: unknown;
		readonly?: boolean;
	} = $props();

	let selectedMultiple = $state<string[]>(Array.isArray(value) ? (value as string[]) : []);

	function handleCheckboxChange(option: string, checked: boolean) {
		if (checked) {
			selectedMultiple = [...selectedMultiple, option];
		} else {
			selectedMultiple = selectedMultiple.filter((v) => v !== option);
		}
		value = selectedMultiple;
	}

	const inputClasses =
		'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-500';
	const labelClasses = 'block text-sm font-medium text-[var(--color-brand-text)] mb-1.5';
</script>

<div class="mb-5">
	<label class={labelClasses}>
		{field.label}
		{#if field.required}
			<span class="text-red-500 ml-0.5">*</span>
		{/if}
	</label>

	{#if field.description}
		<p class="text-xs text-gray-500 mb-2">{field.description}</p>
	{/if}

	{#if field.type === 'short_text'}
		<input
			type="text"
			class={inputClasses}
			bind:value
			disabled={readonly}
			required={field.required}
			placeholder="Your answer"
		/>
	{:else if field.type === 'long_text'}
		<textarea
			class="{inputClasses} min-h-[100px] resize-y"
			bind:value
			disabled={readonly}
			required={field.required}
			placeholder="Your answer"
			rows="4"
		></textarea>
	{:else if field.type === 'single_choice'}
		<div class="space-y-2 mt-1">
			{#each field.options ?? [] as option}
				<label class="flex items-center gap-3 cursor-pointer group">
					<input
						type="radio"
						name="field-{field.id}"
						value={option}
						bind:group={value}
						disabled={readonly}
						class="h-4 w-4 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
					/>
					<span class="text-sm text-gray-700 group-hover:text-[var(--color-brand-text)]">{option}</span>
				</label>
			{/each}
		</div>
	{:else if field.type === 'multiple_choice'}
		<div class="space-y-2 mt-1">
			{#each field.options ?? [] as option}
				<label class="flex items-center gap-3 cursor-pointer group">
					<input
						type="checkbox"
						value={option}
						checked={selectedMultiple.includes(option)}
						onchange={(e) => handleCheckboxChange(option, (e.target as HTMLInputElement).checked)}
						disabled={readonly}
						class="h-4 w-4 rounded text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
					/>
					<span class="text-sm text-gray-700 group-hover:text-[var(--color-brand-text)]">{option}</span>
				</label>
			{/each}
		</div>
	{:else if field.type === 'dropdown'}
		<select class={inputClasses} bind:value disabled={readonly} required={field.required}>
			<option value="" disabled selected>Select an option</option>
			{#each field.options ?? [] as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	{:else if field.type === 'number'}
		<input
			type="number"
			class={inputClasses}
			bind:value
			disabled={readonly}
			required={field.required}
			placeholder="0"
		/>
	{:else if field.type === 'email'}
		<input
			type="email"
			class={inputClasses}
			bind:value
			disabled={readonly}
			required={field.required}
			placeholder="you@example.com"
		/>
	{:else if field.type === 'date'}
		<input
			type="date"
			class={inputClasses}
			bind:value
			disabled={readonly}
			required={field.required}
		/>
	{/if}
</div>
