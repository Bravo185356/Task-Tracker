import { IsUUID, IsOptional } from 'class-validator';

export class JoinRoomDto {
	@IsOptional()
	@IsUUID()
	taskId?: string;

	@IsOptional()
	@IsUUID()
	boardId?: string;
}
