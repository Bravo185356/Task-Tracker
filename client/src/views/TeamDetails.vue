<template>
	<div v-if="team" class="flex-1">
		<div class="flex justify-between items-center mb-6">
			<div class="flex items-center gap-2">
				<i 
					class="pi pi-arrow-left before:text-xl text-zinc-400 transition-colors hover:text-white cursor-pointer p-1" 
					@click="router.push('/teams')" 
				/>
				<h1 class="text-xl leading-6 font-bold">
					{{ team.name }}
				</h1>
				<div class="flex items-center gap-1">
					<span class="pi pi-users before:text-xl" />
					<span>{{ team.members?.length || 0 }}</span>
				</div>
			</div>
			<div class="flex justify-end flex-1 gap-2">
				<Button
					label="New Task"
					icon="pi pi-plus"
					@click="isCreateTaskDialogOpen = true"
				/>
				<RouterLink :to="`/teams/${teamId}/tasks`">
					<Button
						label="All Tasks"
						icon="pi pi-list"
					/>
				</RouterLink>
				<RouterLink v-if="teamsStore.isAdminOrOwner" :to="`/teams/${teamId}/manage`">
					<Button
						label="Manage Team"
						icon="pi pi-users"
					/>
				</RouterLink>
			</div>
		</div>
		<div>IN DEVELOPMENT</div>
	</div>
	<CreateTaskModal
		v-if="isCreateTaskDialogOpen"
		v-model:visible="isCreateTaskDialogOpen"
	/>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { ref } from 'vue';
import { 
	TeamsAPI,
	CreateTaskModal, 
	useTeamsStore,
} from '@/modules/Teams';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const teamsStore = useTeamsStore();

const teamId = route.params.teamId as string;
const isCreateTaskDialogOpen = ref(false);
	
const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});
</script>
