import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportsApiService } from './sports-api.service';
import { SyncStatus } from './entities/sync-status.entity';
import { Team } from '../teams/entities/team.entity';
import { Fixture } from '../fixtures/entities/fixture.entity';
import { MatchStats } from '../fixtures/entities/match-stats.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerStats } from '../players/entities/player-stats.entity';

const PREMIER_LEAGUE_COLORS: Record<string, { primary: string; secondary: string }> = {
  Arsenal: { primary: '#EF0107', secondary: '#FFFFFF' },
  'Aston Villa': { primary: '#95BFE5', secondary: '#670E36' },
  Bournemouth: { primary: '#DA291C', secondary: '#000000' },
  Brentford: { primary: '#E30613', secondary: '#FFFFFF' },
  Brighton: { primary: '#0057B8', secondary: '#FFCD00' },
  Chelsea: { primary: '#034694', secondary: '#FFFFFF' },
  'Crystal Palace': { primary: '#1B458F', secondary: '#C4122E' },
  Everton: { primary: '#003399', secondary: '#FFFFFF' },
  Fulham: { primary: '#000000', secondary: '#FFFFFF' },
  Ipswich: { primary: '#0044A9', secondary: '#FFFFFF' },
  'Leicester City': { primary: '#003090', secondary: '#FDBE11' },
  Liverpool: { primary: '#C8102E', secondary: '#FFFFFF' },
  'Manchester City': { primary: '#6CABDD', secondary: '#1C2C5B' },
  'Manchester United': { primary: '#DA291C', secondary: '#FBE122' },
  'Newcastle United': { primary: '#241F20', secondary: '#FFFFFF' },
  'Nottingham Forest': { primary: '#DD0000', secondary: '#FFFFFF' },
  Southampton: { primary: '#D71920', secondary: '#FFFFFF' },
  Tottenham: { primary: '#132257', secondary: '#FFFFFF' },
  'West Ham': { primary: '#7A263A', secondary: '#1BB1E7' },
  Wolves: { primary: '#FDB913', secondary: '#231F20' },
};

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private isSyncing = false;

  constructor(
    private readonly sportsApi: SportsApiService,
    @InjectRepository(SyncStatus)
    private readonly syncStatusRepo: Repository<SyncStatus>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Fixture)
    private readonly fixtureRepo: Repository<Fixture>,
    @InjectRepository(MatchStats)
    private readonly matchStatsRepo: Repository<MatchStats>,
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    @InjectRepository(PlayerStats)
    private readonly playerStatsRepo: Repository<PlayerStats>,
  ) {}

  async getStatus(): Promise<SyncStatus> {
    let status = await this.syncStatusRepo.findOne({ where: {}, order: { id: 'ASC' } });
    if (!status) {
      status = this.syncStatusRepo.create({ status: 'idle' });
      await this.syncStatusRepo.save(status);
    }
    return status;
  }

  async triggerSync(): Promise<{ message: string }> {
    if (this.isSyncing) {
      return { message: 'Sincronização já em andamento.' };
    }

    if (!this.sportsApi.isConfigured) {
      throw new Error('SPORTS_API_KEY não configurada. Adicione a chave nas variáveis de ambiente do projeto.');
    }

    // Run sync in background
    this.runSync().catch((err: Error) => {
      this.logger.error('Sync failed', err.message);
    });

    return { message: 'Sincronização iniciada.' };
  }

  private async runSync(): Promise<void> {
    this.isSyncing = true;
    const statusRecord = await this.getStatus();
    statusRecord.status = 'syncing';
    statusRecord.errorMessage = null;
    await this.syncStatusRepo.save(statusRecord);

    try {
      this.logger.log('Starting sync...');

      // 1. Sync teams
      const teamsCount = await this.syncTeams();
      this.logger.log(`Synced ${teamsCount} teams`);

      // 2. Sync fixtures (results only)
      const fixturesCount = await this.syncFixtures();
      this.logger.log(`Synced ${fixturesCount} fixtures`);

      // 3. Sync match stats for recent played fixtures (cap at 8 to respect API free-tier limit of 100 req/day)
      await this.syncMatchStats(8);

      // 4. Sync top scorers and assist providers
      const playersCount = await this.syncTopPlayers();
      this.logger.log(`Synced ${playersCount} players`);

      statusRecord.status = 'success';
      statusRecord.lastSyncedAt = new Date();
      statusRecord.teamsCount = teamsCount;
      statusRecord.fixturesCount = fixturesCount;
      statusRecord.playersCount = playersCount;
      statusRecord.errorMessage = null;
      await this.syncStatusRepo.save(statusRecord);

      this.logger.log('Sync completed successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('Sync failed: ' + error.message);
      statusRecord.status = 'error';
      statusRecord.errorMessage = error.message;
      await this.syncStatusRepo.save(statusRecord);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncTeams(): Promise<number> {
    const apiTeams = await this.sportsApi.fetchTeams();

    for (const apiTeam of apiTeams) {
      const { team, venue } = apiTeam;
      const colors = PREMIER_LEAGUE_COLORS[team.name] ?? {
        primary: '#38003c',
        secondary: '#FFFFFF',
      };

      const existing = await this.teamRepo.findOne({ where: { externalId: team.id } });

      if (existing) {
        existing.name = team.name;
        existing.shortName = team.code ?? team.name.substring(0, 3).toUpperCase();
        existing.logoUrl = team.logo;
        existing.primaryColor = colors.primary;
        existing.secondaryColor = colors.secondary;
        existing.stadium = venue.name ?? '';
        existing.founded = team.founded ?? 0;
        await this.teamRepo.save(existing);
      } else {
        // Check by name in case it was seeded
        const byName = await this.teamRepo.findOne({ where: { name: team.name } });
        if (byName) {
          byName.externalId = team.id;
          byName.logoUrl = team.logo;
          byName.primaryColor = colors.primary;
          byName.secondaryColor = colors.secondary;
          byName.stadium = venue.name ?? byName.stadium;
          await this.teamRepo.save(byName);
        } else {
          await this.teamRepo.save(
            this.teamRepo.create({
              externalId: team.id,
              name: team.name,
              shortName: team.code ?? team.name.substring(0, 3).toUpperCase(),
              logoUrl: team.logo,
              primaryColor: colors.primary,
              secondaryColor: colors.secondary,
              stadium: venue.name ?? '',
              founded: team.founded ?? 0,
              manager: '',
              logoText: team.code ?? team.name.substring(0, 3).toUpperCase(),
              wins: 0,
              draws: 0,
              losses: 0,
              goalsScored: 0,
              goalsConceded: 0,
              cleanSheets: 0,
            }),
          );
        }
      }
    }

    return apiTeams.length;
  }

  private async syncFixtures(): Promise<number> {
    const apiFixtures = await this.sportsApi.fetchFixtures();

    // Reset team standings
    await this.teamRepo
      .createQueryBuilder()
      .update()
      .set({
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        cleanSheets: 0,
      })
      .execute();

    let synced = 0;

    for (const apiFix of apiFixtures) {
      const { fixture, league, teams, goals } = apiFix;
      const isPlayed = fixture.status.short === 'FT' || fixture.status.short === 'AET' || fixture.status.short === 'PEN';
      const matchweek = this.sportsApi.parseMatchweek(league.round);

      const homeTeam = await this.teamRepo.findOne({ where: { externalId: teams.home.id } });
      const awayTeam = await this.teamRepo.findOne({ where: { externalId: teams.away.id } });

      if (!homeTeam || !awayTeam) continue;

      const homeGoals = goals.home ?? 0;
      const awayGoals = goals.away ?? 0;

      const existing = await this.fixtureRepo.findOne({ where: { externalId: fixture.id } });

      const fixtureData = {
        externalId: fixture.id,
        matchweek,
        date: fixture.date.substring(0, 10),
        homeTeam,
        awayTeam,
        homeGoals,
        awayGoals,
        played: isPlayed,
      };

      if (existing) {
        Object.assign(existing, fixtureData);
        await this.fixtureRepo.save(existing);
      } else {
        await this.fixtureRepo.save(this.fixtureRepo.create(fixtureData));
      }

      // Update team standings for played matches
      if (isPlayed) {
        const homeGoalsFor = homeGoals;
        const awayGoalsFor = awayGoals;

        // Home team
        await this.teamRepo.increment({ id: homeTeam.id }, 'goalsScored', homeGoalsFor);
        await this.teamRepo.increment({ id: homeTeam.id }, 'goalsConceded', awayGoalsFor);
        if (homeGoalsFor > awayGoalsFor) {
          await this.teamRepo.increment({ id: homeTeam.id }, 'wins', 1);
        } else if (homeGoalsFor === awayGoalsFor) {
          await this.teamRepo.increment({ id: homeTeam.id }, 'draws', 1);
        } else {
          await this.teamRepo.increment({ id: homeTeam.id }, 'losses', 1);
        }
        if (awayGoalsFor === 0) {
          await this.teamRepo.increment({ id: homeTeam.id }, 'cleanSheets', 1);
        }

        // Away team
        await this.teamRepo.increment({ id: awayTeam.id }, 'goalsScored', awayGoalsFor);
        await this.teamRepo.increment({ id: awayTeam.id }, 'goalsConceded', homeGoalsFor);
        if (awayGoalsFor > homeGoalsFor) {
          await this.teamRepo.increment({ id: awayTeam.id }, 'wins', 1);
        } else if (awayGoalsFor === homeGoalsFor) {
          await this.teamRepo.increment({ id: awayTeam.id }, 'draws', 1);
        } else {
          await this.teamRepo.increment({ id: awayTeam.id }, 'losses', 1);
        }
        if (homeGoalsFor === 0) {
          await this.teamRepo.increment({ id: awayTeam.id }, 'cleanSheets', 1);
        }
      }

      synced++;
    }

    return synced;
  }

  private async syncMatchStats(limit: number): Promise<void> {
    // Get played fixtures that don't have stats yet or need updating
    const playedFixtures = await this.fixtureRepo.find({
      where: { played: true },
      order: { matchweek: 'DESC' },
      take: limit,
    });

    for (const fix of playedFixtures) {
      try {
        if (!fix.externalId) continue;

        const apiStats = await this.sportsApi.fetchFixtureStats(fix.externalId);

        // Delete existing stats for this fixture
        await this.matchStatsRepo
          .createQueryBuilder()
          .delete()
          .where('fixture_id = :id', { id: fix.id })
          .execute();

        for (const teamStat of apiStats) {
          const team = await this.teamRepo.findOne({ where: { externalId: teamStat.team.id } });
          if (!team) continue;

          const { statistics } = teamStat;
          const extract = (type: string) => this.sportsApi.extractStat(statistics, type);

          const possession = extract('Ball Possession');
          const shots = extract('Total Shots');
          const shotsOnTarget = extract('Shots on Goal');
          const passes = extract('Total passes');
          const passAccuracy = extract('Passes %');
          const fouls = extract('Fouls');
          const yellowCards = extract('Yellow Cards');
          const redCards = extract('Red Cards');
          const corners = extract('Corner Kicks');
          const offsides = extract('Offsides');

          await this.matchStatsRepo.save(
            this.matchStatsRepo.create({
              fixture: fix,
              team,
              possession,
              shots,
              shotsOnTarget,
              passes,
              passAccuracy,
              fouls,
              yellowCards,
              redCards,
              corners,
              offsides,
            }),
          );
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        this.logger.warn(`Failed to sync stats for fixture ${fix.externalId}: ${String(err)}`);
      }
    }
  }

  private async syncTopPlayers(): Promise<number> {
    const [scorers, assisters] = await Promise.all([
      this.sportsApi.fetchTopScorers(),
      this.sportsApi.fetchTopAssists(),
    ]);

    const seen = new Set<number>();
    const allPlayers = [...scorers, ...assisters].filter((p) => {
      if (seen.has(p.player.id)) return false;
      seen.add(p.player.id);
      return true;
    });

    for (const apiPlayer of allPlayers) {
      const { player, statistics } = apiPlayer;
      if (!statistics || statistics.length === 0) continue;

      const stat = statistics[0];
      const team = await this.teamRepo.findOne({ where: { externalId: stat.team.id } });
      if (!team) continue;

      const existing = await this.playerRepo.findOne({ where: { externalId: player.id } });

      const position = stat.games.position ?? 'Unknown';
      const number = stat.games.number ?? 0;
      const goals = stat.goals.total ?? 0;
      const assists = stat.goals.assists ?? 0;
      const shots = stat.shots.total ?? 0;
      const shotsOnTarget = stat.shots.on ?? 0;
      const passes = stat.passes.total ?? 0;
      const passAccuracy = parseFloat(stat.passes.accuracy ?? '0') || 0;
      const rating = parseFloat(stat.games.rating ?? '6.5') || 6.5;
      const minutes = stat.minutes ?? 0;
      const yellowCards = stat.cards.yellow ?? 0;
      const redCards = stat.cards.red ?? 0;

      let playerEntity: Player;

      if (existing) {
        existing.name = player.name;
        existing.age = player.age ?? 0;
        existing.nationality = player.nationality ?? '';
        existing.photoUrl = player.photo;
        existing.team = team;
        existing.position = position;
        existing.number = number;
        playerEntity = await this.playerRepo.save(existing);
      } else {
        // Check by name + team
        const byName = await this.playerRepo.findOne({ where: { name: player.name } });
        if (byName) {
          byName.externalId = player.id;
          byName.photoUrl = player.photo;
          byName.team = team;
          playerEntity = await this.playerRepo.save(byName);
        } else {
          playerEntity = await this.playerRepo.save(
            this.playerRepo.create({
              externalId: player.id,
              name: player.name,
              age: player.age ?? 0,
              nationality: player.nationality ?? '',
              photoUrl: player.photo,
              team,
              position,
              number,
            }),
          );
        }
      }

      // Upsert a single "season aggregate" stat entry (matchweek = 0)
      const existingStat = await this.playerStatsRepo.findOne({
        where: { player: { id: playerEntity.id }, matchweek: 0 },
      });

      const statData = {
        player: playerEntity,
        matchweek: 0,
        goals,
        assists,
        minutesPlayed: minutes,
        shots,
        shotsOnTarget,
        passes,
        passAccuracy,
        rating,
        yellowCard: yellowCards > 0,
        redCard: redCards > 0,
      };

      if (existingStat) {
        Object.assign(existingStat, statData);
        await this.playerStatsRepo.save(existingStat);
      } else {
        await this.playerStatsRepo.save(this.playerStatsRepo.create(statData));
      }
    }

    return allPlayers.length;
  }
}
