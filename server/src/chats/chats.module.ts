import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UnifiedWebsocketModule } from '../websocket/unified/websocket.module';

@Module({
  imports: [PrismaModule, UnifiedWebsocketModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
