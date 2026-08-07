<template>
	<div class="flex flex-col flex-1 max-w-xl mx-auto w-full">
		<div class="mb-6">
			<h1 class="text-2xl font-bold">Settings</h1>
		</div>
		<Card v-if="authStore.user">
			<template #content>
				<form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
					<div class="flex flex-col gap-2">
						<label for="username" class="leading-5">Username</label>
						<InputText
							id="username"
							v-model="username"
							placeholder="Enter New Username"
							fluid
						/>
					</div>
					<div class="flex flex-col gap-2">
						<label for="email" class="leading-5">Email</label>
						<InputText
							id="email"
							v-model="email"
							placeholder="Enter New Email"
							fluid
						/>
						<small v-if="email.length && !isEmailValid" class="text-red-500">
							Invalid email
						</small>
					</div>
					<div class="flex flex-col gap-2">
						<label for="password" class="leading-5">New password</label>
						<Password
							id="password"
							v-model="password"
							:feedback="false"
							placeholder="Enter New Password"
							fluid
						/>
					</div>
					<div class="flex flex-col gap-2">
						<label for="password" class="leading-5">Confirm password</label>
						<Password
							id="password"
							v-model="confirmPassword"
							:feedback="false"
							placeholder="Repeat New Password"
							fluid
							:disabled="!password.length"
						/>
						<small
							v-if="password.length && confirmPassword.length && !isPasswordValid"
							class="text-red-500"
						>
							Passwords do not match
						</small>
					</div>
                    <AvatarUpload
						ref="avatarUploadRef"
						v-model="avatar"
						:current-url="authStore.user.avatar"
					/>
					<div class="flex justify-end gap-2">
						<Button
							fluid
							type="submit"
							label="Save changes"
							icon="pi pi-check"
							:loading="updateMutation.isPending.value"
							:disabled="!canSubmit"
						/>
					</div>
				</form>
			</template>
		</Card>
		<div v-else class="text-zinc-400">
			Please log in to edit your profile.
		</div>
	</div>
</template>

<script setup lang="ts">
import type { User } from '@/shared/types/entities';
import { computed, ref, watch } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/modules/Auth';
import { UserAPI } from '@/modules/User';
import { checkEmail } from '@/modules/Auth/utilities';
import AvatarUpload from '@/shared/components/AvatarUpload.vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const authStore = useAuthStore();
const toast = useToast();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const avatar = ref<File | null>(null);
const avatarUploadRef = ref<InstanceType<typeof AvatarUpload> | null>(null);

watch(() => authStore.user, (user) => {
        if (!user) {
            return;
        };
        
        username.value = user.username;
        email.value = user.email;
    }, 
    { immediate: true }
);

const isEmailValid = computed(() => !!checkEmail(email.value));

const isPasswordValid = computed(() => {
	if (!password.value.length) {
        return true;
    };
	return password.value.length >= 6 && password.value === confirmPassword.value;
});

const hasChanges = computed(() => {
	const user = authStore.user;
	if (!user) {
        return false;
    };

	return (
		username.value !== user.username ||
		email.value !== user.email ||
		password.value.length > 0 ||
		avatar.value != null
	);
});

const updateMutation = useMutation({
	mutationFn: () => {
		const user = authStore.user!;
		const payload: {
			username?: string;
			email?: string;
			password?: string;
			confirmPassword?: string;
			avatar?: File | null;
		} = {};

		if (username.value !== user.username) {
			payload.username = username.value.trim();
		}
		if (email.value !== user.email) {
			payload.email = email.value.trim();
		}
		if (password.value) {
			payload.password = password.value;
			payload.confirmPassword = confirmPassword.value;
		}
		if (avatar.value) {
			payload.avatar = avatar.value;
		}

		return UserAPI.updateProfile(payload);
	},
	onSuccess: (user: User) => {
		authStore.login({ user });
		password.value = '';
		confirmPassword.value = '';
		avatarUploadRef.value?.clear();
        
		toast.add({
			severity: 'success',
			summary: 'Profile updated',
			detail: 'Your profile has been saved',
			life: 3000,
		});
	},
	onError: (error: Error) => {
		toast.add({
			severity: 'error',
			summary: 'Update failed',
			detail: error.message,
			life: 3000,
		});
	},
});

const canSubmit = computed(() => {
	return (
		hasChanges.value &&
		username.value.trim().length >= 2 &&
		isEmailValid.value &&
		isPasswordValid.value &&
		!updateMutation.isPending.value
	);
});

function handleSubmit() {
	if (!canSubmit.value) {
        return;
    };
	updateMutation.mutate();
}
</script>