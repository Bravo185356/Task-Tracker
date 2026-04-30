import { Expose, Type } from "class-transformer";
import { Role } from "@prisma/client";
import { TaskResponseDto } from "src/tasks/dto/tasks.dto";
import { IsEmail, IsEnum, IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class MemberResponseDto {
	@Expose() id: string;
	@Expose() userId: string;
	@Expose() role: Role;
	@Expose() username: string;
	@Expose() email: string;
	@Expose() avatar: string | null;
	@Expose() joinedAt: Date;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
}

export class TeamStatisticResponseDto {
	@Expose()
	totalTasks: number;
	@Expose()
	tasksCompleted: number;
	@Expose()
	tasksInProgress: number;
	@Expose()
	tasksTodo: number;
	@Expose()
	unassignedTasks: number;
}
  
export class TeamResponseDto {
	@Expose() id: string;
	@Expose() name: string;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
	@Expose()
	@Type(() => MemberResponseDto)
	members: MemberResponseDto[];

	@Expose()
	@Type(() => TaskResponseDto)
	lastCreatedTasks: TaskResponseDto[];

	@Expose()
	@Type(() => TaskResponseDto)
	lastCompletedTasks: TaskResponseDto[];

	@Expose()
	statistic: TeamStatisticResponseDto;
}

export class InviteUserDto {
	@IsEmail()
	email: string;
	@IsEnum(Role)
	role: Role;
	@IsUUID()
	teamId: string;
}

export class CreateTeamDto {
	@IsString()
	@IsNotEmpty()
	name: string;
}

export class UpdateTeamDto {
	@IsString()
	@IsNotEmpty()
	name: string;
}
  