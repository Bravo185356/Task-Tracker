import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IRoomHandler, RoomJoinResult, RoomLeaveResult } from '../interfaces';
import { RoomManagerService } from '../services/room-manager.service';
import { EventEmitterService } from '../services/event-emitter.service';

@Injectable()
export class BoardRoomHandler implements IRoomHandler {
	constructor(
		private roomManager: RoomManagerService,
		private eventEmitter: EventEmitterService,
	) {}

	getRoomName(boardId: string): string {
		return `board:${boardId}`;
	}

	join(client: Socket, boardId: string): RoomJoinResult {
		if (!boardId) {
			return { success: false, error: 'boardId is required' };
		}

		const room = this.getRoomName(boardId);
		this.roomManager.joinRoom(client, room);
		
		const users = this.roomManager.getRoomUsers(room);
		this.eventEmitter.emitRoomUsers(room, users);

		return { success: true, room };
	}

	leave(client: Socket, boardId: string): RoomLeaveResult {
		if (!boardId) {
			return { success: false, error: 'boardId is required' };
		}

		const room = this.getRoomName(boardId);
		this.roomManager.leaveRoom(client, room);
		
		const users = this.roomManager.getRoomUsers(room);
		this.eventEmitter.emitRoomUsers(room, users);

		return { success: true };
	}
}
