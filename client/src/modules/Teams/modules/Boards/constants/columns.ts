import type { TaskColumn } from "@/shared/types/entities";

export interface ColumnConfig {
	id: TaskColumn;
	name: string;
	textColor: string;
	dotColor: string;
	borderColor: string;
	badgeBackground: string;
	shadowColor: string;
}

export const columns: ColumnConfig[] = [
	{ 
		id: 'BACKLOG', 
		name: 'Backlog',
		textColor: 'text-zinc-300',
		dotColor: 'bg-zinc-400',
		borderColor: 'border-zinc-700/50',
		badgeBackground: '!bg-zinc-400',
		shadowColor: 'shadow-zinc-900/50',
	},
	{ 
		id: 'TODO', 
		name: 'To Do',
		textColor: 'text-amber-400',
		dotColor: 'bg-amber-400',
		borderColor: 'border-amber-500/30',
		badgeBackground: '!bg-amber-400',
		shadowColor: 'shadow-amber-900/20',
	},
	{ 
		id: 'IN_PROGRESS', 
		name: 'In Progress',
		textColor: 'text-blue-400',
		dotColor: 'bg-blue-400',
		borderColor: 'border-blue-500/30',
		badgeBackground: '!bg-blue-400',
		shadowColor: 'shadow-blue-900/20',
	},
	{ 
		id: 'REVIEW', 
		name: 'Review',
		textColor: 'text-purple-400',
		dotColor: 'bg-purple-400',
		borderColor: 'border-purple-500/30',
		badgeBackground: '!bg-purple-400',
		shadowColor: 'shadow-purple-900/20',
	},
	{ 
		id: 'TESTING', 
		name: 'Testing',
		textColor: 'text-orange-400',
		dotColor: 'bg-orange-400',
		borderColor: 'border-orange-500/30',
		badgeBackground: '!bg-orange-400',
		shadowColor: 'shadow-orange-900/20',
	},
	{ 
		id: 'DONE', 
		name: 'Done',
		textColor: 'text-emerald-400',
		dotColor: 'bg-emerald-400',
		borderColor: 'border-emerald-500/30',
		badgeBackground: '!bg-emerald-400',
		shadowColor: 'shadow-emerald-900/20',
	},
];