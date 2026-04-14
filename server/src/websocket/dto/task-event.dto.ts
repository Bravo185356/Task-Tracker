export interface TaskEventDto {
	id: string;
	teamId: string;
	boardId?: string;
}

export interface TaskMovedDto {
	boardId: string;
	taskId: string;
	fromColumn: string;
	toColumn: string;
	order: number;
}
