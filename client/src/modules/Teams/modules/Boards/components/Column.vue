<template>
	<div
		class="flex flex-col rounded-2xl p-4 w-80 shrink-0 bg-zinc-800/70 border transition-all duration-300"
		:class="[columnParams.borderColor, columnParams.shadowColor]"
	>
		<div class="flex items-center justify-between mb-4 pb-3 border-b" :class="columnParams.borderColor">
			<div class="flex items-center gap-3">
				<div class="w-3 h-3 rounded-full animate-pulse" :class="columnParams.dotColor" />
				<h3 class="text-base font-bold tracking-wide" :class="columnParams.textColor">
					{{ columnParams.name }}
				</h3>
			</div>
			<Badge 
				:value="columnTasks?.length || 0"
				class="font-bold"
				:class="columnParams.badgeBackground"
			/>
		</div>
		<div class="flex-1 overflow-y-auto space-y-3 relative">
			<div
				v-if="columnTasks?.length === 0" 
				class="flex absolute top-0 left-0 w-full flex-col items-center justify-center py-12 px-4 rounded-xl bg-zinc-800/30 border-2 border-dashed border-zinc-700/50"
			>
				<div class="w-16 h-16 rounded-full bg-zinc-700/30 flex items-center justify-center mb-3">
					<i class="pi pi-inbox text-zinc-600 text-2xl" />
				</div>
				<p class="text-zinc-500 text-sm font-medium mb-1">
					No tasks yet
				</p>
				<p class="text-zinc-600 text-xs">
					Drag tasks here
				</p>
			</div>
			<VueDraggableNext
				v-model="columnTasks"
				item-key="id"
				group="tasks"
				class="flex flex-col gap-3 flex-1 overflow-y-auto h-full"
				ghost-class="opacity-50"
				:column-id="columnParams.id"
				drag-class="cursor-grabbing"
				@end="changeTaskColumn"
			>
				<TaskCard
					v-for="task in columnTasks"
					:id="task.id"
					:key="task.id"
					:task="task"
					@click="handleTaskClick(task.id)"
				/>
			</VueDraggableNext>
		</div>
		<Button
			label="Add Task"
			icon="pi pi-plus"
			outlined
			severity="secondary"
			class="mt-3 w-full border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 hover:border-zinc-600"
			@click="addTask(columnParams.id as TaskColumn)"
		/>
	</div>
	<CreateTaskModal
		v-if="showAddTaskDialog"
		v-model:visible="showAddTaskDialog"
		:column-id="newTaskColumnId"
	/>
</template>

<script setup lang="ts">
import type { Board, Task, TaskColumn } from '@/shared/types/entities';
import type { ColumnConfig } from '../constants/columns';
import { ref, computed } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';
import { TasksAPI, CreateTaskModal } from '@/modules/Teams';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';
import TaskCard from './TaskCard.vue';
import Badge from 'primevue/badge';
import Button from 'primevue/button';

const props = defineProps<{
	columnParams: ColumnConfig;
	board: Board;
}>();

const toast = useToast();
const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const teamId = route.params.teamId as string;

const showAddTaskDialog = ref(false);
const newTaskColumnId = ref<TaskColumn>('BACKLOG');

const columnTasks = computed(() => {
	return props.board?.tasks.filter(task => task.status === props.columnParams.id);
});

const { mutate: updateBoard } = useMutation({
	mutationFn: (task: Task) => TasksAPI.updateTask(task.id, task),
	onSuccess: (updatedTask) => {
		queryClient.setQueryData(['board', props.board.id], (board: Board) => {
			return { ...board, tasks: board.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) };
		});
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to update task',
		});
	},
});

const addTask = (column: TaskColumn) => {
	newTaskColumnId.value = column;
	showAddTaskDialog.value = true;
};

const changeTaskColumn = (event: { to: HTMLElement; item: HTMLElement }) => {
	const newColumn = event.to.getAttribute('column-id');
	const taskId = event.item.getAttribute('id');
	const task = props.board?.tasks.find(task => task.id === taskId);
	if (task && newColumn) {
		const updatedTask: Task = { ...task, status: newColumn };
		updateBoard(updatedTask);
	}
};

const handleTaskClick = (taskId: string) => {
	router.push(`/teams/${teamId}/tasks/${taskId}`);
};
</script>