<template>
	<div 
		v-if="!url" 
		:style="{ width: `${size}px`, height: `${size}px` }"
		class="rounded-full bg-zinc-700 flex items-center justify-center"
	/>
	<Avatar 
		v-else 
		:image="image" 
		:pt="{ root: { style: { width: `${size}px`, height: `${size}px` } } }" 
		shape="circle" 
	/>
</template>

<script setup lang="ts">
import { API_URL } from '@/app/config/api';
import { computed } from 'vue';
import Avatar from 'primevue/avatar';

const props = withDefaults(defineProps<{
	url: string | null;
	size?: number
}>(), {
	size: 40,
});

const image = computed(() => {
	return `${API_URL}${props.url}`;
});
</script>