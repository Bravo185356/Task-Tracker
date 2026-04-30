<template>
	<div
		v-if="error && isChatExist"
		class="flex min-h-[60vh] items-center justify-center"
	>
		<MessageItem
			severity="error"
			:closable="false"
		>
			Chat not found.
		</MessageItem>
	</div>
	<Card
		v-else
		class="overflow-hidden"
		:pt="{ body: { class: '!p-0 flex-1' }, root: { class: 'flex-1' }, content: { class: 'flex flex-col flex-1' } }"
	>
		<template #content>
			<div class="flex max-h-[calc(100vh-140px)] flex-1 min-h-[60vh] flex-col md:flex-row border-1 border-zinc-700/50 rounded-xl">
				<aside class="flex max-h-[40vh] shrink-0 flex-col md:max-h-none md:w-86 md:pe-0 md:border-r-1 md:border-r-zinc-700/50">
					<div class="flex items-center h-[59px] justify-between gap-2 p-4 md:border-b-1 md:border-b-white max-md:border-b-1 border-b-white mb-4">
						<div class="flex items-center gap-1">
							<i 
								class="pi pi-arrow-left text-zinc-400 transition-colors hover:text-white cursor-pointer p-2" 
								@click="router.push(`/teams/${teamId}`)" 
							/>
							<span class="font-semibold">Chats</span>
						</div>
						<Button
							icon="pi pi-plus"
							outlined
							size="small"
							type="button"
						/>
					</div>
					<ChatList
						:team-id="teamId"
						:active-chat-id="chatId || userId"
						@select="handleChangeChat"
					/>
				</aside>
				<ChatConversation
					:messages="chatDetails?.messages ?? []"
					:is-loading="isFetching"
					:current-user-id="authStore.user?.id"
					:first-message="firstMessage"
					@send-message="handleSendMessage"
				/>
			</div>
		</template>
	</Card>
	<ConfirmDialog />
</template>

<script setup lang="ts">
import type { Chat } from '@/shared/types/entities';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ChatsAPI, useChatWs, type CreateChatRequest, ChatList, ChatConversation } from '@/modules/Teams';
import { useAuthStore } from '@/modules/Auth';
import { useToast } from 'primevue/usetoast';
import { useCreateMessage, useMarkRead } from '@/modules/Teams';
import Card from 'primevue/card';
import Button from 'primevue/button';
import MessageItem from 'primevue/message';
import ConfirmDialog from 'primevue/confirmdialog';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const queryClient = useQueryClient();
const toast = useToast();

const chatId = computed(() => route.params.chatId as string);
const userId = computed(() => route.params.userId as string);
const isChatExist = computed(() => !userId.value);
const firstMessage = ref('');

const teamId = route.params.teamId as string;

useChatWs(chatId);
const { createMessage } = useCreateMessage();

const { data: chatDetails, error, isFetching } = useQuery({
	queryKey: ['chat', chatId],
	queryFn: () => ChatsAPI.getChat(teamId, chatId.value),
	refetchOnMount: true,
	staleTime: 0,
	enabled: isChatExist,
});

useMarkRead(chatDetails);

const { mutate: createChat } = useMutation({
	mutationFn: (data: CreateChatRequest) => ChatsAPI.createChat(teamId, data),
	onSuccess: async (data: Chat) => {
		await router.replace(`/teams/${teamId}/chats/${data.id}`);
		queryClient.setQueryData(['chats', teamId], (old: Chat[]) => [...old, data]);
		queryClient.setQueryData(['chat', data.id], { ...data, messages: [] });
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to create chat',
		});
	},
});

const handleSendMessage = (payload: { message: string; files?: File[] }) => {
	if (!isChatExist.value) {
		firstMessage.value = payload.message;
		createChat(
			{ type: 'DIRECT', otherUserId: userId.value },
			{
				onSuccess: (data: Chat) => {
					createMessage({ chatId: data.id, message: payload.message, files: payload.files });
					firstMessage.value = '';
				},
			},
		);
	} else {
		createMessage({ chatId: chatId.value, message: payload.message, files: payload.files });
	}
};

const handleChangeChat = async (chat: Chat) => {
	if(!isChatExist.value) {
		queryClient.setQueryData(['chats', teamId], (old: Chat[]) => old.filter((chat) => chat.id !== userId.value));
	}
	
	await router.push(`/teams/${teamId}/chats/${chat.id}`);
};
</script>