<template>
	<Card>
		<template #content>
			<div class="space-y-5">
				<h3 class="text-lg font-semibold text-zinc-200">
					Details
				</h3>
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Assignee</label>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors cursor-pointer">
						<Select 
							:model-value="task.assignedTo"
							:options="team?.members"
							placeholder="Select assignee"
							class="w-full !bg-zinc-900/50 !border-zinc-700/50"
							option-label="username"
							option-value="userId"
							@update:model-value="updateTask('assignedTo', $event)"
						/>
						<!-- <div v-if="task.assigned" class="flex items-center gap-3">
							<Avatar 
								:label="task.assigned?.username.charAt(0).toUpperCase()"
								size="normal"
								shape="circle"
								class="bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold"
							/>
							<div>
								<p class="text-white font-medium text-sm">
									{{ task.assigned?.username }}
								</p>
								<p class="text-zinc-500 text-xs">
									{{ task.assigned?.email }}
								</p>
							</div>
						</div> -->
						<!-- <div v-else class="flex items-center gap-3">
							<Avatar 
								icon="pi pi-user"
								size="normal"
								shape="circle"
								class="bg-zinc-700/50 text-zinc-500"
							/>
							<p class="text-sm font-medium text-white">
								Unassigned
							</p>
						</div> -->
					</div>
				</div>

				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Status</label>
					<Select
						:model-value="task.status"
						:options="taskStatuses"
						placeholder="Select status"
						class="w-full !bg-zinc-900/50 !border-zinc-700/50"
						option-label="label"
						option-value="value"
						@update:model-value="handleStatusUpdate"
					/>
				</div>

				<!-- Priority -->
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Priority</label>
					<div class="flex gap-2">
						<Button
							label="Low"
							size="small"
							:outlined="task.priority !== 'LOW'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'LOW')"
							@click="handlePriorityUpdate('LOW')"
						/>
						<Button
							label="Medium"
							size="small"
							:outlined="task.priority !== 'NORMAL'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'NORMAL')"
							@click="handlePriorityUpdate('NORMAL')"
						/>
						<Button
							label="High"
							size="small"
							:outlined="task.priority !== 'HIGH'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'HIGH')"
							@click="handlePriorityUpdate('HIGH')"
						/>
						<Button
							label="Urgent"
							size="small"
							:outlined="task.priority !== 'URGENT'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'URGENT')"
							@click="handlePriorityUpdate('URGENT')"
						/>
					</div>
				</div>

				<Divider class="!border-zinc-700/50" />

				<!-- Labels -->
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Labels</label>
					<div class="flex flex-wrap gap-2">
						<Tag 
							value="frontend"
							class="!bg-blue-500/20 !text-blue-400 !border-blue-500/30"
						/>
						<Tag 
							value="backend"
							class="!bg-purple-500/20 !text-purple-400 !border-purple-500/30"
						/>
						<Tag 
							value="security"
							class="!bg-red-500/20 !text-red-400 !border-red-500/30"
						/>
						<Button
							icon="pi pi-plus"
							text
							size="small"
							class="!w-7 !h-7 text-zinc-400 hover:text-white"
						/>
					</div>
				</div>
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Due Date</label>
					<div class="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700/50">
						<i class="pi pi-calendar text-zinc-400" />
						<span class="text-zinc-300 text-sm">Feb 20, 2026</span>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Task, Priority } from '@/shared/types/entities';
import { taskStatuses } from '../constants/taskStatuses';
import { getPriorityTagClass } from '../utilities/getPriorityClasses';
import { TasksAPI } from '../api/tasks';
import { useMutation, useQueryClient, useQuery } from '@tanstack/vue-query';
import { TeamsAPI } from '@/modules/Teams';
import Card from 'primevue/card';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';

const props = defineProps<{
	task: Task;
}>();

const teamId = props.task.teamId;

const queryClient = useQueryClient();

const { mutate: patchTask } = useMutation({
	mutationFn: (data: Partial<Task>) => TasksAPI.patchTask(props.task.id, data),
	onSuccess: (updatedTask) => {
        queryClient.setQueryData(['task', props.task.id], updatedTask);
    }
});

const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const handleStatusUpdate = (newStatus: string) => {
	patchTask({ status: newStatus });
};

const handlePriorityUpdate = (newPriority: Priority) => {
	patchTask({ priority: newPriority });
};

const updateTask = (field: keyof Task, value: Task[keyof Task]) => {
	patchTask({ [field]: value });
};
</script>