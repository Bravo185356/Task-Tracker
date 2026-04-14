<template>
	<div>
		<div class="flex items-center gap-2">
			<i 
				class="pi pi-arrow-left before:text-xl text-zinc-400 transition-colors hover:text-white cursor-pointer p-1" 
				@click="router.push(`/teams/${teamId}`)" 
			/>
			<h1 class="text-xl leading-6 font-bold">
				Tasks List
			</h1>
		</div>
		<!-- Нужны будут фильтры -->
		<div v-if="!team && !tasks" class="flex justify-center items-center min-h-96">
			<ProgressSpinner />
		</div>
		<div v-else-if="tasksError || teamError" class="flex justify-center items-center min-h-96">
			<p class="text-zinc-400 text-sm">
				{{ tasksError?.message || teamError?.message }}
			</p>
		</div>
		<div v-else class="mt-4">
			<Card 							
				v-for="task in tasks" 
				:key="task.id" 
				class="mb-4" 
			>
				<template #content>
					<div class="flex justify-between items-center gap-2">
						<div class="mb-2">
							<div class="flex items-center gap-2">
								<div>{{ getAssignedUser(task.assignedTo) }}</div>
								<Tag
									:value="getTaskStatusLabel(task.status)"
									:class="getTagClasses(task.status)"
								/>
								<Tag
									v-if="task.priority"
									:value="task.priority"
									:class="getPriorityTagClass(task.priority)"
								/>
							</div>
							<RouterLink :to="`/teams/${teamId}/tasks/${task.id}`">
								<h4 class="text-2xl font-bold cursor-pointer hover:text-blue-500">
									{{ task.title }}
								</h4>
							</RouterLink>
						</div>
						<div class="pi pi-trash cursor-pointer" @click.stop="handleDeleteTask(task.id)" />
					</div>
					<div v-if="task.assigned">
						<span class="text-sm text-zinc-400">Assigned To {{ task.assigned.username }}</span>
					</div>
				</template>
			</Card>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useQuery, useMutation } from '@tanstack/vue-query';
import { TasksAPI, taskStatuses, TeamsAPI, getPriorityTagClass } from '@/modules/Teams';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

const toast = useToast();
const route = useRoute();
const teamId = route.params.teamId as string;
const router = useRouter();
	
const { data: tasks, error: tasksError } = useQuery({
	queryKey: ['tasks', teamId],
	queryFn: () => TasksAPI.getTasks(teamId),
});

const { data: team, error: teamError } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const { mutate: deleteTask } = useMutation({
	mutationFn: (taskId: string) => TasksAPI.deleteTask(taskId),
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Task deleted',
			detail: 'Task has been deleted',
		});
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to delete task',
		});
	},
});

const handleDeleteTask = (taskId: string) => {
	deleteTask(taskId);
};

const getTagClasses = (taskStatus: string) => {
	return taskStatuses.find((status) => status.value === taskStatus)?.tagClass;
};

const getTaskStatusLabel = (taskStatus: string) => {
	return taskStatuses.find((status) => status.value === taskStatus)?.label;
};

const getAssignedUser = (assignedTo: string | null) => {
	if(!assignedTo) return 'Unassigned';
	return team.value?.members.find((member) => member.userId === assignedTo)?.username;
};
</script>