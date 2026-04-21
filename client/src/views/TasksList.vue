<template>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<i 
				class="pi pi-arrow-left before:text-xl text-zinc-400 transition-colors hover:text-white cursor-pointer p-1" 
				@click="router.push(`/teams/${teamId}`)" 
			/>
			<h1 class="text-xl leading-6 font-bold">Tasks List</h1>
			<div v-if="isUpdatingTasks && !isInitialLoading" class="!w-6 !h-6">
				<ProgressSpinner class="!w-full !h-full" stroke-width="6" />
			</div>
		</div>
		<div v-if="tasksError || teamError" class="flex justify-center items-center min-h-96">
			<p class="text-zinc-400 text-sm">{{ tasksError?.message || teamError?.message }}</p>
		</div>
		<div v-else class="flex gap-4 items-start">
			<TaskFilters
				:filters="activeFilters"
				:team="team"
				:boards="boards"
				@update="updateActiveFilters"
				@reset="resetActiveFilters"
			/>
			<div class="flex-1 min-w-0">
				<div v-if="isInitialLoading" class="flex justify-center items-center min-h-96">
					<ProgressSpinner />
				</div>
				<div v-if="tasks?.length === 0" class="flex flex-col items-center justify-center min-h-48 gap-2 text-zinc-400">
					<i class="pi pi-filter text-3xl" />
					<span class="text-sm">No tasks match the selected filters</span>
				</div>
				<div v-else class="flex flex-col gap-3">
					<Card v-for="task in tasks" :key="task.id">
						<template #content>
							<div class="flex justify-between items-center gap-2">
								<div class="mb-2">
									<div class="flex items-center gap-2">
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
							<div v-if="task.assignedTo">
								<span class="text-sm text-zinc-400">Assigned to {{ getAssignedUser(task.assignedTo) }}</span>
							</div>
							<span v-else class="text-sm text-zinc-400">Unassigned</span>
						</template>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/vue-query';
import { 
	TasksAPI, 
	taskStatuses, 
	TeamsAPI, 
	getPriorityTagClass, 
	BoardsAPI, 
	TaskFilters, 
	type TaskFiltersModel 
} from '@/modules/Teams';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useDebouncedField } from '@/shared/composables/useDebouncedField';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

const toast = useToast();
const route = useRoute();
const teamId = route.params.teamId as string;
const router = useRouter();

const activeFilters = ref<TaskFiltersModel>({
	title: '',
	assignedTo: null,
	priority: null,
	status: null,
	boardId: null,
});

const { data: tasks, isLoading: isInitialLoading, isFetching: isUpdatingTasks, error: tasksError } = useQuery({
	queryKey: computed(() => ['tasks', teamId, activeFilters.value]),
	queryFn: () => TasksAPI.getTasks(teamId, activeFilters.value),
	placeholderData: keepPreviousData,
});

const { data: team, error: teamError } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const { data: boards } = useQuery({
	queryKey: ['boards', teamId],
	queryFn: () => BoardsAPI.getBoards(teamId),
});

const { mutate: deleteTask } = useMutation({
	mutationFn: (taskId: string) => TasksAPI.deleteTask(taskId),
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Task deleted',
			detail: 'Task has been deleted'
		});
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to delete task'
		});
	},
});

const { setValue: setDebouncedTitle } = useDebouncedField({ onUpdate: (newTitle) => {
	activeFilters.value.title = newTitle;
} });

const updateActiveFilters = (newFilters: TaskFiltersModel) => {
	if(activeFilters.value.title !== newFilters.title) {
		setDebouncedTitle(newFilters.title);
		return;
	}
	
	activeFilters.value = newFilters;
};

const resetActiveFilters = () => {
	activeFilters.value = {
		title: '',
		assignedTo: null,
		priority: null,
		status: null,
		boardId: null,
	};
};

const handleDeleteTask = (taskId: string) => deleteTask(taskId);
const getTagClasses = (taskStatus: string) => taskStatuses.find((s) => s.value === taskStatus)!.tagClass;
const getTaskStatusLabel = (taskStatus: string) => taskStatuses.find((s) => s.value === taskStatus)!.label;
const getAssignedUser = (userId: string | null) => team.value?.members.find((m) => m.userId === userId)?.username;
</script>