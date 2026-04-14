import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, PatchTaskDto, TaskResponseDto } from './dto/tasks.dto';
import { UnifiedWebsocketGateway } from '../websocket/unified/websocket.gateway';
import { TaskStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TasksService {
	constructor(private readonly prisma: PrismaService, private readonly unifiedWsGateway: UnifiedWebsocketGateway) {}
	
	async createTask(createTaskDto: CreateTaskDto) {
		const task = await this.prisma.task.create({ 
			data: {
				title: createTaskDto.title,
				description: createTaskDto.description,
				assignedTo: createTaskDto.assignedTo,
				boardId: createTaskDto.boardId,
				teamId: createTaskDto.teamId,
				status: createTaskDto.status ? createTaskDto.status : TaskStatus.TODO,
				...(createTaskDto.status && { status: createTaskDto.status }),
			} 
		});
		
		this.unifiedWsGateway.emitTaskCreated(task);
	
		return task;
	}
	
	// async getTasksByBoardId(boardId: string) {
	// 	return this.prisma.task.findMany({
	// 		where: { boardId },
	// 	});
	// }
	
	async getTaskById(id: string) {
		return this.prisma.task.findUnique({
			where: { id },
		});
	}
	
	async getTasksByTeamId(teamId: string) {
		return this.prisma.task.findMany({
			where: { teamId },
		});
	}
	
	async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
		const task = await this.prisma.task.update({
			where: { id },
			data: updateTaskDto,
		});

		this.unifiedWsGateway.emitTaskUpdated(task);
		
		return task;
	}
	
	async patchTask(id: string, patchTaskDto: PatchTaskDto) {
		const task = await this.prisma.task.update({
			where: { id },
			data: patchTaskDto,
		});

		this.unifiedWsGateway.emitTaskUpdated(task);

		return plainToInstance(TaskResponseDto, task, { 
			excludeExtraneousValues: true
		});
	}

	async deleteTask(id: string) {
		const deletedTask = await this.prisma.task.findUnique({
			where: { id },
			select: {
				teamId: true,
				boardId: true,
			},
		});
		const task = await this.prisma.task.delete({
			where: { id },
			select: {
				id: true,
			},
		});
		
		this.unifiedWsGateway.emitTaskDeleted(deletedTask.boardId, task.id);
		
		return task;
	}
}