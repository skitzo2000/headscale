import { env } from '$env/dynamic/public';

const BASE_URL = env.PUBLIC_API_URL || 'http://localhost:3001/api';

const TOKEN_KEY = 'forms_auth_token';

export function setToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
	localStorage.removeItem(TOKEN_KEY);
}

interface FetchOptions extends RequestInit {
	skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
	const { skipAuth, ...fetchOptions } = options;
	const url = `${BASE_URL}${path}`;

	const headers = new Headers(fetchOptions.headers);

	if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
		headers.set('Content-Type', 'application/json');
	}

	if (!skipAuth) {
		const token = getToken();
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: response.statusText }));
		throw new ApiError(response.status, error.message || response.statusText);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json();
}

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// --- Auth ---

export interface AuthResponse {
	token: string;
	user: { id: string; email: string; name: string };
}

export const auth = {
	async register(email: string, name: string, password: string): Promise<AuthResponse> {
		const res = await apiFetch<AuthResponse>('/auth/register', {
			method: 'POST',
			body: JSON.stringify({ email, name, password }),
			skipAuth: true
		});
		setToken(res.token);
		return res;
	},

	async login(email: string, password: string): Promise<AuthResponse> {
		const res = await apiFetch<AuthResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
			skipAuth: true
		});
		setToken(res.token);
		return res;
	},

	logout(): void {
		clearToken();
	}
};

// --- Forms ---

export interface FormField {
	id: string;
	type: string;
	label: string;
	description?: string;
	required: boolean;
	options?: string[];
	order: number;
}

export interface Form {
	id: string;
	title: string;
	description: string;
	published: boolean;
	fields: FormField[];
	responseCount: number;
	createdAt: string;
	updatedAt: string;
}

export const forms = {
	async list(): Promise<Form[]> {
		return apiFetch<Form[]>('/forms');
	},

	async create(title: string, description: string): Promise<Form> {
		return apiFetch<Form>('/forms', {
			method: 'POST',
			body: JSON.stringify({ title, description })
		});
	},

	async get(id: string): Promise<Form> {
		return apiFetch<Form>(`/forms/${id}`);
	},

	async update(id: string, data: Partial<Pick<Form, 'title' | 'description' | 'published'>>): Promise<Form> {
		return apiFetch<Form>(`/forms/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	},

	async delete(id: string): Promise<void> {
		return apiFetch<void>(`/forms/${id}`, { method: 'DELETE' });
	},

	async addField(formId: string, field: Omit<FormField, 'id' | 'order'>): Promise<FormField> {
		return apiFetch<FormField>(`/forms/${formId}/fields`, {
			method: 'POST',
			body: JSON.stringify(field)
		});
	},

	async updateField(formId: string, fieldId: string, field: Partial<Omit<FormField, 'id' | 'order'>>): Promise<FormField> {
		return apiFetch<FormField>(`/forms/${formId}/fields/${fieldId}`, {
			method: 'PUT',
			body: JSON.stringify(field)
		});
	},

	async deleteField(formId: string, fieldId: string): Promise<void> {
		return apiFetch<void>(`/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' });
	},

	async reorderFields(formId: string, fieldIds: string[]): Promise<void> {
		return apiFetch<void>(`/forms/${formId}/fields/reorder`, {
			method: 'PUT',
			body: JSON.stringify({ fieldIds })
		});
	}
};

// --- Responses ---

export interface FormResponse {
	id: string;
	formId: string;
	data: Record<string, unknown>;
	submittedAt: string;
}

export const responses = {
	async submit(formId: string, answers: {fieldId: number, value: unknown}[]): Promise<FormResponse> {
		return apiFetch<FormResponse>(`/forms/${formId}/submit`, {
			method: 'POST',
			body: JSON.stringify({ answers }),
			skipAuth: true
		});
	},

	async list(formId: string): Promise<FormResponse[]> {
		return apiFetch<FormResponse[]>(`/forms/${formId}/responses`);
	},

	async get(formId: string, responseId: string): Promise<FormResponse> {
		return apiFetch<FormResponse>(`/forms/${formId}/responses/${responseId}`);
	},

	async exportCsv(formId: string): Promise<Blob> {
		const token = getToken();
		const headers: Record<string, string> = {};
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${BASE_URL}/forms/${formId}/responses/export/csv`, { headers });
		if (!response.ok) {
			throw new ApiError(response.status, 'Failed to export CSV');
		}
		return response.blob();
	}
};
