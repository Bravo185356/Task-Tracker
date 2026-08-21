<template>
    <Dialog
		:visible="props.isOpen"
		header="Create Board"
		:modal="true"
		class="w-96"
        @update:visible="closeModal"
	>
        <form @submit.prevent="handleCreateBoard">
            <div class="flex flex-col gap-4">
                <InputText v-model="boardName" placeholder="Board Name" />
            </div>
            <div class="flex gap-3 mt-6">
                <Button
                    severity="secondary"
                    label="Cancel"
                    fluid
                    @click="closeModal"
                />
                <Button
                    label="Create"
                    fluid
                    type="submit"
                />
            </div>
        </form>
	</Dialog>
</template>

<script setup lang="ts">
import type { Board } from '@/shared/types/entities';
import type { CreateBoardRequest } from '../api/boards.types';
import { useRoute } from 'vue-router';
import { BoardsAPI } from '../api/boards';
import { computed, ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const toast = useToast();
const route = useRoute();
const queryClient = useQueryClient();

const boardName = ref('');
const teamId = computed(() => route.params.teamId as string);

const { mutate: createBoard } = useMutation({
	mutationFn: (data: CreateBoardRequest) => BoardsAPI.createBoard({ ...data, teamId: teamId.value }),
	onSuccess: (data: Board) => {
		toast.add({
			severity: 'success',
			summary: 'Board created',
			detail: 'Board has been created',
            life: 3000,
		});
		
		queryClient.setQueryData(['boards', teamId], (old: Board[]) => [...old, data]);
        closeModal();
	},
	onError: () => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to create board',
            life: 3000,
		});
	},
});

const handleCreateBoard = () => {
	createBoard({ name: boardName.value, teamId: teamId.value });
};

const closeModal = () => {
	emit('close');
	boardName.value = '';
};
</script>