import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fixture } from './entities/fixture.entity';
import { MatchStats } from './entities/match-stats.entity';

@Injectable()
export class FixturesService {
  constructor(
    @InjectRepository(Fixture)
    private readonly fixtureRepo: Repository<Fixture>,
    @InjectRepository(MatchStats)
    private readonly matchStatsRepo: Repository<MatchStats>,
  ) {}

  findAll(teamId?: number): Promise<Fixture[]> {
    if (teamId) {
      return this.fixtureRepo.find({
        where: [{ homeTeam: { id: teamId } }, { awayTeam: { id: teamId } }],
        order: { matchweek: 'ASC' },
      });
    }
    return this.fixtureRepo.find({ order: { matchweek: 'ASC', id: 'ASC' } });
  }

  findByTeam(teamId: number): Promise<Fixture[]> {
    return this.fixtureRepo.find({
      where: [{ homeTeam: { id: teamId } }, { awayTeam: { id: teamId } }],
      order: { matchweek: 'ASC' },
    });
  }

  async getMatchweekStats(teamId: number): Promise<object[]> {
    const fixtures = await this.findByTeam(teamId);

    return fixtures.map((fixture) => {
      const isHome = fixture.homeTeam?.id === teamId;
      const goalsFor = isHome ? fixture.homeGoals : fixture.awayGoals;
      const goalsAgainst = isHome ? fixture.awayGoals : fixture.homeGoals;
      const result =
        goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D';

      const teamStats = fixture.stats?.find((s) => s.team?.id === teamId);

      return {
        matchweek: fixture.matchweek,
        date: fixture.date,
        opponent: isHome ? fixture.awayTeam?.name : fixture.homeTeam?.name,
        opponentShortName: isHome
          ? fixture.awayTeam?.shortName
          : fixture.homeTeam?.shortName,
        isHome,
        goalsFor,
        goalsAgainst,
        result,
        possession: teamStats ? Number(teamStats.possession) : 0,
        shots: teamStats?.shots ?? 0,
        shotsOnTarget: teamStats?.shotsOnTarget ?? 0,
        passes: teamStats?.passes ?? 0,
        passAccuracy: teamStats ? Number(teamStats.passAccuracy) : 0,
        corners: teamStats?.corners ?? 0,
        fouls: teamStats?.fouls ?? 0,
        yellowCards: teamStats?.yellowCards ?? 0,
        redCards: teamStats?.redCards ?? 0,
        offsides: teamStats?.offsides ?? 0,
      };
    });
  }
}
