import { Expose, Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ValidateIf((o: UpdateProfileDto) => o.password != null)
  @IsString()
  @MinLength(6)
  confirmPassword?: string;
}

export class UserResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() username: string;
  @Expose() avatar: string | null;
}
