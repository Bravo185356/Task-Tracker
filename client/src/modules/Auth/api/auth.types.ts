import type { User } from '@/shared/types/entities';

interface AuthResponse {
	user: User;
}

interface RegisterFormData {
	email: string;
	password: string;
	username: string;
	avatar?: File | null;
}

interface LoginFormData {
	username: string;
	password: string;
}

export type { AuthResponse, RegisterFormData, LoginFormData };