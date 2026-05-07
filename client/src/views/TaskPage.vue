<template>
	<div v-if="isLoading" class="flex flex-1 justify-center items-center min-h-96">
		<ProgressSpinner />
	</div>
	<div v-else-if="task" class="flex-1">
		<div class="mb-6">
			<div class="flex items-center gap-3 mb-4">
				<router-link :to="`/teams/${teamId}`">
					<Button
						icon="pi pi-arrow-left"
						text
						rounded
						severity="secondary"
						class="text-zinc-300 hover:text-white"
					/>
				</router-link>
				<div class="flex items-center gap-3">
					<Tag 
						:value="currentStatus!.label"
						:class="currentStatus!.tagClass"
					/>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2 space-y-6">
				<Card>
					<template #content>
						<div class="space-y-6">
							<div>
								<InputText
									:model-value="title"
									@update:model-value="setTitle($event ?? '')"
									@focus="isTitleFocused = true"
									@blur="isTitleFocused = false"
									class="w-full text-3xl font-bold text-white mb-2 tracking-tight leading-tight"
								/>
								<div class="flex items-center gap-4 text-sm text-zinc-400">
									<div class="flex items-center gap-2">
										<i class="pi pi-calendar text-zinc-500" />
										<span>Created: {{ task?.createdAt }}</span>
									</div>
									<span>•</span>
									<div class="flex items-center gap-2">
										<i class="pi pi-clock text-zinc-500" />
										<span>Updated: {{ task?.updatedAt }}</span>
									</div>
								</div>
							</div>
							<Divider class="!border-zinc-700/50" />
							<div>
								<div class="flex items-center justify-between mb-3">
									<h3 class="text-lg font-semibold text-zinc-200">Description</h3>
								</div>
								<div class="prose prose-invert max-w-none">
									<Textarea
										:model-value="description"
										@update:model-value="setDescription"
										@focus="isDescriptionFocused = true"
										@blur="isDescriptionFocused = false"
										rows="6"
										auto-resize
										fluid
									/>
								</div>
							</div>
							<Divider class="!border-zinc-700/50" />
							<TaskAttachments :task="task" />
						</div>
					</template>
				</Card>
				<TaskComments :task="task" />
			</div>
			<div class="space-y-6">
				<TaskDetails :task="task" @patchTask="patchTask" />
				<Card>
					<template #content>
						<div class="space-y-3">
							<h3 class="text-lg font-semibold text-zinc-200 mb-4">Actions</h3>				
							<Button
								label="Copy Link"
								icon="pi pi-link"
								outlined
								fluid
							/>
							<Button
								label="Delete Task"
								icon="pi pi-trash"
								outlined
								severity="danger"
								fluid
								@click="handleDeleteTask"
							/>
						</div>
					</template>
				</Card>
			</div>
		</div>
	</div>
	<div v-else>
		<div class="flex justify-center items-center min-h-96">
			<p class="text-zinc-400 text-sm">
				Task not found.
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Task } from '@/shared/types/entities';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation } from '@tanstack/vue-query';
import { TaskDetails, taskStatuses, useTaskDetailsWs, TasksAPI, TaskComments, TaskAttachments } from '@/modules/Teams';
import { useDebouncedField } from '@/shared/composables/useDebouncedField';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';

const route = useRoute();
const toast = useToast();
const router = useRouter();

const teamId = route.params.teamId as string;
const taskId = route.params.taskId as string;

const title = ref('');
const description = ref('');
const isTitleFocused = ref(false);
const isDescriptionFocused = ref(false);

useTaskDetailsWs(taskId);

const { mutate: patchTask } = useMutation({
	mutationFn: (data: Partial<Task>) => TasksAPI.patchTask(taskId, data),
});

const { setValue: setTitle } = useDebouncedField({
	onUpdate: (newTitle) => {
		title.value = newTitle;
		patchTask({ title: newTitle });
	},
});

const { setValue: setDescription } = useDebouncedField({
	onUpdate: (newDescription) => {
		description.value = newDescription;
		patchTask({ description: newDescription });
	},
});

const { data: task, isLoading } = useQuery({
	queryKey: ['task', taskId],
	queryFn: () => TasksAPI.getTaskById(taskId),
});

watch(task, (newTask: Task | undefined) => {
	if (newTask) {
		if(!isTitleFocused.value) {
			title.value = newTask.title || '';
		}
		
		if(!isDescriptionFocused.value) {
			description.value = newTask.description || '';
		}
	}
}, { immediate: true });

const currentStatus = computed(() =>
	taskStatuses.find(s => s.value === task.value?.status)
);

const handleDeleteTask = () => {
	TasksAPI.deleteTask(taskId).then(() => {
		toast.add({
			severity: 'success',
			summary: 'Task deleted',
			detail: 'Task has been deleted',
		});
		router.push(`/teams/${teamId}`);
	});
};
</script>