<template>
	<div class="flex flex-col flex-1">
		<div class="flex justify-between items-center mb-4">
			<h1 class="mb-4 text-2xl font-bold">
				My Teams
			</h1>
			<Button
				label="Create Team"
				icon="pi pi-plus"
				@click="teamsStore.openCreateModal"
			/>
		</div>

		<div v-if="isLoading" class="flex justify-center items-center flex-1">
			<ProgressSpinner />
		</div>

		<div v-else-if="error" class="flex justify-center items-center flex-1">
			<Message severity="error" :closable="false">
				Failed to load teams: {{ error.message }}
			</Message>
		</div>

		<div v-else-if="!data?.length" class="flex justify-center items-center flex-1">
			<div class="flex flex-col items-center justify-center">
				<h2 class="text-3xl font-bold">
					No Teams Found
				</h2>
				<p class="text-base text-zinc-400 mt-2">
					Create your first team to start collaborating with your colleagues
				</p>
				<Button
					label="Create Team"
					icon="pi pi-plus"
					class="mt-4"
					size="large"
					@click="teamsStore.openCreateModal"
				/>
			</div>
		</div>

		<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<TeamCard
				v-for="team in data"
				:key="team.id"
				:team="team"
			/>
		</div>

		<CreateTeamModal
			v-if="teamsStore.showCreateModal"
			v-model:visible="showCreateModal"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { 
	TeamsAPI, 
	useTeamsStore, 
	CreateTeamModal, 
	TeamCard,
} from '@/modules/Teams';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

const teamsStore = useTeamsStore();

const { data, isLoading, error } = useQuery({
	queryKey: ['teams'],
	queryFn: () => TeamsAPI.getTeams(),
	refetchOnMount: 'always',
});

const showCreateModal = computed({
	get: () => teamsStore.showCreateModal,
	set: (value: boolean) => {
		if (value) {
			teamsStore.openCreateModal();
		} else {
			teamsStore.closeCreateModal();
		}
	}
});
</script>
