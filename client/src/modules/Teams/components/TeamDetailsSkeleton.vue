<template>
    <div class="flex-1">
        <header class="flex justify-between items-center mb-6">
			<div class="flex items-center gap-2">
				<i class="pi pi-arrow-left before:text-xl text-zinc-400 transition-colors p-1" />
				<Skeleton class="!w-40 !h-6" />
			</div>
			<nav class="flex justify-end flex-1 gap-2">
				<Button
					label="New Task"
					icon="pi pi-plus"
					size="small"
                    disabled
				/>
                <Button
                    label="All Tasks"
                    size="small"
                    icon="pi pi-list"
                    disabled
                />
			</nav>
		</header>
        <div class="flex flex-col gap-6">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Skeleton v-for="i in 5" :key="i" class="w-full !h-[84px] !rounded-xl" />
            </div>
            <div class="flex flex-col gap-3">
                <h2 class="text-lg font-bold">New Tasks</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
                    <TaskCardSkeleton v-for="i in 3" :key="i" />
                </div>
            </div>
            <div class="flex flex-col gap-3">
                <h2 class="text-lg font-bold">Recently Completed Tasks</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
                    <TaskCardSkeleton v-for="i in 3" :key="i" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';
import TaskCardSkeleton from '../modules/Task/components/TaskCardSkeleton.vue';
</script>