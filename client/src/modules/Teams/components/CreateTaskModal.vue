<template>
	<Dialog
		:visible="props.visible"
		header="Create Task"
		:modal="true"
		class="w-96"
		@update:visible="emit('update:visible', $event)"
	>
		<form @submit.prevent="handleCreateTask">
			<div class="flex flex-col gap-2">
				<div class="flex flex-col gap-2">
					<label for="taskTitle" class="leading-5">Title</label>
					<InputText id="taskTitle" v-model="taskTitle" placeholder="Enter Title" />
				</div>
				<div class="flex flex-col gap-2">
					<label for="taskDescription" class="leading-5">Description</label>
					<InputText id="taskDescription" v-model="taskDescription" placeholder="Enter Description" />
				</div>
				<div v-if="!route.params.boardId" class="flex flex-col gap-2">
					<label for="bindToBoard" class="leading-5">Bind to Board</label>
					<Select
						id="bindToBoard" 
						v-model="bindToBoard" 
						placeholder="Select Board" 
						:options="boards" 
						option-label="name" 
						option-value="id" 
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="taskAssignedTo" class="leading-5">Assigned To</label>
					<Select 
						id="taskAssignedTo" 
						v-model="taskAssignedTo" 
						placeholder="Select Assignee" 
						:options="team?.members" 
						option-label="username" 
						option-value="id" 
					/>
				</div>
			</div>
			<div class="flex gap-3 mt-4">
				<Button
					severity="secondary"
					label="Cancel"
					fluid
					@click="emit('update:visible', false)"
				/>
				<Button
					label="Create"
					fluid
					type="submit"
				/>
			</div>
		</form>
	</Dialog>
</template>

<script setup lang="ts">
import type { CreateTaskRequest } from '../modules/Task/api/tasks.types';
import type { TaskColumn } from '@/shared/types/entities';
import { TasksAPI } from '../modules/Task/api/tasks';
import { BoardsAPI } from '../modules/Boards/api/boards';
import { TeamsAPI } from '../api/teams';
import { ref } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { useToast } from 'primevue/usetoast';
import { useRoute } from 'vue-router';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = defineProps<{
	visible: boolean;
	columnId?: TaskColumn;
}>();

const emit = defineEmits<{
	'update:visible': [value: boolean]
}>();

const taskTitle = ref('');
const taskDescription = ref('');
const bindToBoard = ref('');
const taskAssignedTo = ref('');

const toast = useToast();
const route = useRoute();

const teamId = route.params.teamId as string;

const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const { data: boards } = useQuery({
	queryKey: ['boards', teamId],
	queryFn: () => BoardsAPI.getBoards(teamId),
});

const { mutate: createTask } = useMutation({
	mutationFn: (data: CreateTaskRequest) => TasksAPI.createTask(data),
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Task created',
		});
		emit('update:visible', false);
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to create task',
		});
	},
});

const handleCreateTask = () => {
	const boardId = props.columnId ? route.params.boardId as string : bindToBoard.value;
	createTask({ 
		title: taskTitle.value,
		teamId,
		
		...(taskDescription.value.trim() && { 
			description: taskDescription.value.trim() 
		}),
		...(boardId && { 
			boardId: boardId 
		}),
		...(taskAssignedTo.value && { 
			assignedTo: taskAssignedTo.value 
		}),
		...(props.columnId && { 
			status: props.columnId
		}),
	});
};
</script>