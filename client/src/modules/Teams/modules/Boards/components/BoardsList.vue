<template>
    <div>
        <div class="flex justify-between items-center mb-2 pl-4">
            <div class="flex items-center gap-2">
                <div class="text-xl font-semibold">
                    Boards
                </div>
                <ProgressSpinner
                    v-if="deletingBoardIds.size > 0"
                    class="!w-5 !h-5"
                />
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
                        @click.stop.prevent="handleDeleteBoard(board.id)"
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
import type { Board } from '@/shared/types/entities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { BoardsAPI } from '../api/boards';
import { useTeamsStore } from '../../../store/index';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps<{
    teamId: string;
}>();

const emit = defineEmits(['createBoard']);

const teamsStore = useTeamsStore();
const queryClient = useQueryClient();
const confirm = useConfirm();
const toast = useToast();

const deletingBoardIds = ref(new Set<string>());

const { mutate: deleteBoard } = useMutation({
	mutationFn: (boardId: string) => BoardsAPI.deleteBoard(boardId),
	onSuccess: () => {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Board deleted successfully',
        });
	},
    onError: (_error, _boardId: string, context) => {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete board',
        });
        queryClient.setQueryData(['boards', props.teamId], context?.oldBoards);
    },
    onMutate: (boardId: string) => {
        const oldBoards = queryClient.getQueryData(['boards', props.teamId]) as Board[];
        deletingBoardIds.value.add(boardId);
        queryClient.setQueryData(
            ['boards', props.teamId], 
            oldBoards.filter((board) => board.id !== boardId)
        );
        
        return { oldBoards };
    },
    onSettled: (_data, _error, boardId: string) => {
        deletingBoardIds.value.delete(boardId);
    },
});

const { data: boards } = useQuery({
	queryKey: ['boards', props.teamId],
	queryFn: () => BoardsAPI.getBoards(props.teamId),
});

const handleDeleteBoard = (boardId: string) => {
    confirm.require({
        message: 'Are you sure you want to delete this board? This board is will be deleted.',
        header: 'Confirm your action',
        rejectProps: {
            label: 'No',
            severity: 'secondary',
            outlined: true,
            class: 'flex-1',
        },
        acceptProps: {
            label: 'Yes',
            class: 'flex-1',
        },
        accept: () => {
            deleteBoard(boardId);
        },
    });
};
</script>