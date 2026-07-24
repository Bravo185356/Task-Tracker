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
		<div class="flex flex-col flex-1 max-h-[calc(100vh-124px)]">
			<div class="flex justify-between items-center mb-6">
				<div class="flex items-center gap-2">
					<i
						class="pi pi-arrow-left before:text-xl text-zinc-400 transition-colors hover:text-white cursor-pointer p-1"
						@click="router.back()"
					/>
					<div>
						<h1 class="text-xl font-bold text-white leading-5 tracking-tight">
							{{ board?.name || 'Project Board' }}
						</h1>
					</div>
				</div>
			</div>
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
import { useRouter, useRoute } from 'vue-router';
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

const router = useRouter();
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
