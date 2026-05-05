import {
	Controller, Post, Body, Get, Param, Put, Patch, Delete, Query,
	UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { CreateTaskDto, UpdateTaskDto, PatchTaskDto, GetTasksQueryDto } from './dto/tasks.dto';
import { TasksService } from './tasks.service';
import { SerializeOptions, ClassSerializerInterceptor } from '@nestjs/common';
import { TaskResponseDto } from './dto/tasks.dto';

const MAX_FILES = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

const taskAttachmentsStorage = diskStorage({
	destination: (_req, _file, callback) => {
		const dir = join(process.cwd(), 'uploads', 'task-attachments');
		mkdirSync(dir, { recursive: true });
		callback(null, dir);
	},
	filename: (_req, file, callback) => {
		callback(null, TasksService.makeStoredFileName(file.originalname));
	},
});

@Controller('tasks')
export class TasksController {
	constructor(private readonly tasksService: TasksService) {}

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
	async patchTask(@Param('id') id: string, @Body() patchTaskDto: PatchTaskDto) {
		return this.tasksService.patchTask(id, patchTaskDto);
	}

	@Post(':id/attachments')
	@UseInterceptors(
		FilesInterceptor('files', MAX_FILES, {
			storage: taskAttachmentsStorage,
			limits: { fileSize: MAX_FILE_BYTES },
		}),
	)
	async addAttachments(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[] | undefined) {
		const list = files ?? [];
		
		if (list.length === 0) {
			throw new BadRequestException('At least one file is required');
		}
		
		return this.tasksService.addAttachments(id, list);
	}

	@Delete(':id/attachments/:attachmentId')
	async deleteAttachment(@Param('id') id: string, @Param('attachmentId') attachmentId: string) {
		return this.tasksService.deleteAttachment(id, attachmentId);
	}

	@Delete(':id')
	async deleteTask(@Param('id') id: string) {
		return this.tasksService.deleteTask(id);
	}
}