import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('team/:teamId')
  findByTeam(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.playersService.findByTeam(teamId);
  }

  @Get(':id/stats')
  getPlayerStats(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.getPlayerStats(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }
}
