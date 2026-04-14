<template>
	<div v-if="team">
		<div class="flex justify-between items-center mb-6">
			<div class="flex items-center gap-2">
				<i 
					class="pi pi-arrow-left before:text-xl text-zinc-400 transition-colors hover:text-white cursor-pointer p-1" 
					@click="router.push('/teams')" 
				/>
				<h1 class="text-xl leading-6 font-bold">
					{{ team.name }}
				</h1>
				<div class="flex items-center gap-1">
					<span class="pi pi-users before:text-xl" />
					<span>{{ team.members?.length || 0 }}</span>
				</div>
			</div>
		</div>

		<div class="flex gap-4 mb-8">
			<Card class="w-86" :pt="{ body: { class: '!px-0' } }">
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
								<Popover ref="memberPopover" :pt="{ root: { class: '' } }">
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
			<div class="flex-1">
				<div class="flex justify-end flex-1 gap-2">
					<Button
						label="New Task"
						icon="pi pi-plus"
						@click="isCreateTaskDialogOpen = true"
					/>
					<RouterLink :to="`/teams/${teamId}/tasks`">
						<Button
							label="All Tasks"
							icon="pi pi-list"
						/>
					</RouterLink>
					<RouterLink v-if="member?.role === 'OWNER' || member?.role === 'ADMIN'" :to="`/teams/${teamId}/manage`">
						<Button
							label="Manage Team"
							icon="pi pi-users"
						/>
					</RouterLink>
				</div>
				<div>IN DEVELOPMENT</div>
			</div>
		</div>
	</div>
	<div v-else>
		<div class="flex justify-center items-center flex-1">
			<p class="text-3xl font-bold">
				Team Not Found
			</p>
		</div>
	</div>
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
	<CreateTaskModal
		v-if="isCreateTaskDialogOpen"
		v-model:visible="isCreateTaskDialogOpen"
		:boards="boards || []"
	/>
</template>

<script setup lang="ts">
import type { Board, Chat } from '@/shared/types/entities';
import type { CreateBoardRequest } from '@/modules/Teams';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient, useMutation, useQuery } from '@tanstack/vue-query';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/modules/Auth';
import { 
	BoardsAPI,
	TeamsAPI,
	CreateTaskModal, 
	ChatList,
} from '@/modules/Teams';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Popover from 'primevue/popover';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const queryClient = useQueryClient();
const authStore = useAuthStore();

const teamId = route.params.teamId as string;

const isCreateBoardDialogOpen = ref(false);
const isCreateTaskDialogOpen = ref(false);
const boardName = ref('');
const memberPopover = ref();
	
const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const { data: boards } = useQuery({
	queryKey: ['boards', teamId],
	queryFn: () => BoardsAPI.getBoards(teamId),
});

const { mutate: createBoard } = useMutation({
	mutationFn: (data: CreateBoardRequest) => BoardsAPI.createBoard({ ...data, teamId }),
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

const member = computed(() => {
	return team.value?.members?.find((member) => member.userId === authStore.user?.id);
});

const otherMembers = computed(() => {
	return team.value?.members?.filter((member) => member.userId !== authStore.user?.id);
});

const handleCreateBoard = () => {
	createBoard({ name: boardName.value, teamId });
};

const handleCreateChat = (userId: string) => {
	router.push(`/teams/${teamId}/chats/new/${userId}`);
};

const togglePopover = (event: MouseEvent) => {
	memberPopover.value.toggle(event);
};

const handleChatSelect = (chat: Chat) => {
	// markChatAsRead(chat.id);
	router.push(`/teams/${teamId}/chats/${chat.id}`);
};

// const markChatAsRead = (id: string) => {
// 	queryClient.setQueryData(['chats', teamId], (old: Chat[]) => {
// 		return old.map((chat) => {
// 			if (chat.id !== id) return chat;
// 			return { ...chat, unreadCount: 0 };
// 		});
// 	});
// };
</script>
