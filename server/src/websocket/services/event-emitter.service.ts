import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { TaskEventDto, TaskMovedDto } from '../dto';

@Injectable()
export class EventEmitterService {
	private logger = new Logger('EventEmitterService');
	private server: Server;

	setServer(server: Server): void {
		this.server = server;
	}

	emitTaskCreated(task: TaskEventDto): void {
		// this.server.to(`team:${task.teamId}`).emit('task:created', task);
		
		if (task.boardId) {
			this.server.to(`board:${task.boardId}`).emit('board:task:created', task);
		}
		
		this.logger.log(`Task ${task.id} created in team ${task.teamId}`);
	}

	emitTaskUpdated(task: TaskEventDto): void {
		this.server.to(`taskDetails:${task.id}`).emit('taskDetails:updated', task);
		
		if (task.boardId) {
			this.server.to(`board:${task.boardId}`).emit('board:task:updated', task);
		}
		
		this.logger.log(`Task ${task.id} updated`);
	}

	emitTaskDeleted(boardId: string | null, taskId: string): void {
		this.server.to(`taskDetails:${taskId}`).emit('taskDetails:deleted', { id: taskId });
		
		if (boardId) {
			this.server.to(`board:${boardId}`).emit('board:task:deleted', { id: taskId });
		}
		
		this.logger.log(`Task ${taskId} deleted`);
	}

	emitRoomUsers(roomName: string, users: string[]): void {
		this.server.to(roomName).emit('room:users', {
			room: roomName,
			userCount: users.length,
			users,
		});
	}

	broadcastToRoom(room: string, event: string, data: Record<string, unknown>): void {
		this.server.to(room).emit(event, data);
	}

	/**
	 * chat:message:created — комната чата (включая автора).
	 * chat:activity:created — только участникам чата, кроме автора (user:${id}).
	 */
	emitChatMessageCreated(payload: {
		chatId: string;
		message: Record<string, unknown>;
		notifyUserIds: string[];
	}): void {
		this.server.to(`chat:${payload.chatId}`).emit('chat:message:created', payload.message);
		const activityPayload = {
			chatId: payload.chatId,
			message: payload.message,
		};
		for (const userId of payload.notifyUserIds) {
			this.server.to(`user:${userId}`).emit('chat:activity:created', activityPayload);
		}
		const mid = payload.message && typeof payload.message === 'object' && 'id' in payload.message
			? String((payload.message as { id: string }).id)
			: '?';
		this.logger.log(`Chat message ${mid} in chat ${payload.chatId}`);
	}

	emitChatRead(payload: {
		chatId: string;
		userId: string;
		lastReadAt: string;
	}): void {
		this.server.to(`chat:${payload.chatId}`).emit('chat:read', {
			chatId: payload.chatId,
			userId: payload.userId,
			lastReadAt: payload.lastReadAt,
		});
	}
}
