<template>
	<section class="flex min-h-0 min-w-0 flex-1 flex-col">
		<div class="flex items-center gap-2 h-[59px] p-4 shrink-0 border-b-1 border-b-white max-md:border-t-1 border-t-white">
			<span class="truncate font-medium">
				{{ chatName }}
			</span>
		</div>
		<div 
			v-if="!isLoading" 
			ref="messagesScrollEl" 
			class="relative min-h-0 min-w-0 flex-1 overflow-y-auto" 
			@scroll.passive="handleScrollEvent"
		>
			<Transition
				enter-active-class="transition-all duration-200"
				enter-from-class="opacity-0 -translate-y-2"
				enter-to-class="opacity-100 translate-y-0"
				leave-active-class="transition-all duration-150"
				leave-from-class="opacity-100 translate-y-0"
				leave-to-class="opacity-0 -translate-y-2"
			>
				<div v-if="newMessagesCount > 0" class="sticky top-3 z-10 flex justify-center">
					<Button
						icon="pi pi-arrow-down"
						:label="newMessagesCount === 1 ? 'New message' : `${newMessagesCount} New messages`"
						size="small"
						rounded
						@click="scrollToBottomAndReset"
					/>
				</div>
			</Transition>
			<div class="flex flex-col gap-4 p-4">
				<div
					v-for="message in messages"
					:key="message.id"
					class="relative max-w-[65%] max-md:max-w-[75%] min-w-20 max-md:self-end md:self-start border-1 border-zinc-700/50 rounded-lg p-[14px] pb-[18px] text-sm"
					:class="{ 'max-md:self-end bg-zinc-500/50': message.authorId === currentUserId, 'max-md:self-start bg-zinc-900/50': message.authorId !== currentUserId }"
				>
					<div class="flex gap-2">
						<span v-if="message.body" class="text-sm break-all">
							{{ message.body }}
						</span>
						<div v-if="message.attachments?.length" class="flex flex-wrap gap-2">
							<template v-for="attachment in message.attachments" :key="attachment.id">
								<div v-if="attachment.id.startsWith('temp-')">
									<ProgressSpinner class="w-4 h-4" />
								</div>
							<img
								v-else-if="attachment.mimeType.startsWith('image/')"
								:src="getAttachmentUrl(attachment.url)"
								:alt="attachment.originalFileName"
								class="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer"
								@click="openAttachment(attachment.url)"
								@load="handleScrollToBottom"
							/>
								<a
									v-else
									:href="getAttachmentUrl(attachment.url)"
									target="_blank"
									class="flex items-center gap-1.5 border-1 border-zinc-700/50 rounded px-2 py-1 text-xs transition-colors"
								>
									<i v-if="attachment.mimeType === 'application/pdf'" class="pi pi-file-pdf text-red-400" />
									<i v-else class="pi pi-file" />
									<span class="max-w-[150px] truncate">{{ attachment.originalFileName }}</span>
								</a>
							</template>
						</div>
						<span class="text-xs text-zinc-400 self-center leading-3 absolute bottom-[5px] right-[5px]">
							{{ getDateString(message.createdAt) }}
						</span>
					</div>
				</div>
				<div 
					v-if="firstMessage && !messages.length" 
					class="flex items-center gap-2 max-md:self-end bg-zinc-500/50 max-md:max-w-[65%] max-md:self-end md:self-start border-1 border-zinc-700/50 rounded-lg p-3 text-sm"
				>
					<span class="text-sm break-all">
						{{ firstMessage }}
					</span>
					<ProgressSpinner class="!w-[16px] !h-[16px]" />
				</div>
			</div>
		</div>
		<div v-else class="flex justify-center items-center flex-1 min-h-96">
			<ProgressSpinner class="!w-12 !h-12" />
		</div>
		<div class="border-t border-zinc-700/50">
			<!-- Превью прикреплённых файлов -->
			<div
				v-if="selectedFiles.length > 0"
				class="flex flex-wrap gap-2 p-2 border-b border-zinc-700/50"
			>
				<div
					v-for="(file, idx) in selectedFiles"
					:key="idx"
					class="relative group"
				>
					<img
						v-if="file.type.startsWith('image/') || file.type.startsWith('image/svg')"
						:src="previewUrls[idx]"
						class="w-16 h-16 rounded-lg object-cover"
						:alt="file.name"
					/>
					<div
						v-else
						class="flex items-center gap-1.5 border-1 border-zinc-700/50 rounded px-2 py-2 text-xs w-28"
					>
						<i class="pi pi-file shrink-0" />
						<span class="truncate">{{ file.name }}</span>
					</div>
					<button
						type="button"
						class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-1 border-zinc-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
						@click="removeFile(idx)"
					>
						<i class="pi pi-times text-zinc-400" />
					</button>
				</div>
			</div>
			<div class="flex gap-2 p-3 items-center">
				<input
					ref="fileInputRef"
					type="file"
					multiple
					class="hidden"
					@change="handleFileSelect"
				/>
				<Button
					icon="pi pi-paperclip"
					text
					rounded
					size="small"
					type="button"
					@click="fileInputRef?.click()"
				/>
				<InputText
					v-model="messageText"
					class="flex-1"
					placeholder="Message…"
					@keydown.enter.exact.prevent="handleSendMessage"
				/>
				<Button
					icon="pi pi-send"
					rounded
					type="button"
					@click="handleSendMessage"
				/>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { Message, Chat, Team } from '@/shared/types/entities';
import { ref, computed, toRef, onUnmounted } from 'vue';
import { useFileUpload } from '@/shared/composables/useFileUpload';
import { useChatScroll } from '../composables/useChatScroll';
import { API_URL } from '@/app/config/api';
import { useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { getDateString } from '../utilities/getDateString';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps<{
	messages: Message[];
	currentUserId?: string;
	isLoading: boolean;
	firstMessage?: string;
}>();

const emit = defineEmits<{
	'sendMessage': [payload: { message: string; files?: File[] }]
}>();

const { fileInputRef, selectedFiles, previewUrls, handleFileSelect, removeFile, clearFiles } = useFileUpload();
const route = useRoute();
const queryClient = useQueryClient();

const teamId = route.params.teamId as string;
const chatId = route.params.chatId as string;

const messageText = ref('');

const {
	messagesScrollEl,
	newMessagesCount, 
	handleScrollEvent, 
	handleScrollToBottom, 
	scrollToBottomAndReset 
} = useChatScroll(toRef(props, 'messages'), toRef(props, 'isLoading'));

void messagesScrollEl;

const chatName = computed(() => {
	const chats = queryClient.getQueryData<Chat[]>(['chats', teamId]);
	const chat = chats?.find((chat: Chat) => chat.id === chatId);
	
	if (chat) {
		return chat.type === 'DIRECT' ? 
			chat.participants.find((participant) => participant.userId !== props.currentUserId)?.username : 
			chat.name;
	} else {
		const team = queryClient.getQueryData<Team>(['team', teamId]);
		return team?.members.find((member) => member.userId === props.currentUserId)?.username;
	}
});

const getAttachmentUrl = (url: string) => `${API_URL}${url}`;

const openAttachment = (url: string) => window.open(getAttachmentUrl(url), '_blank');

const handleSendMessage = () => {
	const hasText = messageText.value.trim().length;
	const hasFiles = selectedFiles.value.length;

	if (!hasText && !hasFiles) {
		return
	};
	
	emit('sendMessage', {
		message: messageText.value,
		files: hasFiles ? [...selectedFiles.value] : undefined,
	});

	messageText.value = '';
	clearFiles();
};

onUnmounted(() => {
	clearFiles();
});
</script>
