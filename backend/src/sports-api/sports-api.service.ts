import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Response shapes from API-Football v3 */
export interface ApiTeam {
  team: { id: number; name: string; code: string; logo: string; founded: number };
  venue: { name: string };
}

export interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string } };
  league: { round: string };
  teams: {
    home: { id: number; name: string; winner: boolean | null };
    away: { id: number; name: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

export interface ApiFixtureStat {
  team: { id: number };
  statistics: Array<{ type: string; value: string | number | null }>;
}

export interface ApiPlayer {
  player: { id: number; name: string; age: number; nationality: string; photo: string };
  statistics: Array<{
    team: { id: number };
    games: { position: string; number: number; rating: string | null };
    goals: { total: number | null; assists: number | null };
    shots: { total: number | null; on: number | null };
    passes: { total: number | null; accuracy: string | null };
    cards: { yellow: number; red: number };
    minutes: number | null;
  }>;
}

@Injectable()
export class SportsApiService {
  private readonly logger = new Logger(SportsApiService.name);
  private readonly baseUrl = 'https://v3.football.api-sports.io';
  private readonly apiKey: string | undefined;
  private readonly season: string;
  private readonly leagueId = 39; // Premier League

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get<string>('SPORTS_API_KEY');
    this.season = config.get<string>('SPORTS_API_SEASON') ?? '2024';
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async get<T>(path: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('SPORTS_API_KEY não configurada. Defina a variável de ambiente e tente novamente.');
    }

    const url = `${this.baseUrl}${path}`;
    this.logger.log(`GET ${url}`);

    const res = await fetch(url, {
      headers: {
        'x-apisports-key': this.apiKey,
      },
    });

    if (!res.ok) {
      throw new Error(`API-Football respondeu ${res.status} para ${path}`);
    }

    const json = (await res.json()) as { response: T; errors: unknown };

    if (json.errors && typeof json.errors === 'object' && Object.keys(json.errors).length > 0) {
      throw new Error(`Erro da API: ${JSON.stringify(json.errors)}`);
    }

    return json.response;
  }

  async fetchTeams(): Promise<ApiTeam[]> {
    return this.get<ApiTeam[]>(
      `/teams?league=${this.leagueId}&season=${this.season}`,
    );
  }

  async fetchFixtures(): Promise<ApiFixture[]> {
    return this.get<ApiFixture[]>(
      `/fixtures?league=${this.leagueId}&season=${this.season}`,
    );
  }

  async fetchFixtureStats(fixtureId: number): Promise<ApiFixtureStat[]> {
    return this.get<ApiFixtureStat[]>(`/fixtures/statistics?fixture=${fixtureId}`);
  }

  async fetchTopScorers(): Promise<ApiPlayer[]> {
    return this.get<ApiPlayer[]>(
      `/players/topscorers?league=${this.leagueId}&season=${this.season}`,
    );
  }

  async fetchTopAssists(): Promise<ApiPlayer[]> {
    return this.get<ApiPlayer[]>(
      `/players/topassists?league=${this.leagueId}&season=${this.season}`,
    );
  }

  /** Parse matchweek number from round string like "Regular Season - 12" */
  parseMatchweek(round: string): number {
    const match = round.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /** Extract a stat value by type from fixture stats */
  extractStat(
    stats: Array<{ type: string; value: string | number | null }>,
    type: string,
  ): number {
    const stat = stats.find((s) => s.type === type);
    if (!stat || stat.value === null) return 0;
    const raw = String(stat.value).replace('%', '');
    return parseFloat(raw) || 0;
  }
}
