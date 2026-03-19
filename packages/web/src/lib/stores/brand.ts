export interface BrandConfig {
	name: string;
	logo: string | null;
	colors: {
		primary: string;
		secondary: string;
		background: string;
		surface: string;
		text: string;
	};
	metadata: {
		title: string;
		description: string;
	};
}

const DEFAULT_BRAND: BrandConfig = {
	name: 'Forms Platform',
	logo: null,
	colors: {
		primary: '#4F46E5',
		secondary: '#10B981',
		background: '#FFFFFF',
		surface: '#F9FAFB',
		text: '#111827'
	},
	metadata: {
		title: 'Forms Platform',
		description: 'Create and share beautiful forms'
	}
};

let brand = $state<BrandConfig>({ ...DEFAULT_BRAND });

export function getBrand(): BrandConfig {
	return brand;
}

export async function loadBrand(): Promise<void> {
	try {
		const response = await fetch('/brand.json');
		if (response.ok) {
			const data = await response.json();
			brand = { ...DEFAULT_BRAND, ...data, colors: { ...DEFAULT_BRAND.colors, ...data.colors }, metadata: { ...DEFAULT_BRAND.metadata, ...data.metadata } };
		}
	} catch {
		// Keep defaults on failure
	}
}

export function applyBrandColors(): void {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	root.style.setProperty('--color-brand-primary', brand.colors.primary);
	root.style.setProperty('--color-brand-secondary', brand.colors.secondary);
	root.style.setProperty('--color-brand-bg', brand.colors.background);
	root.style.setProperty('--color-brand-surface', brand.colors.surface);
	root.style.setProperty('--color-brand-text', brand.colors.text);
}
