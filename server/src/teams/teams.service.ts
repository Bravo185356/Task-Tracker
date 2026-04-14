import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Role } from '@prisma/client';
import { InviteUserDto } from './dto/invite-user.dto';
import { plainToInstance } from 'class-transformer';
import { TeamResponseDto } from './dto/response-dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTeamDto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        members: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  async findAll(userId: string) {
    const teams = await this.prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            userId: true,
            joinedAt: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return teams;
  }

  async findOne(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }
    
    const result = {
      ...team,
      members: team.members.map(({ user, ...member }) => ({
        ...member,
        username: user.username,
        email: user.email,
      })),
    }
    
    return plainToInstance(TeamResponseDto, result, { 
      excludeExtraneousValues: true
    });
  }

  async update(teamId: string, userId: string, updateTeamDto: UpdateTeamDto) {
    await this.checkUserPermission(teamId, userId, [Role.OWNER, Role.ADMIN]);

    const team = await this.prisma.team.update({
      where: { id: teamId },
      data: updateTeamDto,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  async invite(teamId: string, userId: string, inviteUserDto: InviteUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: inviteUserDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.checkUserPermission(teamId, userId, [Role.OWNER, Role.ADMIN]);

    const member = await this.prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId,
        role: inviteUserDto.role,
      },
    });

    return member;
  }

  async remove(teamId: string, userId: string) {
    // Только владелец может удалить команду
    await this.checkUserPermission(teamId, userId, [Role.OWNER]);

    await this.prisma.team.delete({
      where: { id: teamId },
    });

    return { message: 'Team deleted successfully' };
  }

  private async checkUserPermission(
    teamId: string,
    userId: string,
    allowedRoles: Role[],
  ) {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return member;
  }
}
