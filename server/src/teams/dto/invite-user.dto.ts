import { IsEmail, IsEnum, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class InviteUserDto {
  @IsEmail()
  email: string;
  @IsEnum(Role)
  role: Role;
  @IsUUID()
  teamId: string;
} 