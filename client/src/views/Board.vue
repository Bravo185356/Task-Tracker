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
				<div v-if="teamsStore.isAdminOrOwner" class="flex items-center gap-2">
					<Button
						icon="pi pi-trash"
						outlined
						severity="danger"
						label="Delete"
						@click="handleDeleteBoard"
					/>
				</div>
			</div>
			<div class="flex gap-4 overflow-x-auto flex-1 pb-6">
				<Column
					v-for="column in columns"
					:key="column.id"
					:column-params="column"
					:board="board"
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
	useTeamsStore
} from '@/modules/Teams';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';

const router = useRouter();
const route = useRoute();
const teamsStore = useTeamsStore();

const boardId = route.params.boardId as string;

useBoardWebSocket(boardId);

const { data: board, isLoading, error } = useQuery({
	queryKey: ['board', boardId],
	queryFn: () => BoardsAPI.getBoard(boardId),
	refetchOnMount: true,
	staleTime: 0,
});

const handleDeleteBoard = () => {
	console.log('delete board');
};
</script>
