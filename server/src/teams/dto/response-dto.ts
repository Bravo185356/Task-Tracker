import { UserResponseDto } from "src/tasks/dto/tasks.dto";
import { Expose, Type } from "class-transformer";
import { Role } from "@prisma/client";

export class MemberResponseDto {
	@Expose() id: string;
	@Expose() userId: string;
	@Expose() role: Role;
	@Expose() username: string;
	@Expose() email: string;
	@Expose() joinedAt: Date;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
  }
  
export class TeamResponseDto {
	@Expose() id: string;
	@Expose() name: string;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
	@Expose()
	@Type(() => MemberResponseDto)
	members: MemberResponseDto[];
}