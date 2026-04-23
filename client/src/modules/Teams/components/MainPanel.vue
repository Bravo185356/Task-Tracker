<template>
	<Card class="sticky top-[108px] w-86 max-h-[calc(100vh-124px)] overflow-y-auto shrink-0" :pt="{ body: { class: '!px-0' } }">
		<template #content>
			<div>
				<div class="flex justify-between items-center mb-2 pl-4">
					<div class="text-xl font-semibold">
						Boards
					</div>
					<div class="pi pi-plus cursor-pointer text-zinc-400 transition-colors hover:text-white cursor-pointer pl-[13px] pr-4" @click="isCreateBoardDialogOpen = true" />
				</div>
				<ul v-if="boards && boards.length">
					<li v-for="board in boards" :key="board.id">
						<RouterLink :to="`/teams/${teamId}/boards/${board.id}`" class="cursor-pointer transition-colors block hover:bg-gray-500/50 px-4 py-2">
							{{ board.name }}
						</RouterLink>
					</li>
				</ul>
				<div v-else>
					<p class="text-zinc-400 text-sm px-4">
						No Boards Found
					</p>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex justify-between items-center mb-2 pl-4">
					<div class="text-xl font-semibold">
						Chats
					</div>
					<div class="relative" >
						<div class="pi pi-plus cursor-pointer text-zinc-400 transition-colors hover:text-white cursor-pointer pl-[13px] pr-4" @click="togglePopover" />
						<Popover ref="memberPopover">
							<div>
								<ul class="flex flex-col gap-2">
									<li
										v-for="user in otherMembers"
										:key="user.id"
										@click="handleCreateChat(user.userId)"
										class="flex items-center gap-2 hover:bg-gray-500/50 rounded-md px-2 py-1 cursor-pointer transition-colors"
									>
										<div class="flex items-center gap-2">
											<div class="w-[24px] h-[24px] bg-zinc-400/50 rounded-full" />
										</div>
										<span>
											{{ user.username }}
										</span>
									</li>
								</ul>
							</div>
						</Popover>
					</div>
				</div>
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { BoardsAPI, type CreateBoardRequest } from '../modules/Boards';
import { TeamsAPI } from '../api/teams';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/modules/Auth';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Popover from 'primevue/popover';
import { ChatList } from '../modules/Chats';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const queryClient = useQueryClient();

const isCreateBoardDialogOpen = ref(false);
const memberPopover = ref();
const boardName = ref('');

const teamId = computed(() => route.params.teamId as string);
const otherMembers = computed(() => {
	return team.value?.members?.filter((member) => member.userId !== authStore.user?.id);
});

const { data: boards } = useQuery({
	queryKey: ['boards', teamId.value],
	queryFn: () => BoardsAPI.getBoards(teamId.value),
});

const { data: team } = useQuery({
	queryKey: ['team', teamId.value],
	queryFn: () => TeamsAPI.getTeamInfo(teamId.value),
});

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

const handleCreateChat = (userId: string) => {
	router.push(`/teams/${teamId.value}/chats/new/${userId}`);
	memberPopover.value.hide();
};

const togglePopover = (event: MouseEvent) => {
	memberPopover.value.toggle(event);
};

const handleChatSelect = (chat: Chat) => {
	router.push(`/teams/${teamId.value}/chats/${chat.id}`);
};

const handleCreateBoard = () => {
	createBoard({ name: boardName.value, teamId: teamId.value });
};
</script>