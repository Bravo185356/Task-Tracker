import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class RoomManagerService {
	private logger = new Logger('RoomManagerService');
	private roomUsers = new Map<string, Set<string>>();

	joinRoom(client: Socket, roomName: string): void {
		client.join(roomName);
		this.addUserToRoom(roomName, client.id);
		this.logger.log(`Client ${client.id} joined room ${roomName}`);
	}

	leaveRoom(client: Socket, roomName: string): void {
		client.leave(roomName);
		this.removeUserFromRoom(roomName, client.id);
		this.logger.log(`Client ${client.id} left room ${roomName}`);
	}

	removeClientFromAllRooms(clientId: string): string[] {
		const removedRooms: string[] = [];
		
		this.roomUsers.forEach((users, room) => {
			if (users.has(clientId)) {
				users.delete(clientId);
				removedRooms.push(room);
			}
		});
		
		return removedRooms;
	}

	getRoomUsers(roomName: string): string[] {
		const users = this.roomUsers.get(roomName);
		return users ? Array.from(users) : [];
	}

	getRoomUserCount(roomName: string): number {
		return this.roomUsers.get(roomName)?.size || 0;
	}

	private addUserToRoom(room: string, clientId: string): void {
		if (!this.roomUsers.has(room)) {
			this.roomUsers.set(room, new Set());
		}
		this.roomUsers.get(room)!.add(clientId);
	}

	private removeUserFromRoom(room: string, clientId: string): void {
		this.roomUsers.get(room)?.delete(clientId);
		
		if (this.roomUsers.get(room)?.size === 0) {
			this.roomUsers.delete(room);
		}
	}
}
