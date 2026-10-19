import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { FixturesService } from './fixtures.service';

@Controller('fixtures')
export class FixturesController {
  constructor(private readonly fixturesService: FixturesService) {}

  @Get()
  findAll(@Query('teamId') teamId?: string) {
    const id = teamId ? parseInt(teamId, 10) : undefined;
    return this.fixturesService.findAll(id);
  }

  @Get('team/:teamId/matchweeks')
  getMatchweekStats(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.fixturesService.getMatchweekStats(teamId);
  }

  @Get('team/:teamId')
  findByTeam(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.fixturesService.findByTeam(teamId);
  }
}
