<template>
    <Card>
        <template #content>
            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <Skeleton class="!w-[80px] !h-[24px]" />
                    <div class="flex items-center gap-2">
                        <Skeleton class="!w-[70px] !h-[28px]" />
                        <Skeleton class="!w-[70px] !h-[28px]" />
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <div class="flex items-center gap-1">
                        <Skeleton class="!w-[28px] !h-[28px]" shape="circle" />
                        <Skeleton class="!w-[70px] !h-[16px]" />
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <i class="pi pi-calendar text-zinc-400" />
                    <Skeleton class="!w-[70px] !h-[16px]" />
                </div>
            </div>
        </template>
    </Card>
</template>
    
<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
import Card from 'primevue/card';
</script>