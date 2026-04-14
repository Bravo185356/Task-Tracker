import type { Message } from '@/shared/types/entities';
import { ws } from '@/app/config/websocket';

/** Подписка на chat:activity:created (доставка через user:${userId} на сервере). */
export const chatActivityWs = {
	onChatActivityCreated: (callback: (payload: { chatId: string; message: Message }) => void) =>
		ws.on('chat:activity:created', callback as (...args: unknown[]) => void),
	offChatActivityCreated: (callback: (payload: { chatId: string; message: Message }) => void) =>
		ws.off('chat:activity:created', callback as (...args: unknown[]) => void),
};
