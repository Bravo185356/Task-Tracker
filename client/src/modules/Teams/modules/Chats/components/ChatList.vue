<template>
    <div class="flex flex-col h-full min-h-0 overflow-y-auto">
        <div v-if="!isChatPage" class="flex justify-between items-center mb-2 pl-4">
            <div class="text-xl font-semibold">
                Chats
            </div>
            <div class="relative">
                <div class="pi pi-plus text-zinc-400 transition-colors hover:text-white cursor-pointer pl-[13px] pr-4" @click="togglePopover" />
                <Popover ref="memberPopover">
                    <div>
                        <ul v-if="otherMembers?.length" class="flex flex-col gap-2">
                            <li v-for="user in otherMembers" :key="user.id" @click="handleCreateChat(user.userId)" class="flex items-center gap-2 hover:bg-gray-500/50 rounded-md px-2 py-1 cursor-pointer transition-colors">
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 bg-zinc-400/50 rounded-full" />
                                </div>
                                <span>
                                    {{ user.username }}
                                </span>
                            </li>
                        </ul>
                        <p v-else class="text-zinc-400 text-sm">
                            No Members Found
                        </p>
                    </div>
                </Popover>
            </div>
        </div>
        <nav v-if="!isLoading" :class="{ 'py-4': isChatPage }">
            <ul v-if="chats?.length" class="flex flex-col gap-2">
                <li v-for="chat in chats" :key="chat.id" class="cursor-pointer hover:bg-gray-500/50 px-4 py-2 transition-colors flex justify-between gap-2" :class="{ 'bg-zinc-500/50': chat.id === activeChatId }" @click="onChatSelect(chat)">
                    <div class="flex gap-2 min-w-0">
                        <Avatar :url="getAvatarUrl(chat)" />
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
                <li v-if="userId && !isChatCreated" class="cursor-pointer hover:bg-gray-500/50 px-4 py-2 transition-colors flex gap-2" :class="{ 'bg-zinc-500/50': userId === activeChatId }">
                    <Avatar :url="getAvatarUrl()" shape="circle" />
                    <div class="flex flex-col gap-1">
                        <span class="leading-tight truncate">{{ getDraftChatName() }}</span>
                        <span class="text-xs text-zinc-400">Draft</span>
                    </div>
                </li>
            </ul>
            <div v-else class="px-4 py-2">
                No Chats Found
            </div>
        </nav>
        <div v-else class="px-4 py-2">
            <Skeleton class="w-full !h-[56px]" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Chat, Team } from '@/shared/types/entities';
import { useTeamMembers } from '../../../composables/useTeamMembers';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '@/modules/Auth';
import { ChatsAPI } from '../api/chats';
import { getDateString } from '@/shared/utilities/getDateString';
import { useConfirm } from 'primevue/useconfirm';
import Avatar from '@/shared/components/Avatar.vue';
import Popover from 'primevue/popover';
import Skeleton from 'primevue/skeleton';

const props = defineProps<{
    teamId: string;
    activeChatId?: string;
}>();

const emit = defineEmits<{
    'select': [chat: Chat]
}>();

const authStore = useAuthStore();
const memberPopover = ref();

const confirm = useConfirm();
const queryClient = useQueryClient();
const route = useRoute();
const router = useRouter();
const teamMembers = useTeamMembers(props.teamId);

const isChatPage = computed(() => route.name === 'ChatPage' || route.name === 'NewChatPage');
const otherMembers = computed(() => teamMembers?.filter((member) => member.userId !== authStore.user?.id));
const userId = computed(() => route.params.userId as string);
const isChatCreated = computed(() => 
    chats.value?.some((chat) => 
    chat.type === 'DIRECT' && 
    chat.participants.some((participant) => participant.userId === userId.value))
);

const { data: chats, isLoading } = useQuery({
    queryKey: ['chats', props.teamId],
    queryFn: () => ChatsAPI.getChats(props.teamId),
});

const getAvatarUrl = (chat?: Chat) => {
    if (!chat) {
        return teamMembers.find((member) => member.userId === userId.value)!.avatar;
    }

    const otherUser = chat.participants.find((p) => p.userId !== authStore.user?.id)!;
    return otherUser.avatar;
};

const getChatName = (chat: Chat) => {
    if (chat.type === 'DIRECT') {
        const otherUser = chat.participants.find((p) => p.userId !== authStore.user?.id);
        return otherUser?.username ?? '';
    } else {
        return chat.name;
    }
};

const handleCreateChat = (userId: string) => {
	router.push(`/teams/${props.teamId}/chats/new/${userId}`);
	memberPopover.value.hide();
};

const togglePopover = (event: MouseEvent) => {
	memberPopover.value.toggle(event);
};

const onChatSelect = (chat: Chat) => {
    userId.value ? confirmChangeChat(chat) : emit('select', chat);
};

const confirmChangeChat = (chat: Chat) => {
    confirm.require({
        message: 'Are you sure you want to change the chat? This chat is will be deleted.',
        header: 'Confirm your action',
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
