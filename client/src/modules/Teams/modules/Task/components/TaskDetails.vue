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
						@update:model-value="updateTask('status', $event)"
					/>
				</div>
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Priority</label>
					<div class="flex gap-2">
						<Button
							label="Low"
							size="small"
							:outlined="task.priority !== 'LOW'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'LOW')"
							@click="updateTask('priority', 'LOW')"
						/>
						<Button
							label="Medium"
							size="small"
							:outlined="task.priority !== 'NORMAL'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'NORMAL')"
							@click="updateTask('priority', 'NORMAL')"
						/>
						<Button
							label="High"
							size="small"
							:outlined="task.priority !== 'HIGH'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'HIGH')"
							@click="updateTask('priority', 'HIGH')"
						/>
						<Button
							label="Urgent"
							size="small"
							:outlined="task.priority !== 'URGENT'"
							class="flex-1"
							:class="getPriorityTagClass(task.priority, 'URGENT')"
							@click="updateTask('priority', 'URGENT')"
						/>
					</div>
				</div>
				<Divider class="!border-zinc-700/50" />
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Due Date</label>
					<div class="flex items-center gap-2">
					<DatePicker
						v-model="taskDateRange"
						placeholder="Select Date"
						class="w-full"
						showClear
						selectionMode="range"
						dateFormat="dd.mm.yy"
						hideOnRangeSelection
						:manualInput="false"
						@hide="updateTaskDate"
					>
						<template #clearicon="{ clearCallback }">
							<i 
								v-if="props.task.startedAt || props.task.endedAt"
								class="pi pi-times p-datepicker-clear-icon cursor-pointer" 
								@click="onClearDate(() => clearCallback($event))" 
							/>
						</template>
					</DatePicker>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Task } from '@/shared/types/entities';
import { taskStatuses } from '../constants/taskStatuses';
import { getPriorityTagClass } from '../utilities/getPriorityClasses';
import { useQuery } from '@tanstack/vue-query';
import { TeamsAPI } from '@/modules/Teams';
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import DatePicker from 'primevue/datepicker';

const props = defineProps<{
	task: Task;
}>();

const emit = defineEmits<{
	(e: 'patchTask', data: Partial<Task>): void;
}>();

const teamId = props.task.teamId;
const taskDateRange = ref<(Date | null)[] | null>(null);

const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const updateTask = (field: keyof Task, value: Task[keyof Task]) => {
	emit('patchTask', { [field]: value });
};

const updateTaskDate = () => {
	const dates = {
		startedAt: taskDateRange.value?.[0] ? toDateOnlyString(taskDateRange.value?.[0]) : null,
		endedAt: taskDateRange.value?.[1] ? toDateOnlyString(taskDateRange.value?.[1]) : null,
	}
	
	emit('patchTask', dates);
};

const onClearDate = (clearCallback: () => void) => {
	clearCallback();
	taskDateRange.value = null;
	emit('patchTask', { startedAt: null, endedAt: null });
};

function toDateOnlyString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

onMounted(() => {
	if(props.task.startedAt || props.task.endedAt) {
		taskDateRange.value = [
			props.task.startedAt ? new Date(props.task.startedAt) : null,
			props.task.endedAt ? new Date(props.task.endedAt) : null,
		];
	}
});
</script>