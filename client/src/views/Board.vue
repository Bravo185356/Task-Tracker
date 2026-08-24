<template>
	<div v-if="isLoading" class="flex flex-1 justify-center items-center min-h-96">
		<ProgressSpinner />
	</div>
	<div v-else-if="error">
		<div class="flex justify-center items-center min-h-96" />
		<p class="text-red-500 text-sm">
			{{ error.message }}
		</p>
	</div>
	<div v-else-if="board" class="flex flex-col overflow-y-auto">
		<div class="flex flex-col flex-1">
			<div class="flex gap-4 overflow-x-auto flex-1 pb-6">
				<Column
					v-for="column in columns"
					:key="column.id"
					:column-params="column"
					:board="board"
					:team-members="teamMembers"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { 
	useBoardWebSocket, 
	Column, 
	columns, 
	BoardsAPI,
	useTeamMembers
} from '@/modules/Teams';
import { computed } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';

const route = useRoute();

const boardId = computed(() => route.params.boardId as string);

useBoardWebSocket(boardId.value);

const { data: board, isLoading, error } = useQuery({
    queryKey: ['board', boardId],
	queryFn: () => BoardsAPI.getBoard(boardId.value),
	refetchOnMount: true,
	staleTime: 0,
});

const teamMembers = useTeamMembers(route.params.teamId as string);
</script>
