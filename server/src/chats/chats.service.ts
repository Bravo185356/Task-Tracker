import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatType, Message } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitterService } from '../websocket/services/event-emitter.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { randomUUID } from 'crypto';
import { basename, extname } from 'path';

const ATTACHMENT_PUBLIC_PREFIX = '/uploads/chat-attachments';

export type SerializedAttachment = {
  id: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type SerializedMessage = {
  id: string;
  chatId: string;
  authorId: string;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: SerializedAttachment[];
};

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  private async assertTeamMember(teamId: string, userId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }
    return member;
  }

  private async assertTeamMembers(teamId: string, userIds: string[]) {
    const unique = [...new Set(userIds)];
    const count = await this.prisma.teamMember.count({
      where: { teamId, userId: { in: unique } },
    });
    if (count !== unique.length) {
      throw new BadRequestException('All users must be members of the team');
    }
  }

  private async getParticipant(chatId: string, userId: string) {
    return this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
  }

  private async assertChatParticipant(chatId: string, userId: string) {
    const p = await this.getParticipant(chatId, userId);
    if (!p) {
      throw new ForbiddenException('You are not a participant of this chat');
    }
    return p;
  }71

  private async assertChatInTeam(teamId: string, chatId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, teamId },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  private serializeAttachment(row: {
    id: string;
    storedFileName: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
  }): SerializedAttachment {
    return {
      id: row.id,
      url: `${ATTACHMENT_PUBLIC_PREFIX}/${row.storedFileName}`,
      originalFileName: row.originalFileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
    };
  }

  private serializeMessage(
    m: Message & {
      attachments: Array<{
        id: string;
        storedFileName: string;
        originalFileName: string;
        mimeType: string;
        sizeBytes: number;
      }>;
    },
  ): SerializedMessage {
    return {
      id: m.id,
      chatId: m.chatId,
      authorId: m.authorId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      attachments: m.attachments.map((a) => this.serializeAttachment(a)),
    };
  }

  private async unreadCountForUser(chatId: string, userId: string, lastReadAt: Date) {
    return this.prisma.message.count({
      where: {
        chatId,
        authorId: { not: userId },
        createdAt: { gt: lastReadAt },
      },
    });
  }

  async createChat(teamId: string, userId: string, dto: CreateChatDto) {
    await this.assertTeamMember(teamId, userId);

    if (dto.type === ChatType.DIRECT) {
      if (!dto.otherUserId) {
        throw new BadRequestException('otherUserId is required for DIRECT chat');
      }
      if (dto.otherUserId === userId) {
        throw new BadRequestException('Cannot create a direct chat with yourself');
      }
      await this.assertTeamMembers(teamId, [userId, dto.otherUserId]);

      const existing = await this.prisma.chat.findMany({
        where: {
          teamId,
          type: ChatType.DIRECT,
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: dto.otherUserId } } },
          ],
        },
        include: { participants: true },
      });
      const dup = existing.find((c) => c.participants.length === 2);
      if (dup) {
        const full = await this.prisma.chat.findUniqueOrThrow({
          where: { id: dup.id },
          include: {
            participants: { include: { user: { select: { id: true, username: true } } } },
          },
        });
        return await this.mapChatListItem(full, userId);
      }

      const chat = await this.prisma.chat.create({
        data: {
          teamId,
          type: ChatType.DIRECT,
          createdById: userId,
          participants: {
            create: [{ userId }, { userId: dto.otherUserId }],
          },
        },
        include: { participants: { include: { user: { select: { id: true, username: true } } } } },
      });
      return await this.mapChatListItem(chat, userId);
    }

    if (dto.type === ChatType.GROUP) {
      if (!dto.name?.trim()) {
        throw new BadRequestException('name is required for GROUP chat');
      }
      const others = [...new Set(dto.participantUserIds ?? [])].filter((id) => id !== userId);
      await this.assertTeamMembers(teamId, [userId, ...others]);

      const chat = await this.prisma.chat.create({
        data: {
          teamId,
          type: ChatType.GROUP,
          name: dto.name.trim(),
          createdById: userId,
          participants: {
            create: [userId, ...others].map((uid) => ({ userId: uid })),
          },
        },
        include: { participants: { include: { user: { select: { id: true, username: true } } } } },
      });
      return await this.mapChatListItem(chat, userId);
    }

    throw new BadRequestException('Invalid chat type');
  }

  private async mapChatListItem(
    chat: {
      id: string;
      teamId: string;
      type: ChatType;
      name: string | null;
      createdById: string;
      createdAt: Date;
      updatedAt: Date;
      participants: Array<{
        userId: string;
        joinedAt: Date;
        lastReadAt: Date;
        user: { id: string; username: string };
      }>;
    },
    currentUserId: string,
  ) {
    const me = chat.participants.find((p) => p.userId === currentUserId);
    if (!me) {
      throw new ForbiddenException();
    }
    const unread = await this.unreadCountForUser(chat.id, currentUserId, me.lastReadAt);
    const lastMessage = await this.prisma.message.findFirst({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      include: { attachments: true },
    });

    return {
      id: chat.id,
      teamId: chat.teamId,
      type: chat.type,
      name: chat.name,
      createdById: chat.createdById,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      unreadCount: unread,
      lastMessage: lastMessage ? this.serializeMessage(lastMessage) : null,
      participants: chat.participants.map((p) => ({
        userId: p.userId,
        username: p.user.username,
        joinedAt: p.joinedAt.toISOString(),
        lastReadAt: p.lastReadAt.toISOString(),
      })),
    };
  }

  async listChats(teamId: string, userId: string) {
    await this.assertTeamMember(teamId, userId);

    const chats = await this.prisma.chat.findMany({
      where: {
        teamId,
        participants: { some: { userId } },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true } } },
        },
      },
    });

    const items = [];
    for (const c of chats) {
      items.push(await this.mapChatListItem(c, userId));
    }
    return items;
  }

  async getChat(teamId: string, chatId: string, userId: string) {
    await this.assertTeamMember(teamId, userId);
    await this.assertChatInTeam(teamId, chatId);
    await this.assertChatParticipant(chatId, userId);

    const chat = await this.prisma.chat.findUniqueOrThrow({
      where: { id: chatId },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, email: true } } },
        },
      },
    });
    const messages = await this.listMessages(teamId, chatId, userId);
    const me = chat.participants.find((p) => p.userId === userId)!;
    const unread = await this.unreadCountForUser(chatId, userId, me.lastReadAt);

    return {
      id: chat.id,
      teamId: chat.teamId,
      type: chat.type,
      name: chat.name,
      createdById: chat.createdById,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      unreadCount: unread,
      messages: messages.items,
      participants: chat.participants.map((p) => ({
        userId: p.userId,
        username: p.user.username,
        email: p.user.email,
        joinedAt: p.joinedAt.toISOString(),
        lastReadAt: p.lastReadAt.toISOString(),
      })),
    };
  }

  async listMessages(
    teamId: string,
    chatId: string,
    userId: string,
    cursor?: string,
    limit = 30,
  ) {
    await this.assertTeamMember(teamId, userId);
    await this.assertChatInTeam(teamId, chatId);
    await this.assertChatParticipant(chatId, userId);

    const take = Math.min(Math.max(limit, 1), 100);
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      include: { attachments: true },
    });

    let nextCursor: string | null = null;
    let list = messages;
    if (messages.length > take) {
      const last = messages[messages.length - 1];
      list = messages.slice(0, take);
      nextCursor = last.id;
    }

    return {
      items: list.map((m) => this.serializeMessage(m)).reverse(),
      nextCursor,
    };
  }

  async createMessage(
    teamId: string,
    chatId: string,
    userId: string,
    body: string | undefined,
    files: Array<{ filename: string; originalname: string; mimetype: string; size: number }>,
  ) {
    await this.assertTeamMember(teamId, userId);
    await this.assertChatInTeam(teamId, chatId);
    await this.assertChatParticipant(chatId, userId);

    const trimmed = body?.trim() ?? '';
    if (!trimmed && (!files || files.length === 0)) {
      throw new BadRequestException('Message must have text or at least one attachment');
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          chatId,
          authorId: userId,
          body: trimmed || null,
          attachments: {
            create: files.map((f) => ({
              storedFileName: f.filename,
              originalFileName: basename(f.originalname) || f.filename,
              mimeType: f.mimetype || 'application/octet-stream',
              sizeBytes: f.size,
            })),
          },
        },
        include: { attachments: true },
      });

      await tx.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    const serialized = this.serializeMessage(message);

    const participants = await this.prisma.chatParticipant.findMany({
      where: { chatId },
      select: { userId: true },
    });
    const notifyUserIds = participants
      .map((p) => p.userId)
      .filter((id) => id !== userId);

    this.eventEmitter.emitChatMessageCreated({
      chatId,
      message: serialized as unknown as Record<string, unknown>,
      notifyUserIds,
    });

    return serialized;
  }

  async markRead(teamId: string, chatId: string, userId: string) {
    await this.assertTeamMember(teamId, userId);
    await this.assertChatInTeam(teamId, chatId);
    await this.assertChatParticipant(chatId, userId);

    const now = new Date();
    await this.prisma.chatParticipant.update({
      where: { chatId_userId: { chatId, userId } },
      data: { lastReadAt: now },
    });

    const iso = now.toISOString();
    this.eventEmitter.emitChatRead({
      chatId,
      userId,
      lastReadAt: iso,
    });

    return { lastReadAt: iso };
  }

  /** Имя файла для Multer (без path traversal) */
  static makeStoredFileName(originalname: string): string {
    const base = basename(originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = extname(base) || extname(originalname) || '';
    return `${randomUUID()}${ext}`.slice(0, 220);
  }
}
