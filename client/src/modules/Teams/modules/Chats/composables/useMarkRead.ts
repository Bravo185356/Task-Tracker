import type { Chat, ChatDetails } from "@/shared/types/entities";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ChatsAPI } from "../api/chats";
import { useRoute } from "vue-router";
import { computed, watch, type Ref } from "vue";

export const useMarkRead = (chatDetails: Ref<ChatDetails | undefined>) => {
	const route = useRoute();
	const queryClient = useQueryClient();
	
	const teamId = route.params.teamId as string;
	const chatId = computed(() => route.params.chatId as string);
	
	const { mutate: markRead } = useMutation({
		mutationFn: () => ChatsAPI.markRead(teamId, chatId.value),
		onMutate: () => {
			const prevChats = queryClient.getQueryData(['chats', teamId]);
	
			queryClient.setQueryData(['chats', teamId], (old: Chat[]) => {
				return old.map((chat) => {
					return chat.id === chatId.value ? { ...chat, unreadCount: 0 } : chat
				});
			});
			
			return { prevChats };
		},
		onError: (_error, _data, context) => {
			if (context?.prevChats) {
				queryClient.setQueryData(['chats', teamId], context.prevChats);
			}
		}
	});
	
	watch(() => chatDetails.value, () => {
		if (chatDetails.value && chatDetails.value.unreadCount > 0) {
			markRead();
		}
	}, { immediate: true });

	return { markRead };
}