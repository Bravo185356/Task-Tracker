import type { Task } from '@/shared/types/entities';
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { taskDetailsWs } from '../api/websocket/tasks.ws';

export function useTaskDetailsWs(taskId: string) {
  const queryClient = useQueryClient();

  const handleTaskUpdated = (task: Task) => {
    queryClient.setQueryData<Task>(['task', taskId], () => task);
  };

  const handleTaskDeleted = () => {
    queryClient.removeQueries({ queryKey: ['task', taskId] });
  };

  onMounted(() => {
    taskDetailsWs.join(taskId);
    taskDetailsWs.onTaskDetailsUpdated(handleTaskUpdated);
    taskDetailsWs.onTaskDetailsDeleted(handleTaskDeleted);
  });

  onUnmounted(() => {
    taskDetailsWs.leave(taskId);
    taskDetailsWs.offTaskDetailsUpdated(handleTaskUpdated);
    taskDetailsWs.offTaskDetailsDeleted(handleTaskDeleted);
  });
}
