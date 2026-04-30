import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, InviteUserDto } from './dto/teams.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async findAll(@Request() req) {
    const teams = await this.teamsService.findAll(req.user.userId);
    return teams;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const team = await this.teamsService.findOne(id, req.user.userId);
    return team;
  }
  
  @Post()
  async create(@Request() req, @Body() createTeamDto: CreateTeamDto) {
    const team = await this.teamsService.create(req.user.userId, createTeamDto);
    return team;
  }

  @Post(':teamId/invite')
  async invite(@Param('teamId') teamId: string, @Request() req, @Body() inviteUserDto: InviteUserDto) {
    return this.teamsService.invite(teamId, req.user.userId, inviteUserDto);
  }
  
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    const team = await this.teamsService.update(id, req.user.userId, updateTeamDto);
    return team;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.teamsService.remove(id, req.user.userId);
  }
}
