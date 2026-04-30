<template>
	<Card class="group cursor-pointer transition-all duration-300 border !border-zinc-600/50">
		<template #content>
			<div class="p-2">
				<h4 class="text-base font-semibold text-white mb-3 leading-tight line-clamp-2 group-hover:text-white/90 transition-colors">
					{{ task.title }}
				</h4>
				<Divider class="my-3" />
				<div class="flex items-center justify-between">
					<div v-if="task.assigned" class="flex items-center gap-2">
						<Avatar 
							:label="task.assigned.username.charAt(0).toUpperCase()"
							size="small"
							shape="circle"
							class="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold"
						/>
						<span class="text-xs text-zinc-400 font-medium">{{ task.assigned.username }}</span>
					</div>
					<div v-else class="flex items-center gap-2">
						<Avatar 
							icon="pi pi-user"
							size="small"
							shape="circle"
							class="bg-zinc-700/50 text-zinc-500"
						/>
						<span class="text-xs text-zinc-500">Unassigned</span>
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
import type { Task } from '@/shared/types/entities';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';

const props = defineProps<{
	task: Task;
}>();
</script>