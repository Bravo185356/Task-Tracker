<template>
	<Card class="group cursor-pointer transition-all duration-300 border !border-zinc-600/50">
		<template #content>
			<div class="p-2">
				<h4 class="text-base font-semibold text-white mb-3 leading-tight line-clamp-2 group-hover:text-white/90 transition-colors">
					{{ task.title }}
				</h4>
				<Divider class="my-3" />
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Avatar
							:url="assignedMember?.avatar ?? null"
							:size="28"
						/>
						<span v-if="task.assignedTo" class="text-xs text-zinc-400 font-medium">{{ assignedMember?.username }}</span>
                        <span v-else class="text-xs text-zinc-500">Unassigned</span>
					</div>
					<div v-if="task.priority" class="flex items-center gap-2">
						<Tag 
							:value="task.priority"
							size="small"
							:severity="task.priority === 'LOW' ? 'success' : task.priority === 'NORMAL' ? 'info' : task.priority === 'HIGH' ? 'warning' : 'danger'"
							rounded
						/>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Task, TeamMember } from '@/shared/types/entities';
import { computed } from 'vue';
import Card from 'primevue/card';
import Avatar from '@/shared/components/Avatar.vue';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';

const props = defineProps<{
    task: Task;
    teamMembers: TeamMember[];
}>();

const assignedMember = computed(() => {
    return props.teamMembers.find((member) => member.userId === props.task.assignedTo);
});
</script>