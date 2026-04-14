import { Socket } from 'socket.io';

export interface RoomJoinResult {
	success: boolean;
	room?: string;
	error?: string;
}

export interface RoomLeaveResult {
	success: boolean;
	error?: string;
}

export interface IRoomHandler {
	getRoomName(id: string): string;
	join(client: Socket, id: string): RoomJoinResult;
	leave(client: Socket, id: string): RoomLeaveResult;
}
