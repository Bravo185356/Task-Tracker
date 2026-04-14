import { IsUUID } from 'class-validator';

export class JoinChatRoomDto {
  @IsUUID()
  chatId!: string;
}
