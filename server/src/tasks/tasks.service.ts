import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, PatchTaskDto, TaskResponseDto, GetTasksQueryDto, CreateTaskCommentDto } from './dto/tasks.dto';
import { UnifiedWebsocketGateway } from '../websocket/unified/websocket.gateway';
import { TaskStatus, Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { basename } from 'path';
import type { UploadedFileMeta } from '../storage/cloudinary.service';

const TASK_INCLUDE = {
	assigned: { select: { id: true, username: true, avatar: true } },
	attachments: true,
	comments: {
		include: {
			author: { select: { id: true, username: true, avatar: true } },
			attachments: true,
		},
		orderBy: { createdAt: 'asc' as const },
	},
} as const;

type TaskWithRelations = Prisma.TaskGetPayload<{
	include: typeof TASK_INCLUDE;
}>;

@Injectable()
export class TasksService {
	constructor(private readonly prisma: PrismaService, private readonly unifiedWsGateway: UnifiedWebsocketGateway) {}

	private serializeTask(task: TaskWithRelations) {
		return {
			...task,
			attachments: task.attachments.map((attachment) => ({
				id: attachment.id,
				url: attachment.storedFileName,
				originalFileName: attachment.originalFileName,
				mimeType: attachment.mimeType,
				sizeBytes: attachment.sizeBytes,
			})),
			comments: task.comments.map((comment) => ({
				id: comment.id,
				taskId: comment.taskId,
				authorId: comment.authorId,
				body: comment.body,
				createdAt: comment.createdAt,
				updatedAt: comment.updatedAt,
				author: comment.author,
				attachments: comment.attachments.map((attachment) => ({
					id: attachment.id,
					url: attachment.storedFileName,
					originalFileName: attachment.originalFileName,
					mimeType: attachment.mimeType,
					sizeBytes: attachment.sizeBytes,
				})),
			})),
		};
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
				...(createTaskDto.startedAt !== undefined && { startedAt: createTaskDto.startedAt }),
				...(createTaskDto.endedAt !== undefined && { endedAt: createTaskDto.endedAt }),
			},
			include: TASK_INCLUDE,
		});
		
		this.unifiedWsGateway.emitTaskCreated(task);
	
		return task;
	}
	
	async getTaskById(id: string) {
		const task = await this.prisma.task.findUnique({
			where: { id },
			include: TASK_INCLUDE,
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
            include: {
                assigned: {
                    select: { id: true, username: true, avatar: true },
                }
            }
		});
	}
	
	async patchTask(id: string, patchTaskDto: PatchTaskDto, userId: string) {
		const task = await this.prisma.task.update({
			where: { id },
			data: patchTaskDto,
			include: TASK_INCLUDE,
		});

		const serialized = this.serializeTask(task);
		this.unifiedWsGateway.emitTaskUpdated(serialized, userId);

		return plainToInstance(TaskResponseDto, serialized, { 
			excludeExtraneousValues: true
		});
	}

	async addAttachments(taskId: string, files: UploadedFileMeta[]) {
		await this.prisma.taskAttachment.createMany({
			data: files.map((file) => ({
				taskId,
				storedFileName: file.url,
				originalFileName: basename(file.originalname) || file.url,
				mimeType: file.mimetype || 'application/octet-stream',
				sizeBytes: file.size,
			})),
		});

		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			include: TASK_INCLUDE,
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
			include: TASK_INCLUDE,
		});

		const serialized = this.serializeTask(task);
		this.unifiedWsGateway.emitTaskUpdated(serialized);

		return serialized;
	}

	async createComment(
		taskId: string,
		authorId: string,
		dto: CreateTaskCommentDto,
		files: UploadedFileMeta[],
	) {
		await this.prisma.taskComment.create({
			data: {
				taskId,
				authorId,
				body: dto.body,
				attachments: {
					create: files.map((file) => ({
						storedFileName: file.url,
						originalFileName: basename(file.originalname) || file.url,
						mimeType: file.mimetype || 'application/octet-stream',
						sizeBytes: file.size,
					})),
				},
			},
		});

		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			include: TASK_INCLUDE,
		});

		const serialized = this.serializeTask(task);
		this.unifiedWsGateway.emitTaskUpdated(serialized);

		return serialized;
	}

	async deleteComment(taskId: string, commentId: string) {
		await this.prisma.taskComment.delete({
			where: { id: commentId, taskId },
		});

		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			include: TASK_INCLUDE,
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