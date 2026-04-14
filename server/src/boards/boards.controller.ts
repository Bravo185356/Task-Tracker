import { Controller, Post, Body, Request, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
	constructor(private readonly boardsService: BoardsService) {}
	
	@Get('/team/:teamId')
	async getBoards(@Param('teamId') teamId: string) {
		return this.boardsService.getBoards(teamId);
	}
	
	@Get(':boardId')
	async getBoard(@Param('boardId') boardId: string) {
		return this.boardsService.getBoard(boardId);
	}
	
	@Post()
	async createBoard(@Body() createBoardDto: CreateBoardDto) {
		return this.boardsService.createBoard(createBoardDto);
	}
}