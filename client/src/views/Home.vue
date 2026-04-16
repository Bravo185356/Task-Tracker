<template>
	<div class="relative flex min-h-[85vh] flex-col overflow-hidden">
		<div class="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
			<h1 class="max-w-2xl text-5xl font-bold tracking-tight md:text-6xl">
				Organize the work of
				<span class="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
					your team
				</span>
			</h1>
			<p class="max-w-lg text-lg leading-relaxed text-zinc-400">
				Kanban boards, team chats, and analytics — everything you need for productive teamwork in one place.
			</p>
			<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
				<Button
					label="Go to teams"
					icon="pi pi-arrow-right"
					icon-pos="right"
					size="large"
					@click="router.push('/teams')"
				/>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-4 px-4 pb-20 md:grid-cols-3 md:px-12">
			<Card
				v-for="feature in features"
				:key="feature.title"
			>
				<template #content>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
						:class="feature.iconBg"
					>
						<i :class="[feature.icon, 'text-lg', feature.iconColor]" />
					</div>
					<h3 class="font-semibold mb-3">{{ feature.title }}</h3>
					<p class="text-sm leading-relaxed text-zinc-400">{{ feature.description }}</p>
				</template>
			</Card>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';

const router = useRouter();

const features = [
	{
		icon: 'pi pi-th-large',
		iconBg: 'bg-indigo-500/15',
		iconColor: 'text-indigo-400',
		title: 'Kanban Boards',
		description: 'Visualize tasks on flexible boards. Drag cards between columns, set priorities, and track progress at a glance.',
	},
	{
		icon: 'pi pi-comments',
		iconBg: 'bg-violet-500/15',
		iconColor: 'text-violet-400',
		title: 'Team Chats',
		description: 'Communicate with your team right inside the workspace. Direct messages and group channels with file sharing support.',
	},
	{
		icon: 'pi pi-users',
		iconBg: 'bg-emerald-500/15',
		iconColor: 'text-emerald-400',
		title: 'Team Management',
		description: 'Invite members, assign roles, and monitor each contributor\'s progress through built-in analytics.',
	},
];
</script>