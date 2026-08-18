<template>
	<Card>
		<template #content>
			<div class="space-y-5">
				<Skeleton class="!w-24 !h-7" />
				<div>
					<Skeleton class="!w-20 !h-5 !mb-2" />
					<Skeleton class="!w-full !h-[42px] !rounded-md" />
				</div>
				<div>
					<Skeleton class="!w-16 !h-5 !mb-2" />
					<Skeleton class="!w-full !h-[42px] !rounded-md" />
				</div>
				<div>
					<Skeleton class="!w-[72px] !h-5 !mb-2" />
					<Skeleton class="!w-full !h-[42px] !rounded-md" />
				</div>
				<div>
					<Skeleton class="!w-[72px] !h-5 !mb-2" />
					<Skeleton class="!w-full !h-[42px] !rounded-md" />
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
</script>
