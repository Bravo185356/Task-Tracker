interface CreateTaskRequest {
	title: string;
	description?: string;
	boardId?: string;
	assignedTo?: string;
	teamId: string;
	status?: string;
}

interface GetTasksQuery {
	title?: string;
	assignedTo?: string | null;
	priority?: string | null;
	status?: string | null;
	boardId?: string | null;
}

export type { CreateTaskRequest, GetTasksQuery };