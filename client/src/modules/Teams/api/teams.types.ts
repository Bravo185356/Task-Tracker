import type { Role } from '@/shared/types/entities';

interface CreateTeamRequest {
	name: string;
}

interface InviteUserRequest {
	email: string;
	role: Role;
	teamId: string;
}

export type { 
	CreateTeamRequest, 
	InviteUserRequest,
};
