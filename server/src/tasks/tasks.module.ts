import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UnifiedWebsocketModule } from '../websocket/unified/websocket.module';

@Module({
	imports: [PrismaModule, UnifiedWebsocketModule],
	controllers: [TasksController],
	providers: [TasksService],
	exports: [TasksService],
})

export class TasksModule {}