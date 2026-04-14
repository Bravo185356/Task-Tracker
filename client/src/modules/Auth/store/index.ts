import type { AuthResponse } from '../api/auth.types';
import type { User } from '@/shared/types/entities';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null as User | null,
		showAuthModal: false,
	}),
	
	actions: {
		login(data: AuthResponse) {
			this.user = data.user;
			this.showAuthModal = false;
		},
		logout() {	
			this.user = null;
			this.showAuthModal = true;
		},
		openAuthModal() {
			this.showAuthModal = true;
		},
		closeAuthModal() {
			this.showAuthModal = false;
		}
	},
	
	getters: {
		isAuthenticated: (state) => !!state.user,
	}
});