<template>
	<div 
		v-if="!url" 
		:style="{ width: `${size}px`, height: `${size}px` }"
		class="rounded-full bg-zinc-700 flex items-center justify-center"
	/>
	<Avatar 
		v-else 
		:image="url" 
		:pt="{ root: { style: { width: `${size}px`, height: `${size}px` } } }" 
		shape="circle" 
	/>
</template>

<script setup lang="ts">
import Avatar from 'primevue/avatar';

const { url, size = 40 } = defineProps<{
	url: string | null;
	size?: number;
}>();
</script>