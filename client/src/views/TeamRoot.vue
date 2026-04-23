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
import { useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { BoardsAPI, TeamsAPI, ChatsAPI, useTeamChatsWs } from '@/modules/Teams';
import { useTeamsStore } from '@/modules/Teams';
import { useAuthStore } from '@/modules/Auth';
import ProgressSpinner from 'primevue/progressspinner';
import MainPanel from '@/modules/Teams/components/MainPanel.vue';

const route = useRoute();
const teamsStore = useTeamsStore();
const authStore = useAuthStore();

const teamId = computed(() => route.params.teamId as string);
const showMainPanel = computed(() => route.name !== 'ChatPage' && route.name !== 'NewChatPage');

useTeamChatsWs(teamId);

const { data: team, isLoading: isTeamLoading } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId.value),
});

const { isLoading: isBoardsLoading } = useQuery({
	queryKey: ['boards', teamId],
	queryFn: () => BoardsAPI.getBoards(teamId.value),
});

const { isLoading: isChatsLoading } = useQuery({
	queryKey: ['chats', teamId],
	queryFn: () => ChatsAPI.getChats(teamId.value),
});

const isReady = computed(() => !isTeamLoading.value && !isBoardsLoading.value && !isChatsLoading.value);

watch(isReady, () => {
	if (isReady.value) {
		teamsStore.myRole = team.value!.members?.find((member) => member.userId === authStore.user?.id)!.role;
	}
});
</script>
