<template>
	<Card>
		<template #content>
			<div>
				<div class="flex items-center justify-between">
					<Skeleton class="!w-28 !h-7" />
				</div>
				<Divider />
				<ul class="space-y-4 list-none p-0 m-0">
					<li v-for="idx in 2" :key="idx" class="flex gap-3">
						<Skeleton shape="circle" size="40px" />
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-2 h-6">
								<Skeleton class="!w-20 !h-5" />
								<Skeleton class="!w-20 !h-4" />
							</div>
							<Skeleton class="!w-full !h-10 !rounded-lg" />
							<div class="flex gap-2 mt-2">
								<Skeleton class="!w-24 !h-[26px] !rounded" />
							</div>
						</div>
					</li>
				</ul>
				<Divider />
				<div class="flex gap-3">
					<Skeleton shape="circle" size="40px" />
					<div class="flex-1">
						<Skeleton class="!w-full !h-24 !rounded-md" />
						<div class="flex justify-end mt-3">
							<Skeleton class="!w-20 !h-8 !rounded-md" />
						</div>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Skeleton from 'primevue/skeleton';
</script>
