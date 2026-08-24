<template>
    <div class="flex-1">
        <div class="flex flex-col gap-6">
            <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Skeleton v-for="i in 5" :key="i" class="w-full !h-[84px] !rounded-xl" />
            </section>
            <section class="flex flex-col gap-3">
                <h2 class="text-lg font-bold">New Tasks</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
                    <TaskCardSkeleton v-for="i in 3" :key="i" />
                </div>
            </section>
            <section class="flex flex-col gap-3">
                <h2 class="text-lg font-bold">Recently Completed Tasks</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 list-none">
                    <TaskCardSkeleton v-for="i in 3" :key="i" />
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
import TaskCardSkeleton from '../modules/Task/components/TaskCardSkeleton.vue';
</script>