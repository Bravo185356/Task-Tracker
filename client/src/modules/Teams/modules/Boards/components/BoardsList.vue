<template>
    <div>
        <div class="flex justify-between items-center mb-2 pl-4">
            <div class="text-xl font-semibold">
                Boards
            </div>
            <div 
                class="pi pi-plus text-zinc-400 transition-colors hover:text-white cursor-pointer pl-[13px] pr-4" 
                @click="emit('createBoard')" 
            />
        </div>
        <ul v-if="boards && boards.length">
            <li 
                v-for="board in boards" 
                :key="board.id" 
                class="group cursor-pointer transition-colors hover:bg-gray-500/50 px-4 py-2"
            >
                <RouterLink :to="`/teams/${teamId}/boards/${board.id}`" class="flex gap-3 justify-between items-center">
                    <span class="flex-1 truncate">{{ board.name }}</span>
                    <button
                        v-if="teamsStore.isAdminOrOwner"
                        type="button"
                        class="opacity-0 group-hover:opacity-100 items-center cursor-pointer justify-center transition-colors rounded-md text-red-400 hover:text-red-500"
                        @click="handleDeleteBoard(board.id)"
                    >
                        <i class="pi pi-trash" />
                    </button>
                </RouterLink>
            </li>
        </ul>
        <div v-else>
            <p class="text-zinc-400 text-sm px-4">
                No Boards Found
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { BoardsAPI } from '../api/boards';
import { useTeamsStore } from '../../../store/index';

const props = defineProps<{
    teamId: string;
}>();

const emit = defineEmits(['createBoard']);
const teamsStore = useTeamsStore();

const { data: boards } = useQuery({
	queryKey: ['boards', props.teamId],
	queryFn: () => BoardsAPI.getBoards(props.teamId),
});

const handleDeleteBoard = (boardId: string) => {
	console.log('delete board');
};
</script>