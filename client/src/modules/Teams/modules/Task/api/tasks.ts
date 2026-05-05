import type { Task } from '@/shared/types/entities';
import type { CreateTaskRequest, GetTasksQuery } from './tasks.types';
import { httpClient } from '@/app/config/httpClient';

export class TasksAPI {
	static async createTask(data: CreateTaskRequest): Promise<Task> {
		return httpClient.post(`/tasks`, data);
	}

	static async getTasks(teamId: string, query?: GetTasksQuery): Promise<Task[]> {
		return httpClient.get(`/tasks/team/${teamId}`, query as Record<string, string | null>);
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

	static async uploadAttachments(taskId: string, files: File[]): Promise<Task> {
		const formData = new FormData();
		files.forEach((file) => formData.append('files', file));
		return httpClient.postForm<Task>(`/tasks/${taskId}/attachments`, formData);
	}

	static async deleteAttachment(taskId: string, attachmentId: string): Promise<Task> {
		return httpClient.delete<Task>(`/tasks/${taskId}/attachments/${attachmentId}`);
	}

	static async deleteTask(taskId: string): Promise<{ id: string }> {
		return httpClient.delete(`/tasks/${taskId}`);
	}
}