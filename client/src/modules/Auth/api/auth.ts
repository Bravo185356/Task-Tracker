import type { AuthResponse } from "./auth.types";
import { httpClient } from "@/app/config/httpClient";

export class AuthAPI {
	static async login(username: string, password: string): Promise<AuthResponse> {
		return httpClient.post<AuthResponse>('/auth/login', { username, password });
	}

	static async register(email: string, password: string, username: string, avatar?: File | null): Promise<AuthResponse> {
		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);
		formData.append('username', username);
		if (avatar) {
			formData.append('avatar', avatar);
		}
		return httpClient.postForm<AuthResponse>('/auth/register', formData);
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