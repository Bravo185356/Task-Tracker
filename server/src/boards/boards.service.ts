import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
	constructor(private readonly prisma: PrismaService) {}

	async createBoard(createBoardDto: CreateBoardDto) {
		const board = await this.prisma.board.create({
			data: {
				...createBoardDto,
				teamId: createBoardDto.teamId,
			},
		});
		return board;
	}
	
	async getBoards(teamId: string) {
		return this.prisma.board.findMany({
			where: { teamId },
		});
	}
	
	async getBoard(boardId: string) {
		return this.prisma.board.findUnique({
			where: { id: boardId },
			include: {
				tasks: true,
			},
		});
	}
}