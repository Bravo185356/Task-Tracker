import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IRoomHandler, RoomJoinResult, RoomLeaveResult } from '../interfaces';
import { RoomManagerService } from '../services/room-manager.service';
import { EventEmitterService } from '../services/event-emitter.service';

@Injectable()
export class UserRoomHandler implements IRoomHandler {
  constructor(
    private roomManager: RoomManagerService,
    private eventEmitter: EventEmitterService,
  ) {}

  getRoomName(userId: string): string {
    return `user:${userId}`;
  }

  join(client: Socket, userId: string): RoomJoinResult {
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    const room = this.getRoomName(userId);
    this.roomManager.joinRoom(client, room);
    const users = this.roomManager.getRoomUsers(room);
    this.eventEmitter.emitRoomUsers(room, users);
    return { success: true, room };
  }

  leave(client: Socket, userId: string): RoomLeaveResult {
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    const room = this.getRoomName(userId);
    this.roomManager.leaveRoom(client, room);
    const users = this.roomManager.getRoomUsers(room);
    this.eventEmitter.emitRoomUsers(room, users);
    return { success: true };
  }
}
