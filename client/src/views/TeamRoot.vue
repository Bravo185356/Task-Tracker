<template>
    <PageHeader
        v-if="showPageHeader"
        :breadcrumb-items="breadcrumbItems"
        :is-loading="isTeamLoading"
    />
	<div class="relative flex flex-1 gap-6">
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
import { useTeamBreadcrumbs } from '@/shared/composables/useTeamBreadcrumbs';
import PageHeader from '@/shared/components/PageHeader.vue';

const route = useRoute();
const teamsStore = useTeamsStore();
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const teamId = computed(() => route.params.teamId as string);
const showMainPanel = computed(() => route.name !== 'ChatPage' && route.name !== 'NewChatPage');
const enabledBoardsAndChats = computed(() => !!team.value);
const showPageHeader = computed(() => !route.matched.some(record => record.meta.hidePageHeader));

useTeamChatsWs(teamId);

const { data: team, isLoading: isTeamLoading, error: isTeamError } = useQuery({
	queryKey: ['team', teamId.value],
	queryFn: () => TeamsAPI.getTeamInfo(teamId.value),
	retry: false,
});

const breadcrumbItems = useTeamBreadcrumbs(computed(() => team.value?.name));

useQuery({
	queryKey: ['boards', teamId.value],
	queryFn: () => BoardsAPI.getBoards(teamId.value),
	enabled: enabledBoardsAndChats
});

useQuery({
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

watch(isTeamLoading, () => {
	if (!isTeamLoading.value) {
		teamsStore.myRole = team.value!.members?.find((member) => member.userId === authStore.user?.id)!.role;
	}
});
</script>
