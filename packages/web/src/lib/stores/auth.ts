import { getToken, clearToken, setToken } from '$lib/api';

interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
}

function createAuthState(): AuthState {
	if (typeof window === 'undefined') {
		return { user: null, token: null };
	}

	const token = getToken();
	if (!token) {
		return { user: null, token: null };
	}

	// Decode user from JWT payload (base64url)
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		return {
			user: { id: payload.sub || payload.id, email: payload.email, name: payload.name },
			token
		};
	} catch {
		clearToken();
		return { user: null, token: null };
	}
}

let authState = $state<AuthState>(createAuthState());

export function getAuthState(): AuthState {
	return authState;
}

export function getIsAuthenticated(): boolean {
	return authState.token !== null && authState.user !== null;
}

export function loginUser(token: string, user: User): void {
	setToken(token);
	authState = { user, token };
}

export function logoutUser(): void {
	clearToken();
	authState = { user: null, token: null };
}

export function initAuth(): void {
	const state = createAuthState();
	authState = state;
}
