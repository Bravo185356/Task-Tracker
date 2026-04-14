<template>
	<Dialog
		:visible="visible"
		modal
		:header="isRegister ? 'Registration' : 'Login'"
		:style="{ width: '25rem' }"
		@update:visible="emit('update:visible', $event)"
	>
		<Login 
			v-if="!isRegister" 
			@register="isRegister = true" 
		/>
		<Registration 
			v-else 
			@login="isRegister = false"
		/>
	</Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Login from './Login.vue';
import Registration from './Registration.vue';
import Dialog from 'primevue/dialog';

defineProps<{
	visible: boolean;
}>();

const emit = defineEmits<{
	'update:visible': [value: boolean]
}>();

const isRegister = ref(false);
</script>