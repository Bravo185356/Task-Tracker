import { Controller, Post, Body, Get, Param, Put, Patch, Delete } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto, PatchTaskDto } from './dto/tasks.dto';
import { TasksService } from './tasks.service';
import { SerializeOptions } from '@nestjs/common';
import { TaskResponseDto } from './dto/tasks.dto';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
	constructor(private readonly tasksService: TasksService) {}

	@Get('/team/:teamId')
	async getTasksByTeamId(@Param('teamId') teamId: string) {
		return this.tasksService.getTasksByTeamId(teamId);
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

	@Delete(':id')
	async deleteTask(@Param('id') id: string) {
		return this.tasksService.deleteTask(id);
	}
}		