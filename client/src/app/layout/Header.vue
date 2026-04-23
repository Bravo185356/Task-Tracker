<template>
	<header class="fixed top-0 w-full z-10 p-4 bg-zinc-900 border-b border-gray-200">
		<div class="flex justify-between items-center max-w-[1400px] mx-auto">
			<div class="flex items-center gap-12">
				<h1 class="text-xl font-bold cursor-pointer" @click="router.push('/')">
					Tasks
				</h1>
			</div>
			<div class="flex items-center gap-3">
				<div class="text-lg font-semibold">
					{{ authStore.user?.username }}
				</div>
				<Button
					text 
					:label="authStore.isAuthenticated ? 'Logout' : 'Login'"
					:icon="authStore.isAuthenticated ? 'pi pi-sign-out' : 'pi pi-sign-in'"
					@click="authStore.isAuthenticated ? handleLogout() : authStore.openAuthModal()" 
				/>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore, AuthAPI } from '@/modules/Auth';
import { useTeamsStore } from '@/modules/Teams';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();
const teamsStore = useTeamsStore();
const queryClient = useQueryClient();

const logoutMutation = useMutation({
	mutationFn: () => AuthAPI.logout(),
	onSuccess: () => {
		authStore.logout();
		queryClient.clear();
		teamsStore.resetTeamsStore();
		router.push('/');
	},
	onError: (error) => {
		console.error('Error logging out', error);
	}
});

const handleLogout = () => {
	logoutMutation.mutate();
};

</script>