<template>
	<Card>
		<template #content>
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold text-zinc-200 flex items-center gap-2">
						<i class="pi pi-comments text-zinc-400" />
						Activity
						<span v-if="task.comments?.length" class="text-sm font-normal text-zinc-400">({{ task.comments.length }})</span>
					</h3>
				</div>
				<Divider class="!border-zinc-700/50" />
				<ul v-if="task.comments?.length" class="space-y-4 list-none p-0 m-0">
					<li
						v-for="comment in task.comments"
						:key="comment.id"
						class="flex gap-3 group"
					>
						<Avatar :url="comment.author.avatar" />
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<span class="text-sm font-semibold text-zinc-200">{{ comment.author.username }}</span>
								<time
									:datetime="comment.createdAt"
									class="text-xs text-zinc-500"
								>{{ getDateString(comment.createdAt) }}</time>
								<Button
									v-if="authStore.user?.id === comment.authorId"
									icon="pi pi-trash"
									text
									size="small"
									severity="danger"
									class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity !w-6 !h-6"
									:loading="isDeletingComment && comment.id === deletingCommentId"
									@click="handleDeleteComment(comment.id)"
								/>
							</div>
							<p class="text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed bg-zinc-900/40 rounded-lg px-3 py-2 border border-zinc-700/30 m-0">
								{{ comment.body }}
							</p>
							<ul v-if="comment.attachments?.length" class="flex flex-wrap gap-2 mt-2 list-none p-0 m-0">
								<li v-for="attachment in comment.attachments" :key="attachment.id">
									<a
										:href="API_URL + attachment.url"
										target="_blank"
										rel="noopener noreferrer"
										class="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-zinc-800/60 border border-zinc-700/40 rounded px-2 py-1 transition-colors"
									>
										<i class="pi pi-file text-zinc-400" />
										<span class="max-w-[160px] truncate">{{ attachment.originalFileName }}</span>
									</a>
								</li>
							</ul>
						</div>
					</li>
				</ul>
				<p v-else class="text-sm text-zinc-500 text-center py-2">No comments yet</p>
				<Divider class="!border-zinc-700/50" />
				<div class="flex gap-3">
					<Avatar :url="authStore.user!.avatar" />
					<form class="flex-1" @submit.prevent="handleSubmitComment">
						<Textarea
							v-model="commentText"
							placeholder="Write a comment..."
							rows="3"
							auto-resize
							fluid
							class="w-full !bg-zinc-900/50 !border-zinc-700/50 !text-zinc-200 placeholder:text-zinc-500"
						/>
						<div class="flex gap-4 justify-between mt-3" :class="{ 'justify-end': !selectedFiles.length }">
							<ul v-if="selectedFiles.length" class="flex flex-wrap gap-2 list-none p-0 m-0">
								<li
									v-for="(file, index) in selectedFiles"
									:key="index"
									class="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-800/60 border border-zinc-700/40 rounded px-2 py-1"
								>
									<i class="pi pi-file text-zinc-400" />
									<span class="max-w-[140px] truncate">{{ file.name }}</span>
									<button
										type="button"
										class="pi pi-times before:text-sm text-zinc-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-0 p-0 leading-none"
										@click="removeFile(index)"
									/>
								</li>
							</ul>
							<div class="flex items-start gap-2">
								<div class="flex gap-1">
									<input
										ref="fileInputRef"
										type="file"
										multiple
										class="hidden"
										@change="handleFileSelect"
									/>
									<Button
										type="button"
										icon="pi pi-paperclip"
										text
										size="small"
										class="text-zinc-400 hover:text-white"
										@click="fileInputRef?.click()"
									/>
								</div>
								<Button
									type="submit"
									label="Send"
									size="small"
									:loading="isCreatingComment"
									:disabled="!commentText.trim() && !selectedFiles.length"
								/>
							</div>
						</div>
					</form>
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Task } from '@/shared/types/entities';
import { ref } from 'vue';
import { useAuthStore } from '@/modules/Auth';
import { API_URL } from '@/app/config/api';
import { useMutation } from '@tanstack/vue-query';
import { TasksAPI } from '../api/tasks';
import { useToast } from 'primevue/usetoast';
import { getDateString } from '@/shared/utilities/getDateString';
import { useFileUpload } from '@/shared/composables/useFileUpload';
import Avatar from '@/shared/components/Avatar.vue';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Divider from 'primevue/divider';
import Card from 'primevue/card';

const props = defineProps<{
	task: Task;
}>();

const authStore = useAuthStore();
const toast = useToast();

const { 
	fileInputRef, 
	selectedFiles, 
	handleFileSelect, 
	removeFile, 
	clearFiles 
} = useFileUpload();

const commentText = ref('');
const deletingCommentId = ref<string | null>(null);
	
const { mutate: createComment, isPending: isCreatingComment } = useMutation({
	mutationFn: (data: { body: string, files: File[] }) => TasksAPI.createComment(props.task.id, data.body, data.files),
	onSuccess: () => {
		commentText.value = '';
		clearFiles();
	},
	onError: () => {
		toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add comment' });
	},
});

const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
	mutationFn: (commentId: string) => TasksAPI.deleteComment(props.task.id, commentId),
	onError: () => {
		toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete comment' });
	},
	onSettled: () => {
		deletingCommentId.value = null;
	},
});

async function handleSubmitComment() {
	if (!commentText.value.trim() && !selectedFiles.value.length) {
		return
	};
	
	createComment({ body: commentText.value, files: selectedFiles.value });
}

async function handleDeleteComment(commentId: string) {
	deletingCommentId.value = commentId;
	deleteComment(commentId);
}
</script>