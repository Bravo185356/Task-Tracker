export { type PatchTaskRequest } from './api/tasks.types.ts';
export { useTaskDetailsWs } from './composables/useTaskDetailsWs';

export { TasksAPI } from './api/tasks';
export { taskDetailsWs } from './api/websocket/tasks.ws';

export { type TaskFiltersModel, default as TaskFilters } from './components/TaskFilters.vue';
export { default as TaskDetails } from './components/TaskDetails.vue';
export { default as TaskDetailsSkeleton } from './components/TaskDetailsSkeleton.vue';
export { default as TaskCard } from './components/TaskCard.vue';
export { default as TaskCardSkeleton } from './components/TaskCardSkeleton.vue';
export { default as TaskAttachments } from './components/TaskAttachments.vue';
export { default as TaskComments } from './components/TaskComments.vue';
export { default as TaskCommentsSkeleton } from './components/TaskCommentsSkeleton.vue';
export { default as TaskPageSkeleton } from './components/TaskPageSkeleton.vue';