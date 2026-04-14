import type { Board, Task } from '@/shared/types/entities';
import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { boardWs } from '../api/websocket/boards.ws';

export function useBoardWebSocket(boardId: string) {
  const queryClient = useQueryClient();

  const handleTaskCreated = (task: Task) => {
    queryClient.setQueryData<Board>(['board', boardId], (board) => {
      if (!board) return board;
      return { ...board, tasks: [...board.tasks, task] };
    });
  };

  const handleTaskUpdated = (task: Task) => {
    queryClient.setQueryData<Board>(['board', boardId], (board) => {
      if (!board) return board;
      return {
        ...board,
        tasks: board.tasks.map(t => t.id === task.id ? task : t),
      };
    });
  };

  const handleTaskDeleted = (data: { id: string }) => {
    queryClient.setQueryData<Board>(['board', boardId], (board) => {
      if (!board) return board;
      return { ...board, tasks: board.tasks.filter(t => t.id !== data.id) };
    });
  };

  onMounted(() => {
    boardWs.join(boardId);
    boardWs.onTaskCreated(handleTaskCreated);
    boardWs.onTaskUpdated(handleTaskUpdated);
    boardWs.onTaskDeleted(handleTaskDeleted);
  });

  onUnmounted(() => {
    boardWs.leave(boardId);
    boardWs.offTaskCreated(handleTaskCreated);
    boardWs.offTaskUpdated(handleTaskUpdated);
    boardWs.offTaskDeleted(handleTaskDeleted);
  });
}
