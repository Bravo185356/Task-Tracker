import type { Task } from '@/shared/types/entities';
import type { CreateTaskRequest } from './tasks.types';
import { httpClient } from '@/app/config/httpClient';

export class TasksAPI {
	static async createTask(data: CreateTaskRequest): Promise<Task> {
		return httpClient.post(`/tasks`, data);
	}

	static async getTasks(teamId: string): Promise<Task[]> {
		return httpClient.get(`/tasks/team/${teamId}`);
	}
	
	static async getTaskById(taskId: string): Promise<Task> {
		return httpClient.get(`/tasks/${taskId}`);
	}
	
	static async updateTask(taskId: string, data: Partial<Task>) {
		return httpClient.put<Task>(`/tasks/${taskId}`, data);
	}

	static async patchTask(taskId: string, data: Partial<Task>): Promise<Task> {
		return httpClient.patch<Task>(`/tasks/${taskId}`, data);
	}

	static async deleteTask(taskId: string): Promise<{ id: string }> {
		return httpClient.delete(`/tasks/${taskId}`);
	}
}