<template>
	<Dialog
		:visible="visible"
		modal
		header="Create Team"
		:style="{ width: '25rem' }"
		@update:visible="emit('update:visible', $event)"
	>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<label for="teamName" class="font-semibold">Team Name</label>
				<InputText
					id="teamName"
					v-model="teamName"
					autocomplete="off"
					fluid
					placeholder="Enter team name"
				/>
			</div>
			
			<div class="flex justify-end gap-2">
				<Button
					label="Cancel"
					severity="secondary"
					@click="handleClose"
				/>
				<Button
					label="Create"
					:disabled="!teamName.trim() || isPending"
					:loading="isPending"
					@click="handleCreate"
				/>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { TeamsAPI } from '../api/teams';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

defineProps<{
	visible: boolean;
}>();

const emit = defineEmits<{
	'update:visible': [value: boolean]
}>();

const toast = useToast();
const queryClient = useQueryClient();

const teamName = ref('');

const { mutate, isPending } = useMutation({
	mutationFn: (name: string) => TeamsAPI.createTeam({ name }),
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Team created successfully',
			life: 3000,
		});
		queryClient.invalidateQueries({ queryKey: ['teams'] });
		handleClose();
	},
	onError: (error: Error) => {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: error.message || 'Failed to create team',
			life: 5000,
		});
	},
});

const handleCreate = () => {
	if (teamName.value.trim()) {
		mutate(teamName.value.trim());
	}
};

const handleClose = () => {
	teamName.value = '';
	emit('update:visible', false);
};
</script>
