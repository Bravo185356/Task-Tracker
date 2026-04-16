import type { Task } from '@/shared/types/entities';
import { ws } from '@/app/config/websocket';

export const boardWs = {
  join: (boardId: string) => ws.emit('board:join', { boardId }),
  leave: (boardId: string) => ws.emit('board:leave', { boardId }),

  onTaskCreated: (callback: (task: Task) => void) => ws.on('board:task:created', callback),
  offTaskCreated: (callback: (task: Task) => void) => ws.off('board:task:created', callback),

  onTaskUpdated: (callback: (task: Task) => void) => ws.on('board:task:updated', callback),
  offTaskUpdated: (callback: (task: Task) => void) => ws.off('board:task:updated', callback),

  onTaskDeleted: (callback: (data: { id: string }) => void) => ws.on('board:task:deleted', callback),
  offTaskDeleted: (callback: (data: { id: string }) => void) => ws.off('board:task:deleted', callback),
};
