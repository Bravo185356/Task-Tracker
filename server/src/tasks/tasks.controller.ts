import {
	Controller, Post, Body, Get, Param, Put, Patch, Delete, Query,
	UseInterceptors, UploadedFiles, BadRequestException, UseGuards, Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateTaskDto, UpdateTaskDto, PatchTaskDto, GetTasksQueryDto, CreateTaskCommentDto } from './dto/tasks.dto';
import { TasksService } from './tasks.service';
import { SerializeOptions, ClassSerializerInterceptor } from '@nestjs/common';
import { TaskResponseDto } from './dto/tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../storage/cloudinary.service';

const MAX_FILES = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
	constructor(
		private readonly tasksService: TasksService,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	@Get('/team/:teamId')
	async getTasksByTeamId(@Param('teamId') teamId: string, @Query() query: GetTasksQueryDto) {
		return this.tasksService.getTasksByTeamId(teamId, query);
	}

	@Get(':id')
	@SerializeOptions({ type: TaskResponseDto })
	async getTaskById(@Param('id') id: string) {
		return this.tasksService.getTaskById(id);
	}

	@Post()
	async createTask(@Body() createTaskDto: CreateTaskDto) {
		return this.tasksService.createTask(createTaskDto);
	}

	@Put(':id')
	async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
		return this.tasksService.updateTask(id, updateTaskDto);
	}

	@UseInterceptors(ClassSerializerInterceptor)
	@Patch(':id')
	async patchTask(
		@Param('id') id: string, 
		@Body() patchTaskDto: PatchTaskDto, 
		@Request() req: { user: { userId: string } },
	) {
		return this.tasksService.patchTask(id, patchTaskDto, req.user.userId);
	}

	@Post(':id/attachments')
	@UseInterceptors(
		FilesInterceptor('files', MAX_FILES, {
			storage: memoryStorage(),
			limits: { fileSize: MAX_FILE_BYTES },
		}),
	)
	async addAttachments(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[] | undefined) {
		const list = files ?? [];
		
		if (list.length === 0) {
			throw new BadRequestException('At least one file is required');
		}

		const uploaded = await this.cloudinaryService.uploadFiles(list, 'task-attachments');
		
		return this.tasksService.addAttachments(id, uploaded);
	}

	@Delete(':id/attachments/:attachmentId')
	async deleteAttachment(@Param('id') id: string, @Param('attachmentId') attachmentId: string) {
		return this.tasksService.deleteAttachment(id, attachmentId);
	}

	@Delete(':id')
	async deleteTask(@Param('id') id: string) {
		return this.tasksService.deleteTask(id);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':id/comments')
	@UseInterceptors(
		FilesInterceptor('files', MAX_FILES, {
			storage: memoryStorage(),
			limits: { fileSize: MAX_FILE_BYTES },
		}),
	)
	async createComment(
		@Param('id') id: string,
		@Body() dto: CreateTaskCommentDto,
		@UploadedFiles() files: Express.Multer.File[] | undefined,
		@Request() req: { user: { userId: string } },
	) {
		const list = files ?? [];
		const uploaded = list.length > 0
			? await this.cloudinaryService.uploadFiles(list, 'task-comment-attachments')
			: [];

		return this.tasksService.createComment(id, req.user.userId, dto, uploaded);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id/comments/:commentId')
	async deleteComment(@Param('id') id: string, @Param('commentId') commentId: string) {
		return this.tasksService.deleteComment(id, commentId);
	}
}