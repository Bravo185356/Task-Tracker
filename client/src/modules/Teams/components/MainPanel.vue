<template>
	<Card class="w-86 min-h-[calc(100vh-140px)] overflow-y-auto shrink-0" :pt="{ body: { class: '!px-0' } }">
		<template #content>
			<BoardsList
                :team-id="teamId" 
                @create-board="isCreateBoardDialogOpen = true"
            />
			<div class="mt-4 border-t pt-4">
				<ChatList
					:team-id="teamId"
					@select="(chat) => handleChatSelect(chat)"
				/>
			</div>
		</template>
	</Card>
	<Dialog
		v-if="isCreateBoardDialogOpen"
		v-model:visible="isCreateBoardDialogOpen"
		header="Create Board"
		:modal="true"
		class="w-96"
	>
		<div class="flex flex-col gap-4">
			<InputText v-model="boardName" placeholder="Board Name" />
		</div>
		<div class="flex gap-3 mt-6">
			<Button
				severity="secondary"
				label="Cancel"
				fluid
				@click="isCreateBoardDialogOpen = false"
			/>
			<Button
				label="Create"
				fluid
				@click="handleCreateBoard"
			/>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import type { Chat, Board } from '@/shared/types/entities';
import { useRoute, useRouter } from 'vue-router';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { BoardsAPI, type CreateBoardRequest } from '../modules/Boards';
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { ChatList } from '../modules/Chats';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import BoardsList from '../modules/Boards/components/BoardsList.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const queryClient = useQueryClient();

const isCreateBoardDialogOpen = ref(false);
const boardName = ref('');

const teamId = computed(() => route.params.teamId as string);

const { mutate: createBoard } = useMutation({
	mutationFn: (data: CreateBoardRequest) => BoardsAPI.createBoard({ ...data, teamId: teamId.value }),
	onSuccess: (data: Board) => {
		toast.add({
			severity: 'success',
			summary: 'Board created',
			detail: 'Board has been created',
		});
		
		queryClient.setQueryData(['boards', teamId], (old: Board[]) => [...old, data]);
		isCreateBoardDialogOpen.value = false;
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to create board',
		});
	},
});

const handleChatSelect = (chat: Chat) => {
	router.push(`/teams/${teamId.value}/chats/${chat.id}`);
};

const handleCreateBoard = () => {
	createBoard({ name: boardName.value, teamId: teamId.value });
};
</script>