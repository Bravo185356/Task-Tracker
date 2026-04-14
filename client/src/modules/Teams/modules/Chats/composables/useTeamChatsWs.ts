import type { Chat, Message } from '@/shared/types/entities';
import { useQueryClient } from '@tanstack/vue-query';
import { chatActivityWs } from '../api/websocket/chats.ws';
import { onMounted, onUnmounted, type MaybeRefOrGetter, toValue } from 'vue';
import { useToast } from 'primevue/usetoast';
import { TeamsAPI } from '@/modules/Teams';
import { useQuery } from '@tanstack/vue-query';
import { useRoute } from 'vue-router';


/**
 * Сайдбар чатов команды: подписка на chat:activity:created.
 * Комната user подключается глобально в App.vue.
 */
export function useTeamChatsWs(teamId: MaybeRefOrGetter<string>) {
	const queryClient = useQueryClient();
	const getTeamId = () => toValue(teamId);
	const toast = useToast();
	const route = useRoute();
	const { data: team } = useQuery({
		queryKey: ['team', teamId],
		queryFn: () => TeamsAPI.getTeamInfo(getTeamId()),
	});

	const handleChatMessageCreated = (chatUpdate: { chatId: string; message: Message }) => {
		console.log(chatUpdate);
		const teamId = getTeamId();
		queryClient.setQueryData<Chat[]>(['chats', teamId], (old: Chat[] | undefined) => {
			if (!old?.length) { 
				return old ?? []
			};
			
			const authorName = team.value?.members.find((member) => member.userId === chatUpdate.message.authorId)?.username;
			
			toast.add({
				severity: 'info',
				summary: 'New message',
				detail: `New message from ${authorName}`,
				life: 4000,
			});
			
			const isChatOpen = route.params.chatId === chatUpdate.chatId;
			
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
