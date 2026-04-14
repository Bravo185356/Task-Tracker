import type { Task } from '@/shared/types/entities';
import { ws } from '@/app/config/websocket';

export const taskDetailsWs = {
  join: (taskId: string) => ws.emit('taskDetails:join', { taskId }),
  leave: (taskId: string) => ws.emit('taskDetails:leave', { taskId }),

  onTaskDetailsUpdated: (callback: (task: Task) => void) => ws.on('taskDetails:updated', callback),
  offTaskDetailsUpdated: (callback: (task: Task) => void) => ws.off('taskDetails:updated', callback),

  onTaskDetailsDeleted: (callback: (data: { id: string }) => void) => ws.on('taskDetails:deleted', callback),
  offTaskDetailsDeleted: (callback: (data: { id: string }) => void) => ws.off('taskDetails:deleted', callback),
};
