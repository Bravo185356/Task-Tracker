import type { CreateMessageRequest } from '../api/chats.types';
import type { ChatDetails, Message, Chat } from '@/shared/types/entities';
import { useAuthStore } from '@/modules/Auth';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ChatsAPI } from '../api/chats';
import { useRoute } from 'vue-router';

export const useCreateMessage = () => {
	const queryClient = useQueryClient();
	const route = useRoute();
	const authStore = useAuthStore();
	const teamId = route.params.teamId as string;
	
	const { mutate: createMessage } = useMutation({
		mutationFn: (data: CreateMessageRequest) => 
			ChatsAPI.createMessage(teamId, data.chatId, data.message, data.files),
		onMutate: async (data) => {
			await queryClient.cancelQueries({ queryKey: ['chat', data.chatId] });
			
			const prevChat = queryClient.getQueryData<ChatDetails>(['chat', data.chatId]);
			const prevChats = queryClient.getQueryData<Chat[]>(['chats', teamId]);
			
			setOptimisticMessage(data);
			
			return { prevChat, prevChats };
		},
		onSuccess: (data: Message) => {
			queryClient.setQueryData(['chats', teamId], (old: Chat[]) => {
				return old.map((chat) => {
					if (chat.id === data.chatId) {
						return { ...chat, lastMessage: data };
					}
					return chat;
				});
			});
		},
		onError: (_err, data, context) => {
			if (context?.prevChat) {
				queryClient.setQueryData(['chat', data.chatId], context.prevChat);
			}
			if(context?.prevChats) {
				queryClient.setQueryData(['chats', teamId], context.prevChats);
			}
		},
	});
	
	const setOptimisticMessage = (data: CreateMessageRequest) => {
		const optimisticMessage: Partial<Message> = {
			id: `temp-${Date.now()}`,
			chatId: data.chatId,
			authorId: authStore.user?.id ?? '',
			body: data.message,
			createdAt: new Date().toISOString(),
			attachments: data.files?.map((file) => ({
				id: `temp-${file.name}`,
				url: URL.createObjectURL(file),
				originalFileName: file.name,
				mimeType: file.type,
				sizeBytes: file.size,
			})),
		};
	
		queryClient.setQueryData(['chat', data.chatId], (old: ChatDetails) => {
			return { ...old, messages: [...old.messages, optimisticMessage] };
		});
		
		setOptimisticLastMessage(optimisticMessage);
	}
	
	const setOptimisticLastMessage = (lastMessage: Partial<Message>) => {
		queryClient.setQueryData(['chats', teamId], (old: Chat[]) => {
			return old.map((chat) => {
				if (chat.id === lastMessage.chatId) {
					return { ...chat, lastMessage };
				}
				return chat;
			});
		});
	}

	return { createMessage };
}