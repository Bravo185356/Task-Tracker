import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IRoomHandler, RoomJoinResult, RoomLeaveResult } from '../interfaces';
import { RoomManagerService } from '../services/room-manager.service';
import { EventEmitterService } from '../services/event-emitter.service';

@Injectable()
export class TaskDetailsRoomHandler implements IRoomHandler {
	constructor(
		private roomManager: RoomManagerService,
		private eventEmitter: EventEmitterService,
	) {}

	getRoomName(taskId: string): string {
		return `taskDetails:${taskId}`;
	}

	join(client: Socket, taskId: string): RoomJoinResult {
		if (!taskId) {
			return { success: false, error: 'taskId is required' };
		}

		const room = this.getRoomName(taskId);
		this.roomManager.joinRoom(client, room);
		
		const users = this.roomManager.getRoomUsers(room);
		this.eventEmitter.emitRoomUsers(room, users);

		return { success: true, room };
	}

	leave(client: Socket, taskId: string): RoomLeaveResult {
		if (!taskId) {
			return { success: false, error: 'taskId is required' };
		}

		const room = this.getRoomName(taskId);
		this.roomManager.leaveRoom(client, room);
		
		const users = this.roomManager.getRoomUsers(room);
		this.eventEmitter.emitRoomUsers(room, users);

		return { success: true };
	}
}
