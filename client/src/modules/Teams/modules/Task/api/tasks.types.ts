interface CreateTaskRequest {
	title: string;
	description?: string;
	boardId?: string;
	assignedTo?: string;
	teamId: string;
	status?: string;
}

export type { CreateTaskRequest };