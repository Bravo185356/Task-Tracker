import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Priority, TaskStatus } from '@prisma/client';

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

export class UpdateTaskDto {
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
	@IsString()
	status?: TaskStatus;
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startedAt?: Date | null;
	@IsOptional()
	@Type(() => Date)
	@IsDate()
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
  
export class TaskAttachmentResponseDto {
	@Expose() id: string;
	@Expose() url: string;
	@Expose() originalFileName: string;
	@Expose() mimeType: string;
	@Expose() sizeBytes: number;
}

export class TaskResponseDto {
	@Expose() id: string;
	@Expose() title: string;
	@Expose() description?: string;
	@Expose() status: TaskStatus;
	@Expose() boardId?: string;
	@Expose() teamId: string;
	@Expose() priority?: Priority;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
	@Expose() startedAt?: Date | null;
	@Expose() endedAt?: Date | null;
	@Expose() @IsUUID() assignedTo?: string;
	@Expose() @Type(() => TaskAttachmentResponseDto) attachments?: TaskAttachmentResponseDto[];
}