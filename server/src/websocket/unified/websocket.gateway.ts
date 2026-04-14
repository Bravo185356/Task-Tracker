import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JoinRoomDto, TaskEventDto, JoinChatRoomDto, JoinUserRoomDto } from '../dto';
import { RoomManagerService } from '../services/room-manager.service';
import { EventEmitterService } from '../services/event-emitter.service';
import { TaskDetailsRoomHandler } from '../handlers/team-room.handler';
import { BoardRoomHandler } from '../handlers/board-room.handler';
import { ChatRoomHandler } from '../handlers/chat-room.handler';
import { UserRoomHandler } from '../handlers/user-room.handler';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/kanban',
})

export class UnifiedWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('UnifiedWebsocketGateway');

  constructor(
    private roomManager: RoomManagerService,
    private eventEmitter: EventEmitterService,
    private boardRoomHandler: BoardRoomHandler,
    private taskDetailsRoomHandler: TaskDetailsRoomHandler,
    private chatRoomHandler: ChatRoomHandler,
    private userRoomHandler: UserRoomHandler,
  ) {}

  afterInit() {
    this.eventEmitter.setServer(this.server);
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const removedRooms = this.roomManager.removeClientFromAllRooms(client.id);
    
    removedRooms.forEach(room => {
      const users = this.roomManager.getRoomUsers(room);
      this.eventEmitter.emitRoomUsers(room, users);
    });
  }

  @SubscribeMessage('taskDetails:join')
  handleJoinTaskDetails(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    return this.taskDetailsRoomHandler.join(client, data.taskId);
  }

  @SubscribeMessage('taskDetails:leave')
  handleLeaveTaskDetails(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    return this.taskDetailsRoomHandler.leave(client, data.taskId);
  }

  @SubscribeMessage('board:join')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    return this.boardRoomHandler.join(client, data.boardId);
  }

  @SubscribeMessage('board:leave')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    return this.boardRoomHandler.leave(client, data.boardId);
  }

  @SubscribeMessage('chat:join')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinChatRoomDto,
  ) {
    return this.chatRoomHandler.join(client, data.chatId);
  }

  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinChatRoomDto,
  ) {
    return this.chatRoomHandler.leave(client, data.chatId);
  }

  @SubscribeMessage('user:join')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinUserRoomDto,
  ) {
    return this.userRoomHandler.join(client, data.userId);
  }

  @SubscribeMessage('user:leave')
  handleLeaveUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinUserRoomDto,
  ) {
    return this.userRoomHandler.leave(client, data.userId);
  }

  emitTaskCreated(task: TaskEventDto): void {
    this.eventEmitter.emitTaskCreated(task);
  }

  emitTaskUpdated(task: TaskEventDto): void {
    this.eventEmitter.emitTaskUpdated(task);
  }

  emitTaskDeleted(boardId: string | null, taskId: string): void {
    this.eventEmitter.emitTaskDeleted(boardId, taskId);
  }
}
