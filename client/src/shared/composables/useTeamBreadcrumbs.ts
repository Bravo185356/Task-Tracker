import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useRoute } from 'vue-router';

type BreadcrumbItem = {
    label: string;
    to?: string;
};

export const useTeamBreadcrumbs = (teamName: MaybeRefOrGetter<string | undefined>) => {
    const route = useRoute();

    return computed<BreadcrumbItem[]>(() => {
        const teamNameValue = toValue(teamName);
        
        if (!teamNameValue) {
            return [];
        }

        const items: BreadcrumbItem[] = [{ label: 'Teams', to: '/teams' }];
        const teamId = route.params.teamId as string;
        const teamLink = `/teams/${teamId}`;

        if (route.name === 'TeamDetails') {
            items.push({ label: teamNameValue });
            return items;
        }

        items.push({ label: teamNameValue, to: teamLink });

        if (route.name === 'TasksList') {
            items.push({ label: 'Tasks' });
        } else if (route.name === 'TeamManage') {
            items.push({ label: 'Manage' });
        } else if (route.name === 'ChatPage' || route.name === 'NewChatPage') {
            items.push({ label: 'Chats' });
        } else if (route.path.includes('/boards/')) {
            items.push({ label: 'Board' });
        } else if (route.path.includes('/tasks/') && route.params.taskId) {
            items.push({ label: 'Task' });
        }

        return items;
    });
};
