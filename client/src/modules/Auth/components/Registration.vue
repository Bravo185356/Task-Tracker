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
				<div class="flex flex-col gap-2">
					<label for="avatar" class="leading-5">Avatar</label>
					<div class="flex flex-col gap-1">
						<div class="flex items-center justify-between gap-3 cursor-pointer border-1 border-zinc-700/50 rounded-md p-2 h-[100px]" @click="avatarInputRef?.click()">
							<div class="flex flex-col gap-1 items-center px-2">
								<p>Select an avatar</p>
								<p class="text-surface-500">JPG, PNG, WEBP or GIF</p>
							</div>
							<input
								ref="avatarInputRef"
								id="avatar"
								type="file"
								class="hidden"
								accept="image/png,image/jpeg,image/webp,image/gif"
								@change="onAvatarChange"
							/>
							<div class="relative">
								<div 
									v-if="avatar" 
									class="absolute flex items-center justify-center top-[-4px] right-[-4px] z-10 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors" 
									@click.stop="avatar = null"
								>
									<i class="pi pi-times text-white before:text-xs translate-y-[-1px]" />
								</div>
								<div class="w-[80px] h-[80px] rounded-md overflow-hidden">
									<img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="Avatar Preview" class="w-full h-full object-cover">
									<div v-else class="w-full h-full bg-zinc-800 flex items-center justify-center" />
								</div>
							</div>
						</div>
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

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const avatar = ref<File | null>(null);
const avatarInputRef = ref<HTMLInputElement | null>(null);

const registerMutation = useMutation({
	mutationFn: ({ email, password, username, avatar }: RegisterFormData) => 
		AuthAPI.register(email, password, username, avatar),
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

const avatarPreviewUrl = computed(() => {
	return avatar.value ? URL.createObjectURL(avatar.value) : null;
});

const isPasswordValid = computed(() => {
	return password.value === confirmPassword.value;
});
	
const isValid = computed(() => {
	return isPasswordValid.value && checkEmail(email.value) && username.value.length;
});
	
function register() {
	registerMutation.mutate({
		email: email.value,
		password: password.value,
		username: username.value,
		avatar: avatar.value,
	});
}

function onAvatarChange(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	
	if (!file) {
		avatar.value = null;
		return;
	}

	const maxAvatarSizeBytes = 5 * 1024 * 1024;
	const allowedAvatarTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

	if (!allowedAvatarTypes.has(file.type)) {
		toast.add({
			severity: 'error',
			summary: 'Invalid file format',
			detail: 'Avatar must be JPG, PNG, WEBP or GIF',
			life: 3000,
		});
		
		input.value = '';
		avatar.value = null;
		return;
	}

	if (file.size > maxAvatarSizeBytes) {
		toast.add({
			severity: 'error',
			summary: 'File is too large',
			detail: 'Avatar must be smaller than 5MB',
			life: 3000,
		});
		
		input.value = '';
		avatar.value = null;
		return;
	}

	avatar.value = file;
}
</script>