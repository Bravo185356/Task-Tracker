<template>
    <header class="flex items-center justify-between gap-2 mb-4 h-[35px]">
        <div class="flex min-w-0 items-center">
            <Breadcrumb v-if="!isLoading" :model="breadcrumbItems" class="!bg-transparent !border-none !p-0">
                <template #item="{ item, props: itemProps }">
                    <router-link
                        v-if="item.to"
                        v-slot="{ href, navigate }"
                        :to="item.to"
                        custom
                    >
                        <a :href="href" v-bind="itemProps.action" @click="navigate">
                            <span class="text-zinc-400 hover:text-zinc-200 transition-colors">{{ item.label }}</span>
                        </a>
                    </router-link>
                    <span v-else class="text-zinc-200 font-medium">
                        {{ item.label }}
                    </span>
                </template>
            </Breadcrumb>
            <Skeleton v-else class="!w-64 !h-6" />
        </div>
        <div id="page-header-actions" />
    </header>
</template>

<script setup lang="ts">
import Breadcrumb from 'primevue/breadcrumb';
import Skeleton from 'primevue/skeleton';

type BreadcrumbItem = {
    label: string;
    to?: string;
};

defineProps<{
    breadcrumbItems: BreadcrumbItem[];
    isLoading: boolean;
}>();
</script>