import { useQuery } from "@tanstack/vue-query"
import { TeamsAPI } from "../api/teams";

export const useTeamMembers = (teamId: string) => {
    const { data: team } = useQuery({
        queryKey: ['team', teamId],
        queryFn: () => TeamsAPI.getTeamInfo(teamId),
    });
    
    return team.value?.members ?? [];
};