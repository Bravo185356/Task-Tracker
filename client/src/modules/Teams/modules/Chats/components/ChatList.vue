<template>
	<div class="flex flex-col h-full min-h-0 overflow-y-auto">
		<nav>
			<ul class="flex flex-col gap-2">
				<li
					v-for="chat in chats"
					:key="chat.id"
					class="cursor-pointer block hover:bg-gray-500/50 px-4 py-2 transition-colors flex justify-between gap-2"
					:class="{ 'bg-zinc-500/50': chat.id === activeChatId }"
					@click="onChatSelect(chat)"
				>
					<div class="flex gap-2 min-w-0">
						<div class="w-[40px] h-[40px] rounded-full bg-zinc-500 shrink-0" />
						<div class="flex flex-col gap-1 max-w-[70%]">
							<span class="leading-tight">{{ getChatName(chat) }}</span>
							<span v-if="chat.lastMessage?.body" class="text-xs text-zinc-400 inline-block truncate">
								{{ chat.lastMessage?.body }}
							</span>
							<span v-else-if="chat.lastMessage?.attachments?.length" class="text-xs text-zinc-400">
								{{ chat.lastMessage?.attachments?.length }} {{ chat.lastMessage?.attachments?.length > 1 ? 'attachments' : 'attachment' }}
							</span>
						</div>
					</div>
					<div class="flex flex-col items-end gap-1 shrink-0">
						<span v-if="chat.lastMessage?.createdAt" class="text-xs text-zinc-400">
							{{ getDateString(chat.lastMessage.createdAt) }}
						</span>
						<div v-if="chat.unreadCount > 0" class="flex items-center justify-center bg-blue-500/20 w-[20px] h-[20px] rounded-full">
							<span class="leading-4 text-center text-xs text-blue-400">
								{{ chat.unreadCount }}
							</span>
						</div>
					</div>
				</li>
				<!-- Draft chat -->
				<li
					v-if="userId && !isChatCreated"
					class="cursor-pointer block hover:bg-gray-500/50 px-4 py-2 transition-colors flex gap-2"
					:class="{ 'bg-zinc-500/50': userId === activeChatId }"
				>
					<div class="w-[40px] h-[40px] rounded-full bg-zinc-500 shrink-0" />
					<div class="flex flex-col gap-1">
						<span class="leading-tight truncate">{{ getDraftChatName() }}</span>
						<span class="text-xs text-zinc-400">Draft</span>
					</div>
				</li>
			</ul>
		</nav>
	</div>
</template>

<script setup lang="ts">
import type { Chat, Team } from '@/shared/types/entities';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/modules/Auth';
import { ChatsAPI } from '../api/chats';
import { getDateString } from '../utilities/getDateString';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps<{
	teamId: string;
	activeChatId?: string;
}>();

const emit = defineEmits<{
	'select': [chat: Chat]
}>();

const confirm = useConfirm();
const queryClient = useQueryClient();
const authStore = useAuthStore();
const route = useRoute();
const userId = computed(() => route.params.userId as string);
const isChatCreated = computed(() => chats.value?.some((chat) => chat.type === 'DIRECT' && chat.participants.some((participant) => participant.userId === userId.value)));

const { data: chats } = useQuery({
	queryKey: ['chats', props.teamId],
	queryFn: () => ChatsAPI.getChats(props.teamId),
});

const getChatName = (chat: Chat) => {
	if (chat.type === 'DIRECT') {
		const otherUser = chat.participants.find((p) => p.userId !== authStore.user?.id);
		return otherUser?.username ?? '';
	} else {
		return chat.name;
	}
};

const onChatSelect = (chat: Chat) => {
	userId.value ? confirmChangeChat(chat) : emit('select', chat);
};

const confirmChangeChat = (chat: Chat) => {
	confirm.require({
		message: 'Are you sure you want to change the chat? This chat is will be deleted.',
		header: 'Confirm your action',
		icon: 'pi pi-exclamation-triangle',
		rejectProps: {
			label: 'No',
			severity: 'secondary',
			outlined: true,
			class: 'flex-1',
		},
		acceptProps: {
			label: 'Yes',
			class: 'flex-1',
		},
		accept: () => {
			emit('select', chat);
		},
	});
};

const getDraftChatName = () => {
	const team = queryClient.getQueryData<Team>(['team', props.teamId]);
	return team?.members.find((member) => member.userId === userId.value)?.username; 
};

defineExpose({ chats });
</script>
