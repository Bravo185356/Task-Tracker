<template>
	<Card class="h-full transition-all duration-200">
		<template #content>
			<article class="flex h-full flex-col gap-4 rounded-xl">
				<header class="flex items-start justify-between gap-3">
					<RouterLink :to="`/teams/${teamId}/tasks/${task.id}`" class="max-w-[40%]">
						<h4 class="text-lg font-semibold leading-6 transition-colors hover:text-blue-400 truncate">
							{{ task.title }}
						</h4>
					</RouterLink>
                    <div class="flex items-center gap-2">
                        <Tag
                            v-if="task.priority"
                            :value="getPriorityLabel(task.priority)"
                            :class="getPriorityTagClass(task.priority)"
                        />
                        <Tag
                            :value="getStatusLabel(task.status)"
                            :class="getStatusTagClass(task.status)"
                        />
                    </div>
				</header>
				<div class="flex flex-wrap items-center gap-2">
                    <div class="flex items-center gap-1">
                        <Avatar :size="28" :url="task.assigned?.avatar ?? null" />
                        <span class="text-sm font-medium text-zinc-400">{{ task.assigned?.username ?? 'Unassigned' }}</span>
                    </div>
				</div>
				<footer class="mt-auto flex items-center gap-2 text-xs text-zinc-400">
					<i class="pi pi-calendar" />
					<span>{{ dueDateLabel }}</span>
				</footer>
			</article>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Task } from '@/shared/types/entities';
import { getPriorityTagClass, getPriorityLabel } from '../utilities/taskPriority';
import { getStatusTagClass, getStatusLabel } from '../utilities/taskStatus';
import { computed } from 'vue';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Avatar from '@/shared/components/Avatar.vue';

const props = defineProps<{
	task: Task;
}>();

const teamId = props.task.teamId;

const dueDateLabel = computed(() => {
	if (!props.task.startedAt && !props.task.endedAt) {
		return '-';
	} else if(!props.task.startedAt || !props.task.endedAt) {
		return new Date(props.task.startedAt || props.task.endedAt!).toLocaleDateString();
	} else {
		return `${new Date(props.task.startedAt!).toLocaleDateString()} - ${new Date(props.task.endedAt!).toLocaleDateString()}`;
	}
});
</script>