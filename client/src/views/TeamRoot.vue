<template>
	<div v-if="!isReady" class="flex justify-center items-center flex-1">
		<ProgressSpinner />
	</div>
	<div v-else class="flex flex-col flex-1">
		<router-view />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { BoardsAPI, TeamsAPI, ChatsAPI, useTeamChatsWs } from '@/modules/Teams';
import ProgressSpinner from 'primevue/progressspinner';

const route = useRoute();
const teamId = computed(() => route.params.teamId as string);

useTeamChatsWs(teamId);

const { isLoading: isTeamLoading } = useQuery({
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
</script>
