export interface TaskPriorityConfig {
	label: string;
	value: string;
	tagClass: string;
	textClass: string;
}

export const taskPriorities: TaskPriorityConfig[] = [
	{
		label: 'Low',
		value: 'LOW',
		tagClass: '!bg-emerald-500/20 !text-emerald-400 !border-emerald-500/30',
        textClass: '!text-emerald-400',
	},
	{
		label: 'Normal',
		value: 'NORMAL',
		tagClass: '!bg-amber-500/20 !text-amber-400 !border-amber-500/30',
        textClass: '!text-amber-400',
	},
	{
		label: 'High',
		value: 'HIGH',
		tagClass: '!bg-orange-500/20 !text-orange-400 !border-orange-500/30',
        textClass: '!text-orange-400',
	},
	{
		label: 'Urgent',
		value: 'URGENT',
		tagClass: '!bg-red-500/20 !text-red-400 !border-red-500/30',
        textClass: '!text-red-400',
	},
];