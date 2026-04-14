import { httpClient } from '@/app/config/httpClient';
import type { Chat, ChatDetails, Message } from '@/shared/types/entities';
import type { CreateChatRequest } from './chats.types';

export class ChatsAPI {
	static async getChats(teamId: string): Promise<Chat[]> {
		return httpClient.get<Chat[]>(`/teams/${teamId}/chats`);
	}

	static async getChat(teamId: string, chatId: string): Promise<ChatDetails> {
		return httpClient.get<ChatDetails>(`/teams/${teamId}/chats/${chatId}`);
	}
	
	static async createChat(teamId: string, data: CreateChatRequest): Promise<Chat> {
		return httpClient.post<Chat>(`/teams/${teamId}/chats`, data);
	}
	
	static async createMessage(teamId: string, chatId: string, message: string, files?: File[]): Promise<Message> {
		if (files && files.length > 0) {
			const formData = new FormData();
			
			if (message.trim()) {
				formData.append('body', message)
			};
			
			files.forEach((file) => formData.append('files', file));
			return httpClient.postForm<Message>(`/teams/${teamId}/chats/${chatId}/messages`, formData);
		}
		return httpClient.post<Message>(`/teams/${teamId}/chats/${chatId}/messages`, { body: message });
	}
	
	static async markRead(teamId: string, chatId: string): Promise<void> {
		return httpClient.post<void>(`/teams/${teamId}/chats/${chatId}/read`, {});
	}
}