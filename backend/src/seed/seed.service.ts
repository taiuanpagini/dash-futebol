import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { Fixture } from '../fixtures/entities/fixture.entity';
import { MatchStats } from '../fixtures/entities/match-stats.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerStats } from '../players/entities/player-stats.entity';

const TEAMS_SEED = [
  { name: 'Arsenal', shortName: 'ARS', primaryColor: '#EF0107', secondaryColor: '#FFFFFF', stadium: 'Emirates Stadium', founded: 1886, manager: 'Mikel Arteta', logoText: 'ARS' },
  { name: 'Aston Villa', shortName: 'AVL', primaryColor: '#95BFE5', secondaryColor: '#670E36', stadium: 'Villa Park', founded: 1874, manager: 'Unai Emery', logoText: 'AVL' },
  { name: 'Bournemouth', shortName: 'BOU', primaryColor: '#DA291C', secondaryColor: '#000000', stadium: 'Vitality Stadium', founded: 1899, manager: 'Andoni Iraola', logoText: 'BOU' },
  { name: 'Brentford', shortName: 'BRE', primaryColor: '#E30613', secondaryColor: '#FFFFFF', stadium: 'Gtech Community Stadium', founded: 1889, manager: 'Thomas Frank', logoText: 'BRE' },
  { name: 'Brighton', shortName: 'BHA', primaryColor: '#0057B8', secondaryColor: '#FFCD00', stadium: 'Amex Stadium', founded: 1901, manager: 'Fabian Hürzeler', logoText: 'BHA' },
  { name: 'Chelsea', shortName: 'CHE', primaryColor: '#034694', secondaryColor: '#FFFFFF', stadium: 'Stamford Bridge', founded: 1905, manager: 'Enzo Maresca', logoText: 'CHE' },
  { name: 'Crystal Palace', shortName: 'CRY', primaryColor: '#1B458F', secondaryColor: '#C4122E', stadium: 'Selhurst Park', founded: 1905, manager: 'Oliver Glasner', logoText: 'CRY' },
  { name: 'Everton', shortName: 'EVE', primaryColor: '#003399', secondaryColor: '#FFFFFF', stadium: 'Goodison Park', founded: 1878, manager: 'Sean Dyche', logoText: 'EVE' },
  { name: 'Fulham', shortName: 'FUL', primaryColor: '#000000', secondaryColor: '#FFFFFF', stadium: 'Craven Cottage', founded: 1879, manager: 'Marco Silva', logoText: 'FUL' },
  { name: 'Ipswich', shortName: 'IPS', primaryColor: '#0044A9', secondaryColor: '#FFFFFF', stadium: 'Portman Road', founded: 1878, manager: 'Kieran McKenna', logoText: 'IPS' },
  { name: 'Leicester City', shortName: 'LEI', primaryColor: '#003090', secondaryColor: '#FDBE11', stadium: 'King Power Stadium', founded: 1884, manager: 'Steve Cooper', logoText: 'LEI' },
  { name: 'Liverpool', shortName: 'LIV', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', stadium: 'Anfield', founded: 1892, manager: 'Arne Slot', logoText: 'LIV' },
  { name: 'Manchester City', shortName: 'MCI', primaryColor: '#6CABDD', secondaryColor: '#1C2C5B', stadium: 'Etihad Stadium', founded: 1880, manager: 'Pep Guardiola', logoText: 'MCI' },
  { name: 'Manchester United', shortName: 'MUN', primaryColor: '#DA291C', secondaryColor: '#FBE122', stadium: 'Old Trafford', founded: 1878, manager: 'Erik ten Hag', logoText: 'MUN' },
  { name: 'Newcastle United', shortName: 'NEW', primaryColor: '#241F20', secondaryColor: '#FFFFFF', stadium: 'St. James\' Park', founded: 1892, manager: 'Eddie Howe', logoText: 'NEW' },
  { name: 'Nottingham Forest', shortName: 'NFO', primaryColor: '#DD0000', secondaryColor: '#FFFFFF', stadium: 'City Ground', founded: 1865, manager: 'Nuno Espírito Santo', logoText: 'NFO' },
  { name: 'Southampton', shortName: 'SOU', primaryColor: '#D71920', secondaryColor: '#FFFFFF', stadium: 'St Mary\'s Stadium', founded: 1885, manager: 'Russell Martin', logoText: 'SOU' },
  { name: 'Tottenham', shortName: 'TOT', primaryColor: '#132257', secondaryColor: '#FFFFFF', stadium: 'Tottenham Hotspur Stadium', founded: 1882, manager: 'Ange Postecoglou', logoText: 'TOT' },
  { name: 'West Ham', shortName: 'WHU', primaryColor: '#7A263A', secondaryColor: '#1BB1E7', stadium: 'London Stadium', founded: 1895, manager: 'Julen Lopetegui', logoText: 'WHU' },
  { name: 'Wolves', shortName: 'WOL', primaryColor: '#FDB913', secondaryColor: '#231F20', stadium: 'Molineux Stadium', founded: 1877, manager: 'Gary O\'Neil', logoText: 'WOL' },
];

@Injectable()
export class DataSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DataSeederService.name);

  constructor(
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

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.teamRepo.count();
    if (count > 0) {
      this.logger.log(`Database already has ${count} teams — skipping seed.`);
      return;
    }
    this.logger.log('Seeding database with Premier League 2024/25 data…');
    await this.seedTeams();
    this.logger.log('Seed completed.');
  }

  private async seedTeams(): Promise<void> {
    const teams = TEAMS_SEED.map((t) => this.teamRepo.create(t));
    await this.teamRepo.save(teams);
    this.logger.log(`Seeded ${teams.length} teams.`);
  }
}
