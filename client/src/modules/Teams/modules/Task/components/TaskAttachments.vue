<template>
	<div>
		<div class="flex items-center justify-between mb-3">
			<label class="text-lg font-semibold text-zinc-200">Attachments</label>
			<Button
				icon="pi pi-paperclip"
				label="Attach"
				size="small"
				outlined
				:loading="isUploading"
				@click="fileInputRef?.click()"
			/>
			<input
				ref="fileInputRef"
				type="file"
				multiple
				class="hidden"
				@change="handleAttachmentSelect"
			/>
		</div>
		<div v-if="task.attachments?.length" class="flex flex-col gap-2">
			<div
				v-for="attachment in task.attachments"
				:key="attachment.id"
				class="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors"
			>
				<div
					class="w-10 h-10 rounded overflow-hidden flex items-center justify-center cursor-pointer flex-shrink-0"
					:class="attachment.mimeType.startsWith('image/') ? 'bg-transparent' : 'bg-zinc-700/50'"
					@click="openAttachment(attachment)"
				>
					<Image
						v-if="attachment.mimeType.startsWith('image/')"
						:src="API_URL + attachment.url"
						:alt="attachment.originalFileName"
						class="w-full h-full object-cover"
						preview
					/>
					<i v-else class="pi pi-file" />
				</div>
				<div class="flex-1 min-w-0 cursor-pointer" @click="openAttachment(attachment)">
					<p class="text-white text-sm font-medium truncate">
						{{ attachment.originalFileName }}
					</p>
				</div>
				<Button
					icon="pi pi-trash"
					text
					size="small"
					severity="danger"
					class="text-zinc-400 hover:text-red-400"
					@click="deleteAttachment(attachment.id)"
				/>
			</div>
		</div>
		<p v-else class="text-zinc-500 text-sm">No attachments yet.</p>
	</div>
</template>

<script setup lang="ts">
import type { Task, Attachment } from '@/shared/types/entities';
import { useFileUpload } from '@/shared/composables/useFileUpload';
import { useToast } from 'primevue/usetoast';
import { API_URL } from '@/app/config/api';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { TasksAPI } from '../api/tasks';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';
import Image from 'primevue/image';

const props = defineProps<{
	task: Task;
}>();

const queryClient = useQueryClient();
const toast = useToast();
const route = useRoute();

const taskId = route.params.taskId as string;

const { fileInputRef, handleFileSelect, clearFiles } = useFileUpload();

const { mutate: uploadAttachments, isPending: isUploading } = useMutation({
	mutationFn: (files: File[]) => TasksAPI.uploadAttachments(taskId, files),
	onSuccess: (updatedTask) => {
		queryClient.setQueryData<Task>(['task', taskId], updatedTask);
		clearFiles();
	},
	onError: () => {
		toast.add({ 
			severity: 'error', 
			summary: 'Upload failed', 
			detail: 'Could not upload files' 
		});
	},
});

const { mutate: deleteAttachment } = useMutation({
	mutationFn: (attachmentId: string) => TasksAPI.deleteAttachment(taskId, attachmentId),
	onSuccess: (updatedTask) => {
		queryClient.setQueryData<Task>(['task', taskId], updatedTask);
	},
	onError: () => {
		toast.add({ severity: 'error', summary: 'Error', detail: 'Could not delete attachment' });
	},
});

const handleAttachmentSelect = (event: Event) => {
	const input = event.target as HTMLInputElement;
	const files = input.files ? Array.from(input.files) : [];
	handleFileSelect(event);
	
	if (files.length) {
		uploadAttachments(files)
	};
};

const openAttachment = (attachment: Attachment) => {
	if (attachment.mimeType.startsWith('image/')) {
		return;
	}
	
	window.open(API_URL + attachment.url, '_blank');
};
</script>