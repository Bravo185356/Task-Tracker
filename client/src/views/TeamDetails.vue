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
					@click="isCreateTaskDialogOpen = true"
				/>
				<RouterLink :to="`/teams/${teamId}/tasks`">
					<Button
						label="All Tasks"
						icon="pi pi-list"
					/>
				</RouterLink>
				<RouterLink v-if="teamsStore.isAdminOrOwner" :to="`/teams/${teamId}/manage`">
					<Button
						label="Manage Team"
						icon="pi pi-users"
					/>
				</RouterLink>
			</nav>
		</header>
		<section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
			<Card
				v-for="block in STAT_CONFIG"
				:key="block.label"
				class="  rounded-xl border border-zinc-700/50 bg-zinc-900/60 shadow-sm"
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
			<article v-if="team.lastCreatedTasks && team.lastCreatedTasks.length">
				<h2 class="text-lg font-bold mb-3">New Tasks</h2>
				<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
					<li v-for="task in team.lastCreatedTasks" :key="task.id">
						<TaskCard :task="task" />
					</li>
				</ul>
			</article>
			<article v-if="team.lastCompletedTasks && team.lastCompletedTasks.length">
				<h2 class="text-lg font-bold mb-3">Recently Completed Tasks</h2>
				<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
					<li v-for="task in team.lastCompletedTasks" :key="task.id">
						<TaskCard :task="task" />
					</li>
				</ul>
			</article>
		</div>
	</section>
	<CreateTaskModal
		v-if="isCreateTaskDialogOpen"
		v-model:visible="isCreateTaskDialogOpen"
	/>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { ref } from 'vue';
import { 
	TeamsAPI,
	CreateTaskModal, 
	useTeamsStore,
	TaskCard,
} from '@/modules/Teams';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Card from 'primevue/card';

const route = useRoute();
const router = useRouter();
const teamsStore = useTeamsStore();

const teamId = route.params.teamId as string;
const isCreateTaskDialogOpen = ref(false);

const { data: team } = useQuery({
	queryKey: ['team', teamId],
	queryFn: () => TeamsAPI.getTeamInfo(teamId),
});

const totalTasks = team.value!.statistic.totalTasks;
const STAT_CONFIG = [
	{
		label: 'Total Tasks',
		value: team.value!.statistic.totalTasks,
		icon: 'pi-list',
		color: 'text-zinc-300',
		barColor: '!bg-zinc-400',
	},
	{
		label: 'Completed',
		value: team.value!.statistic.tasksCompleted,
		icon: 'pi-check-circle',
		color: 'text-green-400',
		barColor: '!bg-green-500',
	},
	{
		label: 'In Progress',
		value: team.value!.statistic.tasksInProgress,
		icon: 'pi-spinner',
		color: 'text-blue-400',
		barColor: '!bg-blue-500',
	},
	{
		label: 'Todo',
		value: team.value!.statistic.tasksTodo,
		icon: 'pi-circle',
		color: 'text-yellow-400',
		barColor: '!bg-yellow-500',
	},
	{
		label: 'Unassigned',
		value: team.value!.statistic.unassignedTasks,
		icon: 'pi-user-minus',
		color: 'text-red-400',
		barColor: '!bg-red-500',
	},
];
</script>
