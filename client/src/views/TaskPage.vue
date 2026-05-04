<template>
	<div v-if="isLoading" class="flex justify-center items-center min-h-96">
		<ProgressSpinner />
	</div>
	<div v-else-if="task" class="min-h-screen pb-8">
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
						</div>
						<div class="mt-2">
							<label class="block text-lg font-semibold text-zinc-200 mb-3">Attachments</label>
							<div class="flex gap-2">
								<div class="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors cursor-pointer">
									<div class="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
										<i class="pi pi-file text-blue-400" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-white text-sm font-medium truncate">
											auth-flow-diagram.png
										</p>
										<p class="text-zinc-500 text-xs">
											2.4 MB
										</p>
									</div>
									<Button
										icon="pi pi-download"
										text
										size="small"
										class="text-zinc-400 hover:text-white"
									/>
								</div>
								<div class="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors cursor-pointer">
									<div class="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center">
										<i class="pi pi-file-pdf text-purple-400" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-white text-sm font-medium truncate">
											requirements.pdf
										</p>
										<p class="text-zinc-500 text-xs">
											856 KB
										</p>
									</div>
									<Button
										icon="pi pi-download"
										text
										size="small"
										class="text-zinc-400 hover:text-white"
									/>
								</div>
							</div>
						</div>
					</template>
				</Card>

				<Card>
					<template #content>
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-semibold text-zinc-200 flex items-center gap-2">
									<i class="pi pi-comments text-zinc-400" />
									Activity
								</h3>
								<div class="flex items-center gap-2">
									<Button
										label="Comments"
										text
										size="small"
										class="text-zinc-400 hover:text-white"
									/>
									<Button
										label="History"
										text
										size="small"
										class="text-zinc-400 hover:text-white"
									/>
								</div>
							</div>

							<Divider class="!border-zinc-700/50" />

							<div class="space-y-3">
								<div class="flex gap-3">
									<Avatar 
										label="A"
										size="normal"
										shape="circle"
										class="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold flex-shrink-0"
									/>
									<div class="flex-1">
										<Textarea
											placeholder="Write a comment..."
											rows="3"
											class="w-full !bg-zinc-900/50 !border-zinc-700/50 !text-zinc-200 placeholder:text-zinc-500"
										/>
										<div class="flex justify-between items-center mt-2">
											<div class="flex gap-2">
												<Button
													icon="pi pi-paperclip"
													text
													size="small"
													class="text-zinc-400 hover:text-white"
												/>
												<Button
													icon="pi pi-at"
													text
													size="small"
													class="text-zinc-400 hover:text-white"
												/>
											</div>
											<Button
												label="Comment"
												size="small"
												class="!bg-blue-600 hover:!bg-blue-700 !border-blue-600"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</template>
				</Card>
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
import { TaskDetails, taskStatuses, useTaskDetailsWs, TasksAPI } from '@/modules/Teams';
import { useDebouncedField } from '@/shared/composables/useDebouncedField';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Textarea from 'primevue/textarea';
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