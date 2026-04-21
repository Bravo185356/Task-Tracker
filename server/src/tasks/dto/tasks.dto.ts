import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';
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
}

export class UserResponseDto {
	@Expose()
	id: string;
	@Expose()
	username: string;
	@Expose()
	email: string;
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
	@Expose() @IsUUID() assignedTo?: string;
  }