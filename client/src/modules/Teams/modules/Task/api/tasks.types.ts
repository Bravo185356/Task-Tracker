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

interface PatchTaskRequest {
	title?: string;
	description?: string;
	assignedTo?: string;
	status?: string;
	priority?: string;
	startedAt?: string | null;
	endedAt?: string | null;
}

export type { CreateTaskRequest, GetTasksQuery, PatchTaskRequest };