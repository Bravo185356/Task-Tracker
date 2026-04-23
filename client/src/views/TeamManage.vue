<template>
	<div class="flex flex-col flex-1">
		<div class="flex justify-between items-start mb-6">
			<div class="text-2xl font-bold">Manage Team</div>
			<div class="flex gap-2 justify-end">
				<Button
					v-if="teamsStore.isAdminOrOwner"
					label="Invite User"
					icon="pi pi-user-plus"
					@click="isInviteUserModalOpen = true"
				/>
				<Button
					v-if="teamsStore.isOwner"
					label="Delete Team"
					icon="pi pi-trash"
					severity="danger"
					@click="isDeleteTeamModalOpen = true"
				/>
			</div>
		</div>
		<div>
			<div>IN DEVELOPMENT</div>
		</div>
	</div>
	<Dialog
		v-model:visible="isDeleteTeamModalOpen"
		header="Delete Team"
		:modal="true"
	>
		<div class="flex flex-col gap-2">
			<p class="mb-2">
				Are you sure you want to delete this team?
			</p>
			<InputText v-model="teamName" placeholder="Enter team name to confirm" />
			<div class="flex gap-2 mt-4">
				<Button
					severity="secondary"
					label="Cancel"
					icon="pi pi-times"
					fluid
					
					@click="isDeleteTeamModalOpen = false"
				/>
				<Button
					severity="danger"
					:label="isPending ? 'Deleting...' : 'Delete'"
					:loading="isPending"
					icon="pi pi-trash"
					:disabled="teamName !== team?.name"
					fluid
					@click="deleteTeam(teamId)"
				/>
			</div>
		</div>
	</Dialog>
	<InviteUserModal
		v-if="isInviteUserModalOpen"
		v-model:visible="isInviteUserModalOpen"
		:team-id="teamId"
	/>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { TeamsAPI, InviteUserModal, useTeamsStore } from '@/modules/Teams';
import { useToast } from 'primevue/usetoast';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const teamsStore = useTeamsStore();

const teamId = route.params.teamId as string;

const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const isDeleteTeamModalOpen = ref(false);
const teamName = ref('');
const isInviteUserModalOpen = ref(false);

const { mutate: deleteTeam, isPending } = useMutation({
	mutationFn: (teamId: string) => TeamsAPI.deleteTeam(teamId),
	onSuccess: async() => {
		toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Team deleted successfully',
		});
		router.push('/teams');
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to delete team',
		});
	},
});

</script>