<template>
	<header class="fixed top-0 w-full z-10 p-4 bg-zinc-900 border-b border-zinc-700">
		<div class="flex justify-between items-center max-w-[1400px] mx-auto">
			<div class="flex items-center gap-12">
				<h1 class="text-xl font-bold cursor-pointer" @click="router.push('/')">
					Tasks
				</h1>
			</div>
			<div class="flex items-center gap-3">
				<div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
					<Avatar 
                        :url="authStore.user!.avatar" 
                        class="cursor-pointer" 
                        @click="togglePopover" 
                    />
                    <Popover ref="userPopover" :pt="{ content: { class: 'p-0!' } }">
                        <div class="font-medium px-4 pt-2 leading-6">
                            {{ authStore.user!.username }}
                        </div>
                        <Divider class="my-2!" />
                        <ul class="my-2">
                            <li class="hover:bg-zinc-500/50 transition-colors cursor-pointer flex items-center">
                                <RouterLink to="/settings" class="px-4 py-2 flex items-center">
                                    <i class="pi pi-cog mr-2" />
                                    <span class="font-medium">Settings</span>
                                </RouterLink>
                            </li>
                            <li class="px-4 py-2 flex items-center hover:bg-zinc-500/50 transition-colors cursor-pointer" @click="handleLogout">
                                <i class="pi pi-sign-out mr-2" />
                                <span class="cursor-pointer font-medium">Logout</span>
                            </li>
                        </ul>
                    </Popover>
				</div>
				<Button
                    v-if="!authStore.isAuthenticated"
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
import { ref } from 'vue';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Avatar from '@/shared/components/Avatar.vue';
import Popover from 'primevue/popover';

const router = useRouter();
const authStore = useAuthStore();
const teamsStore = useTeamsStore();
const queryClient = useQueryClient();

const userPopover = ref<InstanceType<typeof Popover>>();

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

const togglePopover = (event: Event) => {
	userPopover.value?.toggle(event);
};

const handleLogout = () => {
	logoutMutation.mutate();
    userPopover.value?.hide();
};
</script>