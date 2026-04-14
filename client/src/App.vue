<template>
	<div class="app-dark min-h-screen flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-zinc-100">
		<Header />
		<div class="flex flex-col max-w-[1436px] w-full mx-auto my-6 px-4 flex-1">
			<RouterView />
		</div>
		<Auth v-if="authStore.showAuthModal" v-model:visible="showAuthModal" />
		<Toast />
	</div>
</template>

<script setup lang="ts">
import { Auth, AuthAPI, type AuthResponse } from './modules/Auth';
import { onMounted, onUnmounted, computed, watch } from 'vue';
import { userChannelWs } from '@/app/config/userChannel.ws';
import { useMutation } from '@tanstack/vue-query';
import { useAuthStore } from './modules/Auth/store';
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import Header from '@/app/layout/Header.vue';

const authStore = useAuthStore();
const router = useRouter();

const showAuthModal = computed({
  get: () => authStore.showAuthModal,
  set: (value: boolean) => {
    if (value) {
      authStore.openAuthModal();
    } else {
      authStore.closeAuthModal();
    }
  }
});

const sessionCheckMutation = useMutation({
  mutationFn: () => AuthAPI.refresh(),
  onSuccess: (data: AuthResponse) => {
    console.log('Успешная авторизация по токену');
    authStore.login(data);
  },
  onError: (error) => {
    console.error('Ошибка авторизации по токену', error);
    authStore.openAuthModal();
    router.push('/');
  },
});

const handleAuthLogout = () => {
  authStore.logout();
  router.push('/');
};

watch(
  () => authStore.user?.id,
  (newId, oldId) => {
    if (oldId && oldId !== newId) {
      userChannelWs.leave(oldId);
    }
    if (newId) {
      userChannelWs.join(newId);
    }
  },
  { immediate: true },
);

onMounted(() => {
  sessionCheckMutation.mutate();
  window.addEventListener('auth:logout', handleAuthLogout);
});

onUnmounted(() => {
  window.removeEventListener('auth:logout', handleAuthLogout);
});
</script>