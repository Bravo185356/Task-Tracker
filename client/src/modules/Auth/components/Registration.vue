<template>
	<div class="flex flex-col gap-2">
		<form @submit.prevent="register">
			<div class="flex flex-col gap-2">	
				<div class="flex flex-col gap-2">
					<label for="email" class="leading-5">Email <span class="text-red-500">*</span></label>
					<InputText
						id="email"
						v-model="email"
						autocomplete="off"
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="username" class="leading-5">Username <span class="text-red-500">*</span></label>
					<InputText
						id="username"
						v-model="username"
						autocomplete="off"
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="password" class="leading-5">Password <span class="text-red-500">*</span></label>
					<Password
						id="password"
						v-model="password"
						autocomplete="off"
						:feedback="false"
						fluid
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="confirmPassword" class="leading-5">Confirm Password <span class="text-red-500">*</span></label>
					<div class="flex flex-col gap-1">
						<Password
							id="confirmPassword"
							v-model="confirmPassword"
							autocomplete="off"
							:feedback="false"
							fluid
						/>
						<small v-if="password.length && confirmPassword.length && !isPasswordValid" class="text-red-500">Passwords do not match</small>
					</div>
				</div>
			</div>
			<div class="flex justify-end gap-2 mt-4">
				<Button
					type="button"
					label="Cancel"
					severity="secondary"
					fluid
					@click="emit('login')"
				/>
				<Button
					type="submit"
					label="Register"
					fluid
					:disabled="!isValid"
				/>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { RegisterFormData } from '../api/auth.types';
import { useMutation } from '@tanstack/vue-query';
import { AuthAPI } from '../api/auth';
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { checkEmail } from '../utilities';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const emit = defineEmits<{
	'login': []
}>();

const toast = useToast();

const registerMutation = useMutation({
	mutationFn: ({ email, password, username }: RegisterFormData) => AuthAPI.register(email, password, username),
	onSuccess: () => {
		emit('login');
		toast.add({
			severity: 'success',
			summary: 'Registration successful',
			detail: 'You can now login to your account',
			life: 3000,
		});
	},
	onError: (error) => {
		toast.add({
			severity: 'error',
			summary: 'Registration Failed',
			detail: error.message,
			life: 3000,
		});
	},
});

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const isPasswordValid = computed(() => {
	return password.value === confirmPassword.value;
});
	
const isValid = computed(() => {
	
	return isPasswordValid.value && checkEmail(email.value) && username.value.length;
});
	
function register() {
	registerMutation.mutate({ email: email.value, password: password.value, username: username.value });
}
</script>