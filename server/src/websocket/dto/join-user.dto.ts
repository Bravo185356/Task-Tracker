import { IsUUID } from 'class-validator';

export class JoinUserRoomDto {
  @IsUUID()
  userId!: string;
}
