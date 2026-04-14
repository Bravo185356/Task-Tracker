import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IRoomHandler, RoomJoinResult, RoomLeaveResult } from '../interfaces';
import { RoomManagerService } from '../services/room-manager.service';
import { EventEmitterService } from '../services/event-emitter.service';

@Injectable()
export class ChatRoomHandler implements IRoomHandler {
  constructor(
    private roomManager: RoomManagerService,
    private eventEmitter: EventEmitterService,
  ) {}

  getRoomName(chatId: string): string {
    return `chat:${chatId}`;
  }

  join(client: Socket, chatId: string): RoomJoinResult {
    if (!chatId) {
      return { success: false, error: 'chatId is required' };
    }
    const room = this.getRoomName(chatId);
    this.roomManager.joinRoom(client, room);
    const users = this.roomManager.getRoomUsers(room);
    this.eventEmitter.emitRoomUsers(room, users);
    return { success: true, room };
  }

  leave(client: Socket, chatId: string): RoomLeaveResult {
    if (!chatId) {
      return { success: false, error: 'chatId is required' };
    }
    const room = this.getRoomName(chatId);
    this.roomManager.leaveRoom(client, room);
    const users = this.roomManager.getRoomUsers(room);
    this.eventEmitter.emitRoomUsers(room, users);
    return { success: true };
  }
}
