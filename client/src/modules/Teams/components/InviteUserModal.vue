<template>
	<Dialog
		:visible="visible"
		header="Invite User"
		:modal="true"
		class="w-96"
		@update:visible="emit('update:visible', $event)"
	>
		<form @submit.prevent="handleInviteUser">
			<div class="flex flex-col gap-2">
				<div class="flex flex-col gap-2">
					<label for="email" class="leading-5">Email</label>
					<InputText 
						id="email" 
						v-model="email" 
						placeholder="Enter Email" 
						fluid 
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="role" class="leading-5">Role</label>
					<Select 
						id="role" 
						v-model="role" 
						:options="roles" 
						option-label="label" 
						option-value="value" 
						placeholder="Select Role" 
						fluid
					/>
				</div>
			</div>
			<div class="flex gap-3 mt-4">
				<Button
					severity="secondary"
					label="Cancel"
					fluid
					@click="$emit('update:visible', false)"
				/>
				<Button
					label="Invite"
					fluid
					@click="handleInviteUser"
				/>
			</div>
		</form>
	</Dialog>
</template>

<script setup lang="ts">
import type { Role } from '@/shared/types/entities';
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { TeamsAPI } from '../api/teams';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

const props = defineProps<{
	teamId: string;
	visible: boolean;
}>();

const emit = defineEmits<{
	'update:visible': [value: boolean]
}>();

const toast = useToast();
const email = ref('');
const role = ref<Role>('MEMBER');
const roles: { label: string; value: Role }[] = [
	{ label: 'Admin', value: 'ADMIN' },
	{ label: 'Member', value: 'MEMBER' },
	{ label: 'Viewer', value: 'VIEWER' },
];

const { mutate: inviteUser } = useMutation({
	mutationFn: (data: { email: string; role: Role; teamId: string }) => TeamsAPI.inviteUser(data),
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'User invited',
			detail: 'User has been invited',
		});
	},
});

const handleInviteUser = () => {
	inviteUser({ email: email.value, role: role.value, teamId: props.teamId });
};
</script>