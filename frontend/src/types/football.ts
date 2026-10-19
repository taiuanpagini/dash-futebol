export interface Team {
  id: number;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  stadium: string;
  founded: number;
  manager: string;
  logoText: string;
}

export interface MatchStats {
  teamId: number;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  offsides: number;
}

export interface Fixture {
  id: number;
  matchweek: number;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  homeGoals: number;
  awayGoals: number;
  played: boolean;
  homeStats?: MatchStats;
  awayStats?: MatchStats;
}

export interface Player {
  id: number;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  teamId: number;
  age: number;
  nationality: string;
  number: number;
}

export interface PlayerMatchStats {
  matchweek: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  rating: number;
  yellowCard: boolean;
  redCard: boolean;
}

export interface PlayerWithStats extends Player {
  stats: PlayerMatchStats[];
  totalGoals: number;
  totalAssists: number;
  averageRating: number;
}

export interface TeamSeasonStats {
  teamId: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  avgPossession: number;
  avgPassAccuracy: number;
  avgShotsPerGame: number;
  avgShotsOnTargetPerGame: number;
  points: number;
}

export interface MatchweekData {
  matchweek: number;
  goalsScored: number;
  goalsConceded: number;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  result: 'W' | 'D' | 'L';
  opponent: string;
  opponentColor: string;
  homeAway: 'H' | 'A';
}
