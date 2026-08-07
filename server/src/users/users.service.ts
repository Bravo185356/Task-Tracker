import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto, UserResponseDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private isEmail(str: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  private toUserResponse(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
  
  async findByUsername(username: string, email?: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username, email },
    });
  }

  async findUserByLoginCredential(usernameOrEmail: string): Promise<User | null> {
    const isEmail = this.isEmail(usernameOrEmail);
    
    if (isEmail) {
      return this.prisma.user.findUnique({
        where: { email: usernameOrEmail },
      });
    } else {
      return this.prisma.user.findUnique({
        where: { username: usernameOrEmail },
      });
    }
  }
  
  async findExistingUser(email: string, username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { 
        OR: [
          { email }, 
          { username }
        ]
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(email: string, password: string, username: string, avatar?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        avatar,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, avatarUrl?: string): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.password != null && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (dto.email || dto.username) {
      const conflict = await this.prisma.user.findFirst({
        where: {
          id: { not: userId },
          OR: [
            ...(dto.email ? [{ email: dto.email }] : []),
            ...(dto.username ? [{ username: dto.username }] : []),
          ],
        },
      });

      if (conflict) {
        if (dto.email && conflict.email === dto.email) {
          throw new ConflictException('Email is already taken');
        }
        if (dto.username && conflict.username === dto.username) {
          throw new ConflictException('Username is already taken');
        }
        throw new ConflictException('User with this email or username already exists');
      }
    }

    const data: {
      email?: string;
      username?: string;
      password?: string;
      avatar?: string;
    } = {};

    if (dto.email != null) {
        data.email = dto.email
    };
    if (dto.username != null) {
        data.username = dto.username
    };
    if (dto.password != null) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    if (avatarUrl != null) {
        data.avatar = avatarUrl
    };

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No profile fields to update');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.toUserResponse(updated);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
      },
    });
  }
}

