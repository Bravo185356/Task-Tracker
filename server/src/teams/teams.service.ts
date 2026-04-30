import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto, TeamResponseDto, InviteUserDto } from './dto/teams.dto';
import { Role, TaskStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

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
                avatar: true,
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
                avatar: true,
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
                avatar: true,
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

    const statistic = await this.getTeamStatistic(teamId);
    
    const result = {
      ...team,
      members: team.members.map(({ user, ...member }) => ({
        ...member,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      })),
      lastCreatedTasks: statistic.lastCreatedTasks,
      lastCompletedTasks: statistic.lastCompletedTasks,
      statistic: {
        totalTasks: statistic.totalTasks,
        tasksCompleted: statistic.tasksCompleted,
        tasksInProgress: statistic.tasksInProgress,
        tasksTodo: statistic.tasksTodo,
        unassignedTasks: statistic.unassignedTasks,
      },
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
                avatar: true,
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
    await this.checkUserPermission(teamId, userId, [Role.OWNER]);

    await this.prisma.team.delete({
      where: { id: teamId },
    });

    return { message: 'Team deleted successfully' };
  }

  private async getTeamStatistic(teamId: string) {
    const LAST_TASK_LIMIT = 3;
    
    const progressStatuses = [
      TaskStatus.IN_PROGRESS,
      TaskStatus.REVIEW,
      TaskStatus.TESTING,
    ] as const;
    
    const lastCreatedTasks = await this.prisma.task.findMany({
      where: {
        teamId,
        status: { not: TaskStatus.DONE },
      },
      orderBy: { createdAt: 'desc' },
      take: LAST_TASK_LIMIT,
    })
      
    const lastCompletedTasks = await this.prisma.task.findMany({
      where: {
        teamId,
        status: TaskStatus.DONE,
      },
      orderBy: { updatedAt: 'desc' },
      take: LAST_TASK_LIMIT,
    })
      
    const statusCounts = await this.prisma.task.groupBy({
      by: ['status'],
      where: { teamId },
      _count: { _all: true },
    })
    
    const countByStatus = new Map(statusCounts.map(s => [s.status, s._count._all]));
    
    const totalTasks = Array.from(countByStatus.values()).reduce((a, b) => a + b, 0);
    const tasksCompleted = countByStatus.get(TaskStatus.DONE) ?? 0;
    const tasksInProgress = progressStatuses.reduce((sum, status) => sum + (countByStatus.get(status) ?? 0), 0);
    const tasksTodo = countByStatus.get(TaskStatus.TODO) ?? 0;
    const unassignedTasks = await this.prisma.task.count({
      where: { teamId, assignedTo: null },
    });
    
    return {
      lastCreatedTasks,
      lastCompletedTasks,
      totalTasks,
      tasksCompleted,
      tasksInProgress,
      tasksTodo,
      unassignedTasks,
    };
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
