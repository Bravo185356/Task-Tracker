import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Priority, TaskStatus } from '@prisma/client';

export class CreateTaskCommentDto {
	@IsString()
	@IsNotEmpty()
	body: string;
}

export class GetTasksQueryDto {
	@IsOptional()
	@IsString()
	title?: string;
	@IsOptional()
	@IsString()
	assignedTo?: string;
	@IsOptional()
	@IsEnum(Priority)
	priority?: Priority;
	@IsOptional()
	@IsEnum(TaskStatus)
	status?: TaskStatus;
	@IsOptional()
	@IsUUID()
	boardId?: string;
}

export class CreateTaskDto {
	@IsString()
	@IsNotEmpty()
	title: string;
	@IsOptional()
	@IsString()
	description?: string;
	@IsOptional()
	@IsUUID()
	assignedTo?: string;
	@IsOptional()
	@IsUUID()
	boardId?: string;
	@IsString()
	@IsUUID()
	teamId: string;
	@IsOptional()
	@IsString()
	status?: TaskStatus;
	@IsOptional()
	@Type(() => Date)
	@IsString()
	startedAt?: Date | null;
	@IsOptional()
	@Type(() => Date)
	@IsString()
	endedAt?: Date | null;
}

export class PatchTaskDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string;
	@IsOptional()
	@IsString()
	description?: string;
	@IsOptional()
	@IsString()
	status?: TaskStatus;
	@IsOptional()
	@IsString()
	priority?: Priority;
	@IsOptional()
	@IsUUID()
	assignedTo?: string;
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startedAt?: Date | null;
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	endedAt?: Date | null;
}

export class UserResponseDto {
	@Expose()
	id: string;
	@Expose()
	username: string;
	@Expose()
	email: string;
  }
  
export class TaskAttachment {
	@Expose() id: string;
	@Expose() url: string;
	@Expose() originalFileName: string;
	@Expose() mimeType: string;
	@Expose() sizeBytes: number;
}

export class CommentAuthorResponseDto {
	@Expose() id: string;
	@Expose() username: string;
	@Expose() avatar: string | null;
}

export class AssignedUserResponseDto {
    @Expose() id: string;
    @Expose() username: string;
    @Expose() avatar: string | null;
  }

export class TaskCommentResponseDto {
	@Expose() id: string;
	@Expose() taskId: string;
	@Expose() authorId: string;
	@Expose() body: string;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
	@Expose() @Type(() => CommentAuthorResponseDto) author: CommentAuthorResponseDto;
	@Expose() @Type(() => TaskAttachment) attachments: TaskAttachment[];
}

export class TaskResponseDto {
	@Expose() id: string;
	@Expose() title: string;
	@Expose() description: string | null;
	@Expose() status: TaskStatus;
	@Expose() boardId: string | null;
	@Expose() teamId: string;
	@Expose() priority: Priority | null;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
	@Expose() startedAt: Date | null;
	@Expose() endedAt: Date | null;
	@Expose() assignedTo: string | null;
	@Expose() @Type(() => AssignedUserResponseDto) assigned: AssignedUserResponseDto | null;
	@Expose() @Type(() => TaskAttachment) attachments?: TaskAttachment[];
	@Expose() @Type(() => TaskCommentResponseDto) comments?: TaskCommentResponseDto[];
}