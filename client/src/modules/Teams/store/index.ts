import type { Role } from '@/shared/types/entities';
import { defineStore } from 'pinia';

export const useTeamsStore = defineStore('teams', {
	state: () => ({
		showCreateModal: false,
		myRole: null as Role | null,
	}),

	actions: {
		openCreateModal() {
			this.showCreateModal = true;
		},

		closeCreateModal() {
			this.showCreateModal = false;
		},

		resetTeamsStore() {
			this.showCreateModal = false;
		},
	},
	
	getters: {
		isOwner: (state) => state.myRole === 'OWNER',
		isAdminOrOwner: (state) => state.myRole === 'ADMIN' || state.myRole === 'OWNER',
	}
});
