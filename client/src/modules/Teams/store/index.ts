import { defineStore } from 'pinia';

export const useTeamsStore = defineStore('teams', {
	state: () => ({
		showCreateModal: false,
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
});
