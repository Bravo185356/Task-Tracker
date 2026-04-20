<template>
	<Card class="w-84 shrink-0">
		<template #content>
			<div class="flex items-center justify-between mb-4">
				<span class="font-semibold">Filters</span>
				<div v-if="hasActiveFilters" class="cursor-pointer flex items-center gap-1" @click="clearFilters">
					<span class="text-xs text-zinc-400 font-medium hover:text-zinc-200 transition-colors">Clear all</span>
				</div>
			</div>

			<div class="flex flex-col gap-3">
				<div class="flex flex-col gap-2">
					<label class="text-sm text-zinc-400 font-medium tracking-wide">Title</label>
					<InputText
						:model-value="props.filters.title"
						placeholder="Enter Title"
						size="small"
						class="w-full"
						@update:model-value="emit('update', { ...props.filters, title: $event ?? '' })"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-sm text-zinc-400 font-medium tracking-wide">Assignee</label>
					<Select
						:model-value="props.filters.assignee"
						:options="assigneeOptions"
						option-label="label"
						option-value="value"
						placeholder="Select Member"
						show-clear
						class="w-full"
						size="small"
						@update:model-value="emit('update', { ...props.filters, assignee: $event })"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-sm text-zinc-400 font-medium tracking-wide">Priority</label>
					<Select
						:model-value="props.filters.priority"
						:options="taskPriorities"
						option-label="label"
						option-value="value"
						placeholder="Select Priority"
						show-clear
						class="w-full"
						size="small"
						@update:model-value="emit('update', { ...props.filters, priority: $event })"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-sm text-zinc-400 font-medium tracking-wide">Status</label>
					<Select
						:model-value="props.filters.status"
						:options="taskStatuses"
						option-label="label"
						option-value="value"
						placeholder="Select Status"
						show-clear
						class="w-full"
						size="small"
						@update:model-value="emit('update', { ...props.filters, status: $event })"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-sm text-zinc-400 font-medium tracking-wide">Board</label>
					<Select
						:model-value="props.filters.boardId"
						:options="boardOptions"
						option-label="label"
						option-value="value"
						placeholder="Select Board"
						show-clear
						class="w-full" 
						size="small"
						@update:model-value="emit('update', { ...props.filters, boardId: $event })"
					/>
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import type { Team, Board } from '@/shared/types/entities';
import { computed } from 'vue';
import { taskStatuses } from '../constants/taskStatuses';
import { taskPriorities } from '../constants/taskPriorities';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Card from 'primevue/card';

export interface TaskFiltersModel {
	title: string;
	assignee: string | null;
	priority: string | null;
	status: string | null;
	boardId: string | null;
}

const props = defineProps<{
	team?: Team;
	boards?: Board[];
	filters: TaskFiltersModel;
}>();

const emit = defineEmits<{
	(e: 'update', filters: TaskFiltersModel): void;
	(e: 'reset'): void;
}>();

const hasActiveFilters = computed(() =>
	!!props.filters.title || !!props.filters.assignee || !!props.filters.priority || !!props.filters.status || !!props.filters.boardId,
);

const assigneeOptions = computed(() => [
	{ label: 'Unassigned', value: 'null' },
	...(props.team?.members.map((m) => { return { label: m.username, value: m.userId } }) ?? []),
]);

const boardOptions = computed(() =>
	props.boards?.map((b) => ({ label: b.name, value: b.id })) ?? [],
);

const clearFilters = () => {
	emit('reset');
};
</script>
