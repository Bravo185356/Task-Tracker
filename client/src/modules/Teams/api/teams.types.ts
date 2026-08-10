import type { Role } from '@/shared/types/entities';

interface CreateTeamRequest {
	name: string;
}

interface InviteUserRequest {
	email: string;
	role: Role;
	teamId: string;
}

interface TeamStatisticFields {
	totalTasks: number;
	tasksCompleted: number;
	tasksInProgress: number;
	tasksTodo: number;
	unassignedTasks: number;
}

export type { 
	CreateTeamRequest, 
	InviteUserRequest,
	TeamStatisticFields,
};
