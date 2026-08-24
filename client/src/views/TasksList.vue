<template>
	<div class="flex flex-col gap-4 flex-1">
		<div v-if="tasksError || teamError" class="flex justify-center items-center min-h-96">
			<p class="text-zinc-400 text-sm">{{ tasksError?.message || teamError?.message }}</p>
		</div>
		<div v-else class="flex flex-row-reverse flex-1 gap-6 items-start">
			<TaskFilters
				:filters="activeFilters"
				:team="team"
				:boards="boards"
                :is-loading="isUpdatingTasks"
				@update="updateActiveFilters"
				@reset="resetActiveFilters"
			/>
			<div class="flex-1 min-w-0">
				<div v-if="isInitialLoading" class="flex justify-center items-center">
                    <div class="flex flex-col gap-3 pr-1 flex-1">
                        <TaskCardSkeleton v-for="i in 2" :key="i" />
                    </div>
				</div>
				<div v-else-if="tasks?.length === 0" class="flex flex-col items-center flex-1 justify-center min-h-24">
					<div class="flex items-center justify-center gap-2 mb-3">
                        <i class="pi pi-filter text-3xl" />
                        <span class="font-bold text-xl">No Tasks Found</span>
                    </div>
                    <Button                       
                        label="Create Task"
                        icon="pi pi-plus"
                        @click="isCreateTaskDialogOpen = true"
                    />
				</div>
				<div v-else class="flex flex-col gap-3 overflow-y-auto pr-1">
					<TaskCard v-for="task in tasks" :key="task.id" :task="task" />
				</div>
			</div>
		</div>
        <CreateTaskModal :visible="isCreateTaskDialogOpen" @update:visible="isCreateTaskDialogOpen = $event" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, keepPreviousData } from '@tanstack/vue-query';
import { 
	type TaskFiltersModel,
	TasksAPI, 
	TeamsAPI, 
	BoardsAPI, 
	TaskFilters,
    TaskCard,
    TaskCardSkeleton,
    CreateTaskModal
} from '@/modules/Teams';
import { useRoute } from 'vue-router';
import { useDebouncedField } from '@/shared/composables/useDebouncedField';
import Button from 'primevue/button';

const route = useRoute();
const teamId = route.params.teamId as string;
const isCreateTaskDialogOpen = ref(false);

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