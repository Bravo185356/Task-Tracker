import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CloudinaryService } from '../storage/cloudinary.service';

const MAX_FILES = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

@Controller('teams/:teamId/chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  list(@Param('teamId') teamId: string, @Request() req: { user: { userId: string } }) {
    return this.chatsService.listChats(teamId, req.user.userId);
  }

  @Post()
  create(
    @Param('teamId') teamId: string,
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateChatDto,
  ) {
    return this.chatsService.createChat(teamId, req.user.userId, dto);
  }

  @Post(':chatId/read')
  markRead(
    @Param('teamId') teamId: string,
    @Param('chatId') chatId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.chatsService.markRead(teamId, chatId, req.user.userId);
  }

  @Post(':chatId/messages')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES },
    }),
  )
  async createMessage(
    @Param('teamId') teamId: string,
    @Param('chatId') chatId: string,
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateMessageDto,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
  ) {
    const list = files ?? [];
    if (!dto.body?.trim() && list.length === 0) {
      throw new BadRequestException('Message must have text or at least one file');
    }

    const uploaded = list.length > 0
      ? await this.cloudinaryService.uploadFiles(list, 'chat-attachments')
      : [];

    return this.chatsService.createMessage(teamId, chatId, req.user.userId, dto.body, uploaded);
  }

  @Get(':chatId')
  getOne(
    @Param('teamId') teamId: string,
    @Param('chatId') chatId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.chatsService.getChat(teamId, chatId, req.user.userId);
  }
}
