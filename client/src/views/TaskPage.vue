<template>
	<TaskPageSkeleton v-if="isLoading" />
	<div v-else-if="task" class="flex-1">
        <Teleport to="#page-header-actions">
            <div class="flex items-center gap-2">
                <Button
                    label="Copy Link"
                    icon="pi pi-link"
                    outlined
                    size="small"
                    @click="handleCopyLink"
                />
                <Button
                    label="Delete Task"
                    icon="pi pi-trash"
                    outlined
                    severity="danger"
                    size="small"
                    @click="handleDeleteTask"
                />
            </div>
        </Teleport>
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
			<div class="lg:col-span-2 space-y-6">
				<Card>
					<template #content>
						<div>
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
										<span>Created - {{ getDateString(task?.createdAt) }}</span>
									</div>
									<span>•</span>
									<div class="flex items-center gap-2">
										<i class="pi pi-clock text-zinc-500" />
										<span>Last Updated - {{ getDateString(task?.updatedAt) }}</span>
									</div>
								</div>
							</div>
							<Divider />
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
							<Divider />
							<TaskAttachments :task="task" />
						</div>
					</template>
				</Card>
				<TaskComments :task="task" />
			</div>
            <TaskDetails :task="task" @patchTask="patchTask" />
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
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { TaskDetails, useTaskDetailsWs, TasksAPI, TaskComments, TaskAttachments, TaskPageSkeleton, type PatchTaskRequest } from '@/modules/Teams';
import { useDebouncedField } from '@/shared/composables/useDebouncedField';
import { useToast } from 'primevue/usetoast';
import { getDateString } from '@/shared/utilities/getDateString';
import { useCopyToClipboard } from '@/shared/composables/useCopyToClipboard';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

const route = useRoute();
const toast = useToast();
const router = useRouter();
const queryClient = useQueryClient();
const { copy } = useCopyToClipboard();

const teamId = route.params.teamId as string;
const taskId = route.params.taskId as string;

const title = ref('');
const description = ref('');
const isTitleFocused = ref(false);
const isDescriptionFocused = ref(false);

useTaskDetailsWs(taskId);

const { data: task, isLoading } = useQuery({
	queryKey: ['task', taskId],
	queryFn: () => TasksAPI.getTaskById(taskId),
});

const { mutate: patchTask } = useMutation({
	mutationFn: (data: Partial<PatchTaskRequest>) => TasksAPI.patchTask(taskId, data),
	onSuccess: (updatedTask) => queryClient.setQueryData(['task', taskId], updatedTask),
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

const handleCopyLink = async () => await copy(window.location.href);

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