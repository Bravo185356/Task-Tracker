import { Module } from '@nestjs/common';
import { UnifiedWebsocketGateway } from './websocket.gateway';
import { RoomManagerService } from '../services/room-manager.service';
import { EventEmitterService } from '../services/event-emitter.service';
import { TaskDetailsRoomHandler } from '../handlers/team-room.handler';
import { BoardRoomHandler } from '../handlers/board-room.handler';
import { ChatRoomHandler } from '../handlers/chat-room.handler';
import { UserRoomHandler } from '../handlers/user-room.handler';

@Module({
	providers: [
		UnifiedWebsocketGateway,
		RoomManagerService,
		EventEmitterService,
		TaskDetailsRoomHandler,
		BoardRoomHandler,
		ChatRoomHandler,
		UserRoomHandler,
	],
	exports: [UnifiedWebsocketGateway, EventEmitterService],
})
export class UnifiedWebsocketModule {}
