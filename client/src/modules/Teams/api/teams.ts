import type { Team } from '@/shared/types/entities';
import type { CreateTeamRequest, InviteUserRequest } from './teams.types';
import { httpClient } from '@/app/config/httpClient';

export class TeamsAPI {
	static async getTeams(): Promise<Team[]> {
		return httpClient.get<Team[]>('/teams');
	}

	static async getTeamInfo(teamId: string): Promise<Team> {
		return httpClient.get<Team>(`/teams/${teamId}`);
	}

	static async createTeam(data: CreateTeamRequest): Promise<Team> {
		return httpClient.post<Team>('/teams', data);
	}

	static async updateTeam(teamId: string, data: Partial<CreateTeamRequest>): Promise<Team> {
		return httpClient.patch<Team>(`/teams/${teamId}`, data);
	}

	static async deleteTeam(teamId: string): Promise<void> {
		return httpClient.delete<void>(`/teams/${teamId}`);
	}

	static async inviteUser(data: InviteUserRequest): Promise<void> {
		return httpClient.post<void>(`/teams/${data.teamId}/invite`, { email: data.email, role: data.role, teamId: data.teamId });
	}
}
