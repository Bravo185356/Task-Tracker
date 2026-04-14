<template>
	<Card class="">
		<template #content>
			<div class="flex justify-between items-center gap-2">
				<div class="flex items-center gap-2">
					<h3 class="text-lg font-bold">
						{{ team.name }}
					</h3>
					<div v-if="isOwner" class="pi pi-crown" />
				</div>
				<div
					v-if="isOwner"
					class="pi pi-cog cursor-pointer"
					@click="handleSettings"
				/>
			</div>
			<p class="text-sm">
				{{ team.members?.length || 0 }} {{ team.members?.length === 1 ? 'Member' : 'Members' }}
			</p>
			<div class="flex gap-2 mt-4">
				<Button
				label="View"
				icon="pi pi-eye"
				severity="primary"
				outlined
				fluid
				@click="handleView"
				/>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Team } from '@/shared/types/entities';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/Auth';
import Button from 'primevue/button';
import Card from 'primevue/card';

const props = defineProps<{
	team: Team;
}>();

const router = useRouter();
const authStore = useAuthStore();

const isOwner = computed(() => {
	return props.team.members?.some(member => member.userId === authStore.user?.id && member.role === 'OWNER');
});

const handleView = () => {
	router.push(`/teams/${props.team.id}`);
};

const handleSettings = () => {
	router.push(`/teams/${props.team.id}/settings`);
};
</script>