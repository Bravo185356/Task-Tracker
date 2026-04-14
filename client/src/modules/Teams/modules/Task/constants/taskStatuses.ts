export interface TaskStatusConfig {
	label: string;
	value: string;
	tagClass: string;
}

export const taskStatuses: TaskStatusConfig[] = [
	{
		label: 'Backlog',
		value: 'BACKLOG',
		tagClass: '!bg-zinc-500/20 !text-zinc-300 border border-zinc-500/30',
	},
	{
		label: 'To Do',
		value: 'TODO',
		tagClass: '!bg-amber-500/20 !text-amber-400 border border-amber-500/30',
	},
	{
		label: 'In Progress',
		value: 'IN_PROGRESS',
		tagClass: '!bg-blue-500/20 !text-blue-400 border border-blue-500/30',
	},
	{
		label: 'Review',
		value: 'REVIEW',
		tagClass: '!bg-purple-500/20 !text-purple-400 border border-purple-500/30',
	},
	{
		label: 'Testing',
		value: 'TESTING',
		tagClass: '!bg-orange-500/20 !text-orange-400 border border-orange-500/30',
	},
	{
		label: 'Done',
		value: 'DONE',
		tagClass: '!bg-emerald-500/20 !text-emerald-400 border border-emerald-500/30',
	},
];
