export interface TaskStatusConfig {
	label: string;
	value: string;
	tagClass: string;
	textClass: string;
}

export const taskStatuses: TaskStatusConfig[] = [
	{
		label: 'Backlog',
		value: 'BACKLOG',
		tagClass: '!bg-zinc-500/20 !text-zinc-300 leading-5',
        textClass: '!text-zinc-300',
	},
	{
		label: 'To Do',
		value: 'TODO',
		tagClass: '!bg-amber-500/20 !text-amber-400 leading-5',
        textClass: '!text-amber-400',
	},
	{
		label: 'In Progress',
		value: 'IN_PROGRESS',
		tagClass: '!bg-blue-500/20 !text-blue-400 leading-5',
        textClass: '!text-blue-400',
	},
	{
		label: 'Review',
		value: 'REVIEW',
		tagClass: '!bg-purple-500/20 !text-purple-400 leading-5',
        textClass: '!text-purple-400',
	},
	{
		label: 'Testing',
		value: 'TESTING',
		tagClass: '!bg-orange-500/20 !text-orange-400 leading-5',
        textClass: '!text-orange-400',
	},
	{
		label: 'Done',
		value: 'DONE',
		tagClass: '!bg-emerald-500/20 !text-emerald-400 leading-5',
        textClass: '!text-emerald-400',
	},
];
