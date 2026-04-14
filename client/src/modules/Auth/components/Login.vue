<template>
	<div class="flex flex-col gap-2">
		<form @submit.prevent="login">
			<div class="flex flex-col gap-2">
				<div class="flex flex-col gap-2">
					<label for="username" class="leading-5">Username or Email</label>
					<InputText
						id="username"
						v-model="username"
						autocomplete="off"
						fluid
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="password" class="leading-5">Password</label>
					<Password
						id="password"
						v-model="password"
						autocomplete="off"
						fluid
						:feedback="false"
					/>
				</div>
				<div class="flex items-start gap-1">
					<span class="text-sm">Don't have an account?</span>
					<Button
						text
						link
						label="Register"
						class="!p-0 !m-0 !text-sm !h-auto !border-none"
						@click="emit('register')"
					/>
				</div>
			</div>
			<div class="flex justify-end mt-4">
				<Button
					type="submit"
					label="Login"
					fluid
					:disabled="!username.length || !password.length || isPending"
					:loading="isPending"
				/>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { AuthResponse, LoginFormData } from '../api/auth.types';
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { AuthAPI } from '../api/auth';
import { useAuthStore } from '../store';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const emit = defineEmits<{
	'register': []
}>();

const authStore = useAuthStore();
const toast = useToast();

const { mutate, isPending } = useMutation({
	mutationFn: ({ username, password }: LoginFormData) => AuthAPI.login(username, password),
	onSuccess: (data: AuthResponse) => {
		authStore.login(data);	
	},
	onError: (error) => {
		toast.add({
			severity: 'error',
			summary: 'Login Failed',
			detail: error.message,
			life: 5000,
		});
	},
});

const username = ref('');
const password = ref('');

async function login() {
	mutate({ username: username.value, password: password.value });
};
</script>