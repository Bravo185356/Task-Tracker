<template>
	<div>
		<Button
			label="View My Teams"
			@click="router.push('/teams')"
		/>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();
</script>