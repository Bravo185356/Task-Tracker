<template>
	<Avatar 
		v-if="!url" 
		:pt="{ root: { style: { width: `${size}px`, height: `${size}px` } } }"
		icon="pi pi-user"
		shape="circle"
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