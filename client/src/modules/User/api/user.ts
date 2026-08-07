import type { User } from '@/shared/types/entities';
import type { UpdateProfilePayload } from './user.types';
import { httpClient } from '@/app/config/httpClient';

export class UserAPI {
	static async getProfile(): Promise<User> {
		return httpClient.get<User>('/users/me');
	}

	static async updateProfile(payload: UpdateProfilePayload): Promise<User> {
		const formData = new FormData();

		if (payload.username != null && payload.username !== '') {
			formData.append('username', payload.username);
		}
		if (payload.email != null && payload.email !== '') {
			formData.append('email', payload.email);
		}
		if (payload.password) {
			formData.append('password', payload.password);
			formData.append('confirmPassword', payload.confirmPassword ?? '');
		}
		if (payload.avatar) {
			formData.append('avatar', payload.avatar);
		}

		return httpClient.patch<User>('/users/me', formData);
	}
}
