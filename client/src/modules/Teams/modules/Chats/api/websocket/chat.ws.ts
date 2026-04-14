import type { Chat, Message } from '@/shared/types/entities';
import { ws } from '@/app/config/websocket';

export const chatWs = {
	join: (chatId: string) => ws.emit('chat:join', { chatId }),
	leave: (chatId: string) => ws.emit('chat:leave', { chatId }),

	onChatMessageCreated: (callback: (message: Message) => void) => 
		ws.on('chat:message:created', callback as (...args: unknown[]) => void),
	offChatMessageCreated: (callback: (message: Message) => void) => 
		ws.off('chat:message:created', callback as (...args: unknown[]) => void),
	onNewChatCreated: (callback: (chat: Chat) => void) => 
		ws.on('chat:new:created', callback as (...args: unknown[]) => void),
	offNewChatCreated: (callback: (chat: Chat) => void) => 
		ws.off('chat:new:created', callback as (...args: unknown[]) => void),
}	