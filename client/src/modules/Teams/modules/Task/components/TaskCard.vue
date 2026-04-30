<template>
	<Card class="h-full transition-all duration-200" :pt="{ body: { class: '!p-0' }, content: { class: '!p-0' } }">
		<template #content>
			<article class="flex h-full flex-col gap-4 rounded-xl p-4">
				<header class="flex items-start justify-between gap-3">
					<RouterLink :to="`/teams/${teamId}/tasks/${task.id}`" class="max-w-[80%]">
						<h4 class="text-lg font-semibold leading-6 transition-colors hover:text-blue-400 truncate">
							{{ task.title }}
						</h4>
					</RouterLink>
					<Tag
						v-if="task.priority"
						:value="getPriorityLabel(task.priority)"
						:class="getPriorityTagClass(task.priority)"
					/>
				</header>
				<div class="flex flex-wrap items-center gap-2">
					<Tag
						:value="getTaskStatusLabel(task.status)"
						:class="getTagClasses(task.status)"
						:pt="{ root: { class: 'h-[30px]' } }"
					/>
					<Tag
						severity="secondary"
						:pt="{ root: { class: ' h-[30px]' } }"
					>
						<div class="flex items-center gap-1">
							<Avatar
								v-if="assignedUser"
								:size="22"
								:url="assignedUser.avatar"
							/>
							<i v-else class="pi pi-user text-zinc-400" />
							<span class="text-xs text-zinc-400">{{ assignedUser?.username ?? 'Unassigned' }}</span>
						</div>
					</Tag>
				</div>
				<footer class="mt-auto flex items-center gap-2 text-xs text-zinc-400">
					<i class="pi pi-calendar" />
					<span>{{ createdAtLabel }}</span>
				</footer>
			</article>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Task, Team } from '@/shared/types/entities';
import { taskStatuses } from '../constants/taskStatuses';
import { getPriorityTagClass } from '../utilities/getPriorityClasses';
import { taskPriorities } from '../constants/taskPriorities';
import { useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Avatar from '@/shared/components/Avatar.vue';

const props = defineProps<{
	task: Task;
}>();

const queryClient = useQueryClient();

const teamId = props.task.teamId;
const team = queryClient.getQueryData<Team>(['team', teamId]);

const getTagClasses = (taskStatus: string) => taskStatuses.find((status) => status.value === taskStatus)!.tagClass;
const getTaskStatusLabel = (taskStatus: string) => taskStatuses.find((status) => status.value === taskStatus)!.label;
const getPriorityLabel = (taskPriority: string) => taskPriorities.find((priority) => priority.value === taskPriority)!.label;

const assignedUser = computed(() => {
	if (!props.task.assignedTo) {
		return null;
	}
	
	return team!.members.find((member) => member.userId === props.task.assignedTo);
});

const createdAtLabel = computed(() => {
	return new Date(props.task.createdAt).toLocaleDateString();
});
</script>