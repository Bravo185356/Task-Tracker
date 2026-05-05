<template>
	<div v-if="!isReady" class="flex justify-center items-center flex-1">
		<ProgressSpinner />
	</div>
	<div v-else class="relative flex flex-1 gap-6">
		<MainPanel v-if="showMainPanel" />
		<router-view />
	</div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { BoardsAPI, TeamsAPI, ChatsAPI, useTeamChatsWs, MainPanel, useTeamsStore } from '@/modules/Teams';
import { useAuthStore } from '@/modules/Auth';
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';

const route = useRoute();
const teamsStore = useTeamsStore();
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const teamId = computed(() => route.params.teamId as string);
const showMainPanel = computed(() => route.name !== 'ChatPage' && route.name !== 'NewChatPage');
const isReady = computed(() => team.value && boards.value && chats.value);
const enabledBoardsAndChats = computed(() => !!team.value);

useTeamChatsWs(teamId);

const { data: team, error: isTeamError } = useQuery({
	queryKey: ['team', teamId.value],
	queryFn: () => TeamsAPI.getTeamInfo(teamId.value),
	retry: false,
});

const { data: boards } = useQuery({
	queryKey: ['boards', teamId.value],
	queryFn: () => BoardsAPI.getBoards(teamId.value),
	enabled: enabledBoardsAndChats
});

const { data: chats } = useQuery({
	queryKey: ['chats', teamId.value],
	queryFn: () => ChatsAPI.getChats(teamId.value),
	enabled: enabledBoardsAndChats
});

watch(isTeamError, () => {
	if (isTeamError.value) {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: isTeamError.value.message,
		});
		
		router.push('/teams');
	}
});

watch(isReady, () => {
	if (isReady.value) {
		teamsStore.myRole = team.value!.members?.find((member) => member.userId === authStore.user?.id)!.role;
	}
});
</script>
