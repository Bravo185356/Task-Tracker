import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, PatchTaskDto, TaskResponseDto, GetTasksQueryDto } from './dto/tasks.dto';
import { UnifiedWebsocketGateway } from '../websocket/unified/websocket.gateway';
import { TaskStatus, Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { basename, extname } from 'path';

const ATTACHMENTS_PREFIX = '/uploads/task-attachments';

type TaskWithAttachments = Prisma.TaskGetPayload<{
	include: { attachments: true };
}>;

@Injectable()
export class TasksService {
	constructor(private readonly prisma: PrismaService, private readonly unifiedWsGateway: UnifiedWebsocketGateway) {}

	private serializeTask(task: TaskWithAttachments) {
		return {
			...task,
			attachments: task.attachments.map((attachment) => ({
				id: attachment.id,
				url: `${ATTACHMENTS_PREFIX}/${attachment.storedFileName}`,
				originalFileName: attachment.originalFileName,
				mimeType: attachment.mimeType,
				sizeBytes: attachment.sizeBytes,
			})),
		};
	}

	static makeStoredFileName(originalname: string): string {
		const base = basename(originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
		const ext = extname(base) || extname(originalname) || '';
		return `${randomUUID()}${ext}`.slice(0, 220);
	}
	
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
				...(createTaskDto.startedAt !== undefined && { startedAt: createTaskDto.startedAt }),
				...(createTaskDto.endedAt !== undefined && { endedAt: createTaskDto.endedAt }),
			},
			include: { attachments: true },
		});
		
		this.unifiedWsGateway.emitTaskCreated(task);
	
		return task;
	}
	
	async getTaskById(id: string) {
		const task = await this.prisma.task.findUnique({
			where: { id },
			include: { attachments: true },
		});

		if (!task) {
			return null
		};
		
		return this.serializeTask(task);
	}
	
	async getTasksByTeamId(teamId: string, filters?: GetTasksQueryDto) {
		return this.prisma.task.findMany({ 
			where: {
				teamId,
				...(filters?.title && { title: { contains: filters.title, mode: 'insensitive' } }),
				...(filters?.priority && { priority: filters.priority }),
				...(filters?.status && { status: filters.status }),
				...(filters?.boardId && { boardId: filters.boardId }),
				...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
			},
		});
	}
	
	async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
		const task = await this.prisma.task.update({
			where: { id },
			data: updateTaskDto,
			include: { attachments: true },
		});

		this.unifiedWsGateway.emitTaskUpdated(this.serializeTask(task));
		
		return task;
	}
	
	async patchTask(id: string, patchTaskDto: PatchTaskDto) {
		const task = await this.prisma.task.update({
			where: { id },
			data: patchTaskDto,
			include: { attachments: true },
		});

		const serialized = this.serializeTask(task);
		this.unifiedWsGateway.emitTaskUpdated(serialized);

		return plainToInstance(TaskResponseDto, serialized, { 
			excludeExtraneousValues: true
		});
	}

	async addAttachments(taskId: string, files: { filename: string; originalname: string; mimetype: string; size: number }[]) {
		await this.prisma.taskAttachment.createMany({
			data: files.map((file) => ({
				taskId,
				storedFileName: file.filename,
				originalFileName: basename(file.originalname) || file.filename,
				mimeType: file.mimetype || 'application/octet-stream',
				sizeBytes: file.size,
			})),
		});

		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			include: { attachments: true },
		});

		const serialized = this.serializeTask(task);
		this.unifiedWsGateway.emitTaskUpdated(serialized);

		return serialized;
	}

	async deleteAttachment(taskId: string, attachmentId: string) {
		await this.prisma.taskAttachment.delete({
			where: { id: attachmentId, taskId },
		});

		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			include: { attachments: true },
		});

		const serialized = this.serializeTask(task);
		this.unifiedWsGateway.emitTaskUpdated(serialized);

		return serialized;
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