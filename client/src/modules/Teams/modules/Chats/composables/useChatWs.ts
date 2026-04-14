import type { ChatDetails, Message } from "@/shared/types/entities";
import { onMounted, onUnmounted, toValue, watch, type MaybeRefOrGetter } from "vue";
import { chatWs } from "../api/websocket/chat.ws";
import { useQueryClient } from "@tanstack/vue-query";

export function useChatWs(chatId: MaybeRefOrGetter<string | undefined>) {
	const queryClient = useQueryClient();
	const getChatId = () => toValue(chatId);
	
	const handleChatMessageCreated = (message: Message) => {
		const id = getChatId();
		
		if (!id) {
			return
		};
		
		queryClient.setQueryData<ChatDetails>(['chat', id], (old) => {
			if (!old) {
				return old
			};
			
			const isMessageAlreadyExists = old.messages.some(m => m.id === message.id);
			
			if (isMessageAlreadyExists) {
				return old
			};

			const tempIndex = old.messages.findIndex((m) => {
				if (!m.id.startsWith('temp-') || m.authorId !== message.authorId) return false;
				if (m.body && m.body === message.body) return true;
				
				const tempNames = m.attachments?.map((a) => a.originalFileName).sort();
				const realNames = message.attachments?.map((a) => a.originalFileName).sort();
				return JSON.stringify(tempNames) === JSON.stringify(realNames);
			});

			if (tempIndex !== -1) {
				const updated = [...old.messages];
				updated[tempIndex] = message;
				return { ...old, messages: updated };
			};
			
			return { ...old, messages: [...old.messages, message] };
		});
	};
	
	watch(getChatId, (newId, oldId) => {
		if (oldId) {
			chatWs.leave(oldId);
		};
		
		if (newId) {
			chatWs.join(newId)
		};
	}, { immediate: true });
	
	onMounted(() => {
		chatWs.onChatMessageCreated(handleChatMessageCreated);
	});
	
	onUnmounted(() => {
		const id = getChatId();
		if (id) {
			chatWs.leave(id);
		}
		chatWs.offChatMessageCreated(handleChatMessageCreated);
	});
}