<template>
	<div class="flex-1">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
			<div class="lg:col-span-2 space-y-6">
				<Card>
					<template #content>
						<div>
							<Skeleton class="!w-full !h-[38px] !mb-2 !rounded-md" />
							<div class="flex items-center gap-4 mb-4">
								<Skeleton class="!w-36 !h-5" />
								<Skeleton class="!w-1 !h-1 !rounded-full" />
								<Skeleton class="!w-40 !h-5" />
							</div>
							<Divider />
							<div class="mb-4">
								<Skeleton class="!w-28 !h-7 !mb-3" />
								<Skeleton class="!w-full !h-[160px] !rounded-md !mb-2" />
							</div>
							<Divider />
							<div>
                                <div class="flex items-center justify-between mb-3">
                                    <Skeleton class="!w-32 !h-7" />
                                    <Skeleton class="!w-20 !h-[35px] !rounded-md" />
                                </div>
								<Skeleton class="!w-full !h-[66px] !rounded-md" />
							</div>
						</div>
					</template>
				</Card>
				<TaskCommentsSkeleton />
			</div>
			<TaskDetailsSkeleton />
		</div>
	</div>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Skeleton from 'primevue/skeleton';
import TaskCommentsSkeleton from './TaskCommentsSkeleton.vue';
import TaskDetailsSkeleton from './TaskDetailsSkeleton.vue';
</script>
