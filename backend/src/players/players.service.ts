import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { PlayerStats } from './entities/player-stats.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    @InjectRepository(PlayerStats)
    private readonly playerStatsRepo: Repository<PlayerStats>,
  ) {}

  findByTeam(teamId: number): Promise<Player[]> {
    return this.playerRepo.find({
      where: { team: { id: teamId } },
      order: { number: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Player> {
    const player = await this.playerRepo.findOne({
      where: { id },
      relations: ['stats'],
    });
    if (!player) throw new NotFoundException(`Player with id ${id} not found`);
    return player;
  }

  async getPlayerStats(id: number): Promise<object> {
    const player = await this.playerRepo.findOne({ where: { id } });
    if (!player) throw new NotFoundException(`Player with id ${id} not found`);

    const stats = await this.playerStatsRepo.find({
      where: { player: { id } },
      order: { matchweek: 'ASC' },
    });

    const played = stats.length || 1;
    const totalGoals = stats.reduce((s, r) => s + r.goals, 0);
    const totalAssists = stats.reduce((s, r) => s + r.assists, 0);
    const totalMinutes = stats.reduce((s, r) => s + r.minutesPlayed, 0);
    const avgRating = parseFloat(
      (stats.reduce((s, r) => s + Number(r.rating), 0) / played).toFixed(2),
    );

    return {
      player,
      summary: {
        matchesPlayed: stats.length,
        goals: totalGoals,
        assists: totalAssists,
        minutesPlayed: totalMinutes,
        avgRating,
        yellowCards: stats.filter((s) => s.yellowCard).length,
        redCards: stats.filter((s) => s.redCard).length,
        goalsPerGame: parseFloat((totalGoals / played).toFixed(2)),
        assistsPerGame: parseFloat((totalAssists / played).toFixed(2)),
      },
      matchweekStats: stats.map((s) => ({
        matchweek: s.matchweek,
        goals: s.goals,
        assists: s.assists,
        minutesPlayed: s.minutesPlayed,
        shots: s.shots,
        shotsOnTarget: s.shotsOnTarget,
        passes: s.passes,
        passAccuracy: Number(s.passAccuracy),
        rating: Number(s.rating),
        yellowCard: s.yellowCard,
        redCard: s.redCard,
      })),
    };
  }
}
