<template>
	<section v-if="team" class="flex-1">
		<header class="flex justify-between items-center mb-6">
			<div class="flex items-center gap-2">
				<i 
					class="pi pi-arrow-left before:text-xl text-zinc-400 transition-colors hover:text-white cursor-pointer p-1" 
					@click="router.push('/teams')" 
				/>
				<h1 class="text-xl leading-6 font-bold">
					{{ team.name }}
				</h1>
				<span class="flex items-center gap-1">
					<span class="pi pi-users before:text-xl" />
					<span>{{ team.members?.length || 0 }}</span>
				</span>
			</div>
			<nav class="flex justify-end flex-1 gap-2">
				<Button
					label="New Task"
					icon="pi pi-plus"
					size="small"
					@click="isCreateTaskDialogOpen = true"
				/>
				<RouterLink :to="`/teams/${teamId}/tasks`">
					<Button
						label="All Tasks"
						size="small"
						icon="pi pi-list"
					/>
				</RouterLink>
				<RouterLink v-if="teamsStore.isAdminOrOwner" :to="`/teams/${teamId}/manage`">
					<Button
						label="Manage Team"
						icon="pi pi-users"
						size="small"
					/>
				</RouterLink>
			</nav>
		</header>
		<section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
			<Card
				v-for="block in statConfig"
				:key="block.label"
				:pt="{ 
					body: { class: '!px-4 !py-3' }, 
					content: { class: 'flex flex-col gap-2' }
				}"
			>
				<template #content>
					<header class="flex items-center justify-between">
						<span class="text-xs text-zinc-400 font-medium leading-tight">{{ block.label }}</span>
						<span :class="['pi', block.icon, block.color, 'text-base']" />
					</header>
					<strong class="text-2xl font-bold leading-none">{{ block.value }}</strong>
					<ProgressBar
						:value="totalTasks > 0 ? Math.round((block.value / totalTasks) * 100) : 0"
						:show-value="false"
						:pt="{
							root: { class: '!h-1 !bg-zinc-700/50 !rounded-full' },
							value: { class: ['!rounded-full', block.barColor] },
						}"
					/>
				</template>
			</Card>
		</section>
		<div class="flex flex-col gap-6">
			<section v-if="team.lastCreatedTasks && team.lastCreatedTasks.length">
				<h2 class="text-lg font-bold mb-3">New Tasks</h2>
				<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
					<li v-for="task in team.lastCreatedTasks" :key="task.id">
						<TaskCard :task="task" />
					</li>
				</ul>
			</section>
			<section v-if="team.lastCompletedTasks && team.lastCompletedTasks.length">
				<h2 class="text-lg font-bold mb-3">Recently Completed Tasks</h2>
				<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
					<li v-for="task in team.lastCompletedTasks" :key="task.id">
						<TaskCard :task="task" />
					</li>
				</ul>
			</section>
		</div>
	</section>
    <TeamDetailsSkeleton v-else />
	<CreateTaskModal
		v-if="isCreateTaskDialogOpen"
		v-model:visible="isCreateTaskDialogOpen"
	/>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { ref, computed } from 'vue';
import { 
	TeamsAPI,
	CreateTaskModal, 
	useTeamsStore,
	TaskCard,
	type TeamStatisticFields,
} from '@/modules/Teams';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Card from 'primevue/card';
import TeamDetailsSkeleton from '@/modules/Teams/components/TeamDetailsSkeleton.vue';

type statisticItem = {
    key: keyof TeamStatisticFields;
    label: string;
    value: number;
    icon: string;
    color: string;
    barColor: string;
}

const route = useRoute();
const router = useRouter();
const teamsStore = useTeamsStore();

const teamId = route.params.teamId as string;
const isCreateTaskDialogOpen = ref(false);

const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const totalTasks = computed(() => team.value!.statistic.totalTasks);
const statConfigMeta: Omit<statisticItem, 'value'>[] = [
    {
        key: 'totalTasks',
        label: 'Total Tasks',
        icon: 'pi-list',
        color: 'text-zinc-300',
        barColor: '!bg-zinc-400',
    },
    {
        key: 'tasksCompleted',
        label: 'Completed',
        icon: 'pi-spinner',
        color: 'text-blue-400',
        barColor: '!bg-blue-500',
    },
    {
        key: 'tasksInProgress',
        label: 'In Progress',
        icon: 'pi-spinner',
        color: 'text-blue-400',
        barColor: '!bg-blue-500',
    },
    {
        key: 'tasksTodo',
        label: 'Todo',
        icon: 'pi-circle',
        color: 'text-yellow-400',
        barColor: '!bg-yellow-500',
    },
    {
        key: 'unassignedTasks',
        label: 'Unassigned',
        icon: 'pi-user-minus',
        color: 'text-red-400',
        barColor: '!bg-red-500',
    },
];

const statConfig = computed<statisticItem[]>(() => {
    if(team.value) {
        return statConfigMeta.map((item) => ({
            ...item,
            value: team.value.statistic[item.key],
        }));
    }
    return [];
});
</script>
