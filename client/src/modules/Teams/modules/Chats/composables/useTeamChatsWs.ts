import type { Chat, Message, Team } from '@/shared/types/entities';
import { useQueryClient } from '@tanstack/vue-query';
import { chatActivityWs } from '../api/websocket/chats.ws';
import { onMounted, onUnmounted, type MaybeRefOrGetter, toValue, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRoute } from 'vue-router';

export function useTeamChatsWs(teamId: MaybeRefOrGetter<string>) {
	const queryClient = useQueryClient();
	const getTeamId = () => toValue(teamId);
	const toast = useToast();
	const route = useRoute();
	
	const team = computed(() => queryClient.getQueryData<Team>(['team', getTeamId()]));

	const handleChatMessageCreated = (chatUpdate: { chatId: string; message: Message }) => {
		const teamId = getTeamId();
		queryClient.setQueryData<Chat[]>(['chats', teamId], (old: Chat[] | undefined) => {
			if (!old?.length) { 
				return old ?? []
			};
			
			const authorName = team.value?.members.find((member) => member.userId === chatUpdate.message.authorId)?.username;
			const isChatOpen = route.params.chatId === chatUpdate.chatId;
			
			if(!isChatOpen) {				
				toast.add({
					severity: 'info',
					summary: 'New message',
					detail: `New message from ${authorName}`,
					life: 4000,
				});
			}
			
			return old.map((chat) => {
				if (chat.id !== chatUpdate.chatId) {
					return chat
				};

				return {
					...chat,
					lastMessage: chatUpdate.message,
					unreadCount: isChatOpen ? 0 : chat.unreadCount + 1,
				};
			});
			
		});
	};

	onMounted(() => {
		chatActivityWs.onChatActivityCreated(handleChatMessageCreated);
	});

	onUnmounted(() => {
		chatActivityWs.offChatActivityCreated(handleChatMessageCreated);
	});
}
