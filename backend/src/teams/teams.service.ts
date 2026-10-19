import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { MatchStats } from '../fixtures/entities/match-stats.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(MatchStats)
    private readonly matchStatsRepo: Repository<MatchStats>,
  ) {}

  findAll(): Promise<Team[]> {
    return this.teamRepo.find({ order: { wins: 'DESC', goalsScored: 'DESC' } });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepo.findOne({ where: { id } });
    if (!team) throw new NotFoundException(`Team with id ${id} not found`);
    return team;
  }

  async getTeamSeasonStats(id: number) {
    const team = await this.findOne(id);

    const matchStats = await this.matchStatsRepo.find({
      where: { team: { id } },
    });

    const len = matchStats.length || 1;

    const avg = (fn: (s: MatchStats) => number) =>
      parseFloat((matchStats.reduce((acc, s) => acc + Number(fn(s)), 0) / len).toFixed(2));

    const played = team.wins + team.draws + team.losses;

    return {
      team,
      summary: {
        played,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goalsScored: team.goalsScored,
        goalsConceded: team.goalsConceded,
        goalDifference: team.goalsScored - team.goalsConceded,
        cleanSheets: team.cleanSheets,
        points: team.wins * 3 + team.draws,
        winRate: played > 0 ? parseFloat(((team.wins / played) * 100).toFixed(1)) : 0,
      },
      averages: {
        possession: avg((s) => s.possession),
        shots: avg((s) => s.shots),
        shotsOnTarget: avg((s) => s.shotsOnTarget),
        passes: avg((s) => s.passes),
        passAccuracy: avg((s) => s.passAccuracy),
        fouls: avg((s) => s.fouls),
        yellowCards: avg((s) => s.yellowCards),
        redCards: avg((s) => s.redCards),
        corners: avg((s) => s.corners),
        offsides: avg((s) => s.offsides),
      },
    };
  }
}
