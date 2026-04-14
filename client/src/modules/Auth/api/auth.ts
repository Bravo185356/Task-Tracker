import type { AuthResponse } from "./auth.types";
import { httpClient } from "@/app/config/httpClient";

export class AuthAPI {
	static async login(username: string, password: string): Promise<AuthResponse> {
		return httpClient.post<AuthResponse>('/auth/login', { username, password });
	}

	static async register(email: string, password: string, username: string): Promise<AuthResponse> {
		return httpClient.post<AuthResponse>('/auth/register', { email, password, username });
	}
	
	static async getCurrentUser(): Promise<AuthResponse>	 {
		return httpClient.post<AuthResponse>('/auth/me', {});
	}
	
	static async logout(): Promise<void> {
		return httpClient.post<void>('/auth/logout', {});
	}
	
	static async refresh(): Promise<AuthResponse> {
		return httpClient.post<AuthResponse>('/auth/refresh', {});
	}
}