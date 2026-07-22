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
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { BoardsAPI } from '../api/boards';

const props = defineProps<{
    teamId: string;
}>();

const emit = defineEmits(['createBoard']);

const { data: boards } = useQuery({
	queryKey: ['boards', props.teamId],
	queryFn: () => BoardsAPI.getBoards(props.teamId),
});
</script>