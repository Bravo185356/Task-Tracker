<template>
    <Card>
		<template #content>
            <Skeleton class="!w-[130px] !h-[24px] mb-1" />
            <Skeleton class="!w-[100px] !h-[20px]" />
			<div class="flex gap-2 mt-4">
				<Skeleton class="!w-full !h-[42px]" />
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
</script>