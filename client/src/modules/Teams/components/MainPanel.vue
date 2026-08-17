<template>
	<Card class="w-86 min-h-[calc(100vh-140px)] overflow-y-auto shrink-0" :pt="{ body: { class: '!px-0' } }">
		<template #content>
			<BoardsList
                :team-id="teamId" 
                @create-board="isCreateBoardDialogOpen = true"
            />
            <Divider />
			<div>
				<ChatList
					:team-id="teamId"
					@select="(chat) => handleChatSelect(chat)"
				/>
			</div>
		</template>
	</Card>
	<CreateBoardModal :is-open="isCreateBoardDialogOpen" @close="isCreateBoardDialogOpen = false" />
</template>

<script setup lang="ts">
import type { Chat } from '@/shared/types/entities';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import { ChatList } from '../modules/Chats';
import { CreateBoardModal, BoardsList } from '../modules/Boards';
import Card from 'primevue/card';
import Divider from 'primevue/divider';

const route = useRoute();
const router = useRouter();

const isCreateBoardDialogOpen = ref(false);
const teamId = computed(() => route.params.teamId as string);

const handleChatSelect = (chat: Chat) => {
	router.push(`/teams/${teamId.value}/chats/${chat.id}`);
};
</script>