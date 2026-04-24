import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private isEmail(str: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
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

