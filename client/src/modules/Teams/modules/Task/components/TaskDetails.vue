<template>
	<Card>
		<template #content>
			<div class="space-y-5">
				<h3 class="text-lg font-semibold text-zinc-200">Details</h3>
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Assignee</label>
					<div class="flex items-center gap-3">
						<Select 
							:model-value="task.assignedTo"
							:options="teamMembers"
							placeholder="Select assignee"
							option-label="username"
							option-value="userId"
							showClear
							fluid
							@update:model-value="updateTask('assignedTo', $event)"
						>
							<template #value="slotProps">
								<div v-if="slotProps.value" class="flex items-center gap-1">
									<Avatar 
										class="shrink-0"
										:url="task.assigned?.avatar ?? null"
										:size="25"
									/>
									<div>{{ task.assigned?.username ?? 'Unassigned' }}</div>
								</div>
								<span v-else>
									{{ slotProps.placeholder }}
								</span>
							</template>
						</Select>
					</div>
				</div>
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Status</label>
					<Select
						:model-value="task.status"
						:options="taskStatuses"
						placeholder="Select status"
						option-label="label"
						option-value="value"
						@update:model-value="updateTask('status', $event)"
						fluid
					>
                        <template #value="slotProps">
                            <span v-if="slotProps.value" :class="getStatusTagClass(slotProps.value, true) ?? ''">
                                {{ getStatusLabel(slotProps.value) }}
                            </span>
                            <span v-else>{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                            <span :class="getStatusTagClass(slotProps.option.value, true) ?? ''">
                                {{ getStatusLabel(slotProps.option.value) }}
                            </span>
                        </template>
                    </Select>
				</div>
				<div>
					<label class="text-sm font-medium text-zinc-400 block mb-2">Priority</label>
					<Select
						:model-value="task.priority"
						:options="taskPriorities"
						placeholder="Select priority"
						option-label="label"
						option-value="value"
						@update:model-value="updateTask('priority', $event)"
						fluid
					>
                        <template #value="slotProps">
                            <span v-if="slotProps.value" :class="getPriorityTagClass(slotProps.value, true) ?? ''">
                                {{ getPriorityLabel(slotProps.value) }}
                            </span>
                            <span v-else>{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                            <span :class="getPriorityTagClass(slotProps.option.value, true) ?? ''">
                                {{ getPriorityLabel(slotProps.option.value) }}
                            </span>
                        </template>
                    </Select>
				</div>
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
import { taskPriorities } from '../constants/taskPriorities';
import { useTeamMembers } from '@/modules/Teams';
import { ref, onMounted } from 'vue';
import { getPriorityTagClass, getPriorityLabel } from '../utilities/taskPriority';
import { getStatusTagClass, getStatusLabel } from '../utilities/taskStatus';
import Card from 'primevue/card';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Avatar from '@/shared/components/Avatar.vue';

const props = defineProps<{
	task: Task;
}>();

const emit = defineEmits<{
	(e: 'patchTask', data: Partial<Task>): void;
}>();

const teamId = props.task.teamId;
const taskDateRange = ref<(Date | null)[] | null>(null);

const teamMembers = useTeamMembers(teamId);

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