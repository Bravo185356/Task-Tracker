import { httpClient } from '@/app/config/httpClient';
import type { Board } from '@/shared/types/entities';
import type { CreateBoardRequest } from './boards.types';

export class BoardsAPI {
	static async createBoard(data: CreateBoardRequest): Promise<Board> {
		return httpClient.post<Board>(`/boards`, data);
	}
	
	static async getBoards(teamId: string): Promise<Board[]> {
		return httpClient.get<Board[]>(`/boards/team/${teamId}`);
	}
	
	static async getBoard(boardId: string): Promise<Board> {
		return httpClient.get<Board>(`/boards/${boardId}`);
	}
	
	static async updateBoard(boardId: string, data: Partial<Board>): Promise<Board> {
		return httpClient.patch<Board>(`/boards/${boardId}`, data);
	}
}