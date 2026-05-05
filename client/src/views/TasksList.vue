<template>
	<div class="flex flex-col gap-4 flex-1">
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
		<div v-else class="flex flex-row-reverse flex-1 gap-6 items-start">
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
				<div v-else class="flex flex-col gap-3 overflow-y-auto pr-1">
					<TaskCard v-for="task in tasks" :key="task.id" :task="task" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, keepPreviousData } from '@tanstack/vue-query';
import { 
	TasksAPI, 
	TeamsAPI, 
	BoardsAPI, 
	TaskFilters, 
	type TaskFiltersModel 
} from '@/modules/Teams';
import { useRoute, useRouter } from 'vue-router';
import { useDebouncedField } from '@/shared/composables/useDebouncedField';
import ProgressSpinner from 'primevue/progressspinner';
import TaskCard from '@/modules/Teams/modules/Task/components/TaskCard.vue';

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
	refetchOnMount: true,
	staleTime: 0,
});

const { data: team, error: teamError } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const { data: boards } = useQuery({
	queryKey: ['boards', teamId],
	queryFn: () => BoardsAPI.getBoards(teamId),
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
</script>