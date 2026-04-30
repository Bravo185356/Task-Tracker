<template>
	<Card>
		<template #content>
			<div class="flex justify-between items-center gap-2 mb-2">
				<div class="flex">
					<div class="flex items-center gap-2">
						<Tag
							v-if="task.priority"
							:value="task.priority"
							:class="getPriorityTagClass(task.priority)"
						/>
					</div>
					<RouterLink :to="`/teams/${teamId}/tasks/${task.id}`">
						<h4 class="text-2xl font-bold cursor-pointer hover:text-blue-500">
							{{ task.title }}
						</h4>
					</RouterLink>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Tag
					:value="getTaskStatusLabel(task.status)"
					:class="getTagClasses(task.status)"
				/>
				<div v-if="task.assignedTo">
					<span class="text-sm text-zinc-400">Assigned to {{ getAssignedUser(task.assignedTo) }}</span>
				</div>
				<span v-else class="text-sm text-zinc-400">Unassigned</span>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Task, Team } from '@/shared/types/entities';
import { taskStatuses } from '../constants/taskStatuses';
import { getPriorityTagClass } from '../utilities/getPriorityClasses';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { useQueryClient } from '@tanstack/vue-query';

const props = defineProps<{
	task: Task;
}>();

const queryClient = useQueryClient();

const teamId = props.task.teamId;
const team = queryClient.getQueryData<Team>(['team', teamId]);

const getTagClasses = (taskStatus: string) => taskStatuses.find((status) => status.value === taskStatus)!.tagClass;
const getTaskStatusLabel = (taskStatus: string) => taskStatuses.find((status) => status.value === taskStatus)!.label;
const getAssignedUser = (userId: string | null) => team!.members.find((member) => member.userId === userId)?.username;
</script>