<template>
	<div v-if="!url" class="w-[40px] h-[40px] rounded-full bg-zinc-700 flex items-center justify-center" />
	<Avatar v-else :image="image" :pt="{ root: { class: '!w-[40px] !h-[40px]' }}" shape="circle" />
</template>

<script setup lang="ts">
import { API_URL } from '@/app/config/api';
import { computed } from 'vue';
import Avatar from 'primevue/avatar';

const props = defineProps<{
	url: string | null;
}>();

const image = computed(() => {
	return `${API_URL}${props.url}`;
});
</script>