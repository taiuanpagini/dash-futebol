import { Team, Fixture, PlayerWithStats, MatchweekData, TeamSeasonStats } from '../types/football';

export const TEAMS: Team[] = [
  { id: 1, name: 'Arsenal', shortName: 'ARS', primaryColor: '#EF0107', secondaryColor: '#FFFFFF', stadium: 'Emirates Stadium', founded: 1886, manager: 'Mikel Arteta', logoText: 'ARS' },
  { id: 2, name: 'Chelsea', shortName: 'CHE', primaryColor: '#034694', secondaryColor: '#FFFFFF', stadium: 'Stamford Bridge', founded: 1905, manager: 'Enzo Maresca', logoText: 'CHE' },
  { id: 3, name: 'Manchester City', shortName: 'MCI', primaryColor: '#6CABDD', secondaryColor: '#1C2C5B', stadium: 'Etihad Stadium', founded: 1880, manager: 'Pep Guardiola', logoText: 'MCI' },
  { id: 4, name: 'Liverpool', shortName: 'LIV', primaryColor: '#C8102E', secondaryColor: '#F6EB61', stadium: 'Anfield', founded: 1892, manager: 'Arne Slot', logoText: 'LIV' },
  { id: 5, name: 'Manchester United', shortName: 'MUN', primaryColor: '#DA291C', secondaryColor: '#FBE122', stadium: 'Old Trafford', founded: 1878, manager: 'Rúben Amorim', logoText: 'MUN' },
  { id: 6, name: 'Tottenham', shortName: 'TOT', primaryColor: '#132257', secondaryColor: '#FFFFFF', stadium: 'Tottenham Hotspur Stadium', founded: 1882, manager: 'Ange Postecoglou', logoText: 'TOT' },
  { id: 7, name: 'Newcastle', shortName: 'NEW', primaryColor: '#241F20', secondaryColor: '#FFFFFF', stadium: "St. James' Park", founded: 1892, manager: 'Eddie Howe', logoText: 'NEW' },
  { id: 8, name: 'Aston Villa', shortName: 'AVL', primaryColor: '#670E36', secondaryColor: '#95BFE5', stadium: 'Villa Park', founded: 1874, manager: 'Unai Emery', logoText: 'AVL' },
  { id: 9, name: 'Brighton', shortName: 'BRI', primaryColor: '#0057B8', secondaryColor: '#FFFFFF', stadium: 'Amex Stadium', founded: 1901, manager: 'Fabian Hürzeler', logoText: 'BRI' },
  { id: 10, name: 'West Ham', shortName: 'WHU', primaryColor: '#7A263A', secondaryColor: '#1BB1E7', stadium: 'London Stadium', founded: 1895, manager: 'Julen Lopetegui', logoText: 'WHU' },
  { id: 11, name: 'Brentford', shortName: 'BRE', primaryColor: '#E30613', secondaryColor: '#FFFFFF', stadium: 'Gtech Community Stadium', founded: 1889, manager: 'Thomas Frank', logoText: 'BRE' },
  { id: 12, name: 'Crystal Palace', shortName: 'CRY', primaryColor: '#1B458F', secondaryColor: '#C4122E', stadium: 'Selhurst Park', founded: 1905, manager: 'Oliver Glasner', logoText: 'CRY' },
  { id: 13, name: 'Fulham', shortName: 'FUL', primaryColor: '#CC0000', secondaryColor: '#FFFFFF', stadium: 'Craven Cottage', founded: 1879, manager: 'Marco Silva', logoText: 'FUL' },
  { id: 14, name: 'Wolves', shortName: 'WOL', primaryColor: '#FDB913', secondaryColor: '#231F20', stadium: 'Molineux', founded: 1877, manager: 'Gary O\'Neil', logoText: 'WOL' },
  { id: 15, name: 'Everton', shortName: 'EVE', primaryColor: '#003399', secondaryColor: '#FFFFFF', stadium: 'Goodison Park', founded: 1878, manager: 'Sean Dyche', logoText: 'EVE' },
  { id: 16, name: 'Nottm Forest', shortName: 'NFO', primaryColor: '#DD0000', secondaryColor: '#FFFFFF', stadium: 'City Ground', founded: 1865, manager: 'Nuno Espírito Santo', logoText: 'NFO' },
  { id: 17, name: 'Bournemouth', shortName: 'BOU', primaryColor: '#DA291C', secondaryColor: '#000000', stadium: 'Vitality Stadium', founded: 1899, manager: 'Andoni Iraola', logoText: 'BOU' },
  { id: 18, name: 'Leicester', shortName: 'LEI', primaryColor: '#003090', secondaryColor: '#FDBE11', stadium: 'King Power Stadium', founded: 1884, manager: 'Steve Cooper', logoText: 'LEI' },
  { id: 19, name: 'Ipswich', shortName: 'IPS', primaryColor: '#0044AA', secondaryColor: '#FFFFFF', stadium: 'Portman Road', founded: 1878, manager: 'Kieran McKenna', logoText: 'IPS' },
  { id: 20, name: 'Southampton', shortName: 'SOU', primaryColor: '#D71920', secondaryColor: '#130C0E', stadium: "St. Mary's Stadium", founded: 1885, manager: 'Russell Martin', logoText: 'SOU' },
];

function getTeam(id: number): Team {
  return TEAMS.find(t => t.id === id)!;
}

// Matchweek data for each team (15 matchweeks)
// Format: [mw, homeId, awayId, homeGoals, awayGoals, homePos, awayPos, homeShots, awayShots, homeSOT, awaySOT, homePasses, awayPasses, homePA, awayPA]
type FixtureRaw = {
  id: number;
  mw: number;
  home: number;
  away: number;
  hg: number;
  ag: number;
  hPos: number;
  aPos: number;
  hShots: number;
  aShots: number;
  hSOT: number;
  aSOT: number;
  hPasses: number;
  aPasses: number;
  hPA: number;
  aPA: number;
};

export const FIXTURES_RAW: FixtureRaw[] = [
  // Week 1
  { id: 1, mw: 1, home: 1, away: 5, hg: 2, ag: 0, hPos: 59, aPos: 41, hShots: 18, aShots: 7, hSOT: 7, aSOT: 2, hPasses: 612, aPasses: 431, hPA: 87, aPA: 79 },
  { id: 2, mw: 1, home: 3, away: 6, hg: 4, ag: 0, hPos: 68, aPos: 32, hShots: 22, aShots: 5, hSOT: 9, aSOT: 1, hPasses: 714, aPasses: 334, hPA: 92, aPA: 78 },
  { id: 3, mw: 1, home: 4, away: 2, hg: 2, ag: 1, hPos: 57, aPos: 43, hShots: 16, aShots: 11, hSOT: 6, aSOT: 4, hPasses: 581, aPasses: 447, hPA: 84, aPA: 81 },
  { id: 4, mw: 1, home: 7, away: 8, hg: 0, ag: 1, hPos: 49, aPos: 51, hShots: 12, aShots: 15, hSOT: 3, aSOT: 5, hPasses: 456, aPasses: 502, hPA: 80, aPA: 83 },
  { id: 5, mw: 1, home: 9, away: 10, hg: 3, ag: 1, hPos: 58, aPos: 42, hShots: 17, aShots: 10, hSOT: 7, aSOT: 3, hPasses: 584, aPasses: 421, hPA: 85, aPA: 77 },
  // Week 2
  { id: 6, mw: 2, home: 2, away: 3, hg: 1, ag: 2, hPos: 38, aPos: 62, hShots: 9, aShots: 19, hSOT: 4, aSOT: 8, hPasses: 394, aPasses: 652, hPA: 77, aPA: 90 },
  { id: 7, mw: 2, home: 5, away: 4, hg: 0, ag: 3, hPos: 42, aPos: 58, hShots: 8, aShots: 17, hSOT: 2, aSOT: 7, hPasses: 412, aPasses: 591, hPA: 78, aPA: 85 },
  { id: 8, mw: 2, home: 6, away: 1, hg: 1, ag: 2, hPos: 44, aPos: 56, hShots: 11, aShots: 14, hSOT: 4, aSOT: 6, hPasses: 448, aPasses: 568, hPA: 79, aPA: 86 },
  { id: 9, mw: 2, home: 8, away: 7, hg: 2, ag: 0, hPos: 54, aPos: 46, hShots: 15, aShots: 10, hSOT: 6, aSOT: 3, hPasses: 542, aPasses: 468, hPA: 84, aPA: 80 },
  { id: 10, mw: 2, home: 10, away: 9, hg: 1, ag: 2, hPos: 40, aPos: 60, hShots: 10, aShots: 16, hSOT: 3, aSOT: 6, hPasses: 401, aPasses: 589, hPA: 74, aPA: 84 },
  // Week 3
  { id: 11, mw: 3, home: 1, away: 3, hg: 1, ag: 2, hPos: 43, aPos: 57, hShots: 12, aShots: 18, hSOT: 4, aSOT: 7, hPasses: 445, aPasses: 612, hPA: 82, aPA: 89 },
  { id: 12, mw: 3, home: 4, away: 6, hg: 3, ag: 0, hPos: 61, aPos: 39, hShots: 20, aShots: 7, hSOT: 8, aSOT: 2, hPasses: 615, aPasses: 388, hPA: 87, aPA: 78 },
  { id: 13, mw: 3, home: 2, away: 8, hg: 2, ag: 2, hPos: 50, aPos: 50, hShots: 13, aShots: 14, hSOT: 5, aSOT: 5, hPasses: 511, aPasses: 502, hPA: 82, aPA: 84 },
  { id: 14, mw: 3, home: 7, away: 5, hg: 2, ag: 1, hPos: 52, aPos: 48, hShots: 14, aShots: 12, hSOT: 5, aSOT: 4, hPasses: 478, aPasses: 443, hPA: 82, aPA: 78 },
  { id: 15, mw: 3, home: 9, away: 11, hg: 2, ag: 0, hPos: 59, aPos: 41, hShots: 15, aShots: 9, hSOT: 6, aSOT: 2, hPasses: 571, aPasses: 398, hPA: 85, aPA: 77 },
  // Week 4
  { id: 16, mw: 4, home: 3, away: 4, hg: 2, ag: 1, hPos: 64, aPos: 36, hShots: 21, aShots: 10, hSOT: 8, aSOT: 4, hPasses: 681, aPasses: 374, hPA: 91, aPA: 84 },
  { id: 17, mw: 4, home: 1, away: 9, hg: 3, ag: 1, hPos: 60, aPos: 40, hShots: 18, aShots: 11, hSOT: 7, aSOT: 4, hPasses: 598, aPasses: 412, hPA: 88, aPA: 83 },
  { id: 18, mw: 4, home: 8, away: 2, hg: 1, ag: 0, hPos: 55, aPos: 45, hShots: 13, aShots: 11, hSOT: 4, aSOT: 3, hPasses: 535, aPasses: 442, hPA: 84, aPA: 82 },
  { id: 19, mw: 4, home: 6, away: 7, hg: 1, ag: 1, hPos: 47, aPos: 53, hShots: 11, aShots: 13, hSOT: 4, aSOT: 5, hPasses: 456, aPasses: 501, hPA: 79, aPA: 81 },
  { id: 20, mw: 4, home: 5, away: 10, hg: 1, ag: 0, hPos: 53, aPos: 47, hShots: 14, aShots: 10, hSOT: 5, aSOT: 3, hPasses: 512, aPasses: 453, hPA: 80, aPA: 77 },
  // Week 5
  { id: 21, mw: 5, home: 4, away: 1, hg: 0, ag: 1, hPos: 55, aPos: 45, hShots: 14, aShots: 16, hSOT: 5, aSOT: 6, hPasses: 559, aPasses: 470, hPA: 84, aPA: 86 },
  { id: 22, mw: 5, home: 3, away: 8, hg: 3, ag: 0, hPos: 67, aPos: 33, hShots: 22, aShots: 8, hSOT: 9, aSOT: 2, hPasses: 698, aPasses: 342, hPA: 92, aPA: 79 },
  { id: 23, mw: 5, home: 2, away: 6, hg: 2, ag: 0, hPos: 52, aPos: 48, hShots: 14, aShots: 10, hSOT: 6, aSOT: 3, hPasses: 524, aPasses: 482, hPA: 82, aPA: 79 },
  { id: 24, mw: 5, home: 7, away: 9, hg: 1, ag: 2, hPos: 46, aPos: 54, hShots: 10, aShots: 15, hSOT: 3, aSOT: 6, hPasses: 451, aPasses: 542, hPA: 79, aPA: 84 },
  { id: 25, mw: 5, home: 10, away: 5, hg: 0, ag: 2, hPos: 41, aPos: 59, hShots: 8, aShots: 15, hSOT: 2, aSOT: 6, hPasses: 408, aPasses: 584, hPA: 73, aPA: 79 },
  // Week 6
  { id: 26, mw: 6, home: 1, away: 7, hg: 4, ag: 0, hPos: 62, aPos: 38, hShots: 20, aShots: 6, hSOT: 9, aSOT: 1, hPasses: 622, aPasses: 378, hPA: 89, aPA: 76 },
  { id: 27, mw: 6, home: 9, away: 3, hg: 0, ag: 2, hPos: 37, aPos: 63, hShots: 9, aShots: 18, hSOT: 2, aSOT: 7, hPasses: 375, aPasses: 642, hPA: 80, aPA: 90 },
  { id: 28, mw: 6, home: 6, away: 4, hg: 2, ag: 3, hPos: 43, aPos: 57, hShots: 11, aShots: 17, hSOT: 5, aSOT: 8, hPasses: 433, aPasses: 572, hPA: 78, aPA: 86 },
  { id: 29, mw: 6, home: 8, away: 5, hg: 3, ag: 1, hPos: 57, aPos: 43, hShots: 16, aShots: 11, hSOT: 7, aSOT: 4, hPasses: 562, aPasses: 432, hPA: 85, aPA: 79 },
  { id: 30, mw: 6, home: 2, away: 10, hg: 3, ag: 0, hPos: 56, aPos: 44, hShots: 16, aShots: 9, hSOT: 7, aSOT: 2, hPasses: 554, aPasses: 432, hPA: 84, aPA: 75 },
  // Week 7
  { id: 31, mw: 7, home: 3, away: 1, hg: 1, ag: 1, hPos: 65, aPos: 35, hShots: 19, aShots: 10, hSOT: 6, aSOT: 4, hPasses: 678, aPasses: 351, hPA: 91, aPA: 83 },
  { id: 32, mw: 7, home: 4, away: 7, hg: 2, ag: 0, hPos: 59, aPos: 41, hShots: 17, aShots: 8, hSOT: 7, aSOT: 2, hPasses: 592, aPasses: 412, hPA: 86, aPA: 80 },
  { id: 33, mw: 7, home: 5, away: 6, hg: 0, ag: 3, hPos: 44, aPos: 56, hShots: 9, aShots: 16, hSOT: 3, aSOT: 7, hPasses: 438, aPasses: 548, hPA: 78, aPA: 81 },
  { id: 34, mw: 7, home: 8, away: 9, hg: 2, ag: 1, hPos: 54, aPos: 46, hShots: 15, aShots: 12, hSOT: 6, aSOT: 4, hPasses: 534, aPasses: 468, hPA: 84, aPA: 82 },
  { id: 35, mw: 7, home: 10, away: 2, hg: 1, ag: 2, hPos: 42, aPos: 58, hShots: 11, aShots: 15, hSOT: 4, aSOT: 6, hPasses: 418, aPasses: 571, hPA: 74, aPA: 84 },
  // Week 8
  { id: 36, mw: 8, home: 1, away: 4, hg: 2, ag: 2, hPos: 52, aPos: 48, hShots: 15, aShots: 14, hSOT: 5, aSOT: 5, hPasses: 531, aPasses: 489, hPA: 85, aPA: 83 },
  { id: 37, mw: 8, home: 6, away: 3, hg: 0, ag: 2, hPos: 36, aPos: 64, hShots: 8, aShots: 20, hSOT: 2, aSOT: 8, hPasses: 363, aPasses: 654, hPA: 77, aPA: 91 },
  { id: 38, mw: 8, home: 7, away: 2, hg: 3, ag: 1, hPos: 51, aPos: 49, hShots: 15, aShots: 12, hSOT: 6, aSOT: 4, hPasses: 498, aPasses: 479, hPA: 81, aPA: 82 },
  { id: 39, mw: 8, home: 9, away: 8, hg: 1, ag: 1, hPos: 55, aPos: 45, hShots: 12, aShots: 11, hSOT: 4, aSOT: 4, hPasses: 548, aPasses: 449, hPA: 84, aPA: 82 },
  { id: 40, mw: 8, home: 5, away: 10, hg: 2, ag: 0, hPos: 55, aPos: 45, hShots: 15, aShots: 8, hSOT: 6, aSOT: 2, hPasses: 541, aPasses: 441, hPA: 81, aPA: 75 },
  // Week 9
  { id: 41, mw: 9, home: 3, away: 9, hg: 3, ag: 1, hPos: 66, aPos: 34, hShots: 20, aShots: 9, hSOT: 8, aSOT: 3, hPasses: 692, aPasses: 346, hPA: 91, aPA: 82 },
  { id: 42, mw: 9, home: 4, away: 5, hg: 2, ag: 0, hPos: 58, aPos: 42, hShots: 16, aShots: 9, hSOT: 7, aSOT: 3, hPasses: 574, aPasses: 421, hPA: 86, aPA: 78 },
  { id: 43, mw: 9, home: 1, away: 2, hg: 3, ag: 1, hPos: 60, aPos: 40, hShots: 18, aShots: 10, hSOT: 8, aSOT: 4, hPasses: 598, aPasses: 405, hPA: 88, aPA: 81 },
  { id: 44, mw: 9, home: 7, away: 6, hg: 2, ag: 2, hPos: 50, aPos: 50, hShots: 13, aShots: 14, hSOT: 5, aSOT: 5, hPasses: 489, aPasses: 491, hPA: 81, aPA: 80 },
  { id: 45, mw: 9, home: 10, away: 8, hg: 1, ag: 3, hPos: 40, aPos: 60, hShots: 9, aShots: 17, hSOT: 3, aSOT: 7, hPasses: 394, aPasses: 593, hPA: 73, aPA: 85 },
  // Week 10
  { id: 46, mw: 10, home: 1, away: 6, hg: 2, ag: 1, hPos: 58, aPos: 42, hShots: 17, aShots: 10, hSOT: 7, aSOT: 4, hPasses: 577, aPasses: 418, hPA: 87, aPA: 79 },
  { id: 47, mw: 10, home: 3, away: 5, hg: 3, ag: 0, hPos: 66, aPos: 34, hShots: 21, aShots: 7, hSOT: 9, aSOT: 2, hPasses: 688, aPasses: 346, hPA: 92, aPA: 77 },
  { id: 48, mw: 10, home: 4, away: 2, hg: 1, ag: 1, hPos: 57, aPos: 43, hShots: 13, aShots: 12, hSOT: 5, aSOT: 4, hPasses: 571, aPasses: 428, hPA: 85, aPA: 82 },
  { id: 49, mw: 10, home: 9, away: 7, hg: 3, ag: 0, hPos: 57, aPos: 43, hShots: 17, aShots: 9, hSOT: 7, aSOT: 2, hPasses: 567, aPasses: 427, hPA: 85, aPA: 79 },
  { id: 50, mw: 10, home: 8, away: 10, hg: 4, ag: 1, hPos: 58, aPos: 42, hShots: 18, aShots: 9, hSOT: 8, aSOT: 3, hPasses: 571, aPasses: 416, hPA: 85, aPA: 76 },
  // Week 11
  { id: 51, mw: 11, home: 5, away: 1, hg: 1, ag: 2, hPos: 45, aPos: 55, hShots: 11, aShots: 15, hSOT: 4, aSOT: 6, hPasses: 445, aPasses: 548, hPA: 79, aPA: 86 },
  { id: 52, mw: 11, home: 4, away: 3, hg: 1, ag: 2, hPos: 46, aPos: 54, hShots: 12, aShots: 19, hSOT: 4, aSOT: 8, hPasses: 463, aPasses: 578, hPA: 83, aPA: 90 },
  { id: 53, mw: 11, home: 6, away: 8, hg: 2, ag: 2, hPos: 48, aPos: 52, hShots: 13, aShots: 14, hSOT: 5, aSOT: 5, hPasses: 479, aPasses: 516, hPA: 80, aPA: 84 },
  { id: 54, mw: 11, home: 2, away: 7, hg: 2, ag: 1, hPos: 54, aPos: 46, hShots: 14, aShots: 11, hSOT: 6, aSOT: 4, hPasses: 538, aPasses: 459, hPA: 83, aPA: 80 },
  { id: 55, mw: 11, home: 10, away: 9, hg: 0, ag: 2, hPos: 39, aPos: 61, hShots: 8, aShots: 16, hSOT: 2, aSOT: 6, hPasses: 384, aPasses: 601, hPA: 72, aPA: 85 },
  // Week 12
  { id: 56, mw: 12, home: 3, away: 7, hg: 5, ag: 0, hPos: 68, aPos: 32, hShots: 24, aShots: 6, hSOT: 11, aSOT: 1, hPasses: 714, aPasses: 328, hPA: 92, aPA: 76 },
  { id: 57, mw: 12, home: 1, away: 8, hg: 2, ag: 1, hPos: 58, aPos: 42, hShots: 16, aShots: 11, hSOT: 6, aSOT: 4, hPasses: 579, aPasses: 421, hPA: 87, aPA: 82 },
  { id: 58, mw: 12, home: 4, away: 9, hg: 3, ag: 0, hPos: 59, aPos: 41, hShots: 18, aShots: 10, hSOT: 7, aSOT: 3, hPasses: 589, aPasses: 405, hPA: 86, aPA: 83 },
  { id: 59, mw: 12, home: 2, away: 5, hg: 1, ag: 0, hPos: 52, aPos: 48, hShots: 13, aShots: 10, hSOT: 5, aSOT: 3, hPasses: 519, aPasses: 479, hPA: 83, aPA: 79 },
  { id: 60, mw: 12, home: 6, away: 10, hg: 3, ag: 1, hPos: 51, aPos: 49, hShots: 15, aShots: 11, hSOT: 6, aSOT: 4, hPasses: 508, aPasses: 487, hPA: 80, aPA: 77 },
  // Week 13
  { id: 61, mw: 13, home: 8, away: 3, hg: 1, ag: 2, hPos: 38, aPos: 62, hShots: 10, aShots: 19, hSOT: 3, aSOT: 8, hPasses: 381, aPasses: 641, hPA: 77, aPA: 90 },
  { id: 62, mw: 13, home: 7, away: 1, hg: 0, ag: 3, hPos: 42, aPos: 58, hShots: 8, aShots: 18, hSOT: 2, aSOT: 7, hPasses: 416, aPasses: 581, hPA: 78, aPA: 87 },
  { id: 63, mw: 13, home: 9, away: 4, hg: 1, ag: 2, hPos: 44, aPos: 56, hShots: 11, aShots: 15, hSOT: 4, aSOT: 6, hPasses: 440, aPasses: 561, hPA: 81, aPA: 85 },
  { id: 64, mw: 13, home: 5, away: 2, hg: 0, ag: 1, hPos: 47, aPos: 53, hShots: 10, aShots: 14, hSOT: 3, aSOT: 6, hPasses: 463, aPasses: 524, hPA: 79, aPA: 84 },
  { id: 65, mw: 13, home: 6, away: 11, hg: 2, ag: 0, hPos: 51, aPos: 49, hShots: 14, aShots: 10, hSOT: 6, aSOT: 3, hPasses: 508, aPasses: 487, hPA: 80, aPA: 77 },
  // Week 14
  { id: 66, mw: 14, home: 4, away: 8, hg: 3, ag: 2, hPos: 58, aPos: 42, hShots: 17, aShots: 14, hSOT: 7, aSOT: 5, hPasses: 578, aPasses: 421, hPA: 85, aPA: 83 },
  { id: 67, mw: 14, home: 3, away: 2, hg: 2, ag: 0, hPos: 65, aPos: 35, hShots: 19, aShots: 8, hSOT: 8, aSOT: 2, hPasses: 674, aPasses: 356, hPA: 91, aPA: 81 },
  { id: 68, mw: 14, home: 1, away: 10, hg: 3, ag: 0, hPos: 61, aPos: 39, hShots: 18, aShots: 7, hSOT: 8, aSOT: 2, hPasses: 604, aPasses: 387, hPA: 88, aPA: 74 },
  { id: 69, mw: 14, home: 7, away: 9, hg: 1, ag: 2, hPos: 47, aPos: 53, hShots: 11, aShots: 14, hSOT: 4, aSOT: 6, hPasses: 463, aPasses: 521, hPA: 80, aPA: 84 },
  { id: 70, mw: 14, home: 6, away: 5, hg: 2, ag: 1, hPos: 49, aPos: 51, hShots: 13, aShots: 12, hSOT: 5, aSOT: 4, hPasses: 487, aPasses: 504, hPA: 79, aPA: 79 },
  // Week 15
  { id: 71, mw: 15, home: 5, away: 3, hg: 0, ag: 4, hPos: 33, aPos: 67, hShots: 7, aShots: 22, hSOT: 2, aSOT: 9, hPasses: 335, aPasses: 672, hPA: 75, aPA: 91 },
  { id: 72, mw: 15, home: 2, away: 1, hg: 0, ag: 2, hPos: 44, aPos: 56, hShots: 9, aShots: 16, hSOT: 3, aSOT: 7, hPasses: 436, aPasses: 556, hPA: 80, aPA: 87 },
  { id: 73, mw: 15, home: 8, away: 4, hg: 2, ag: 3, hPos: 47, aPos: 53, hShots: 13, aShots: 17, hSOT: 5, aSOT: 7, hPasses: 469, aPasses: 529, hPA: 82, aPA: 85 },
  { id: 74, mw: 15, home: 9, away: 6, hg: 3, ag: 1, hPos: 58, aPos: 42, hShots: 17, aShots: 10, hSOT: 7, aSOT: 4, hPasses: 574, aPasses: 416, hPA: 85, aPA: 79 },
  { id: 75, mw: 15, home: 10, away: 7, hg: 2, ag: 2, hPos: 43, aPos: 57, hShots: 12, aShots: 15, hSOT: 4, aSOT: 6, hPasses: 427, aPasses: 564, hPA: 74, aPA: 83 },
];

export function getFixtures(): Fixture[] {
  return FIXTURES_RAW.map(f => ({
    id: f.id,
    matchweek: f.mw,
    date: `2024-${String(8 + Math.floor((f.mw - 1) / 4)).padStart(2, '0')}-${String(10 + ((f.id * 7) % 18)).padStart(2, '0')}`,
    homeTeam: getTeam(f.home),
    awayTeam: getTeam(f.away),
    homeGoals: f.hg,
    awayGoals: f.ag,
    played: true,
    homeStats: {
      teamId: f.home,
      possession: f.hPos,
      shots: f.hShots,
      shotsOnTarget: f.hSOT,
      passes: f.hPasses,
      passAccuracy: f.hPA,
      fouls: Math.floor(Math.random() * 8) + 8,
      yellowCards: Math.floor(Math.random() * 3),
      redCards: 0,
      corners: Math.floor(Math.random() * 7) + 3,
      offsides: Math.floor(Math.random() * 4) + 1,
    },
    awayStats: {
      teamId: f.away,
      possession: f.aPos,
      shots: f.aShots,
      shotsOnTarget: f.aSOT,
      passes: f.aPasses,
      passAccuracy: f.aPA,
      fouls: Math.floor(Math.random() * 8) + 8,
      yellowCards: Math.floor(Math.random() * 3),
      redCards: 0,
      corners: Math.floor(Math.random() * 7) + 3,
      offsides: Math.floor(Math.random() * 4) + 1,
    },
  }));
}

export function getTeamMatchweeks(teamId: number): MatchweekData[] {
  const fixtures = getFixtures();
  const teamFixtures = fixtures.filter(
    f => (f.homeTeam.id === teamId || f.awayTeam.id === teamId) && f.played
  );

  return teamFixtures.map(f => {
    const isHome = f.homeTeam.id === teamId;
    const myGoals = isHome ? f.homeGoals : f.awayGoals;
    const oppGoals = isHome ? f.awayGoals : f.homeGoals;
    const myStats = isHome ? f.homeStats! : f.awayStats!;
    const opponent = isHome ? f.awayTeam : f.homeTeam;
    const result: 'W' | 'D' | 'L' = myGoals > oppGoals ? 'W' : myGoals === oppGoals ? 'D' : 'L';

    return {
      matchweek: f.matchweek,
      goalsScored: myGoals,
      goalsConceded: oppGoals,
      possession: myStats.possession,
      shots: myStats.shots,
      shotsOnTarget: myStats.shotsOnTarget,
      passes: myStats.passes,
      passAccuracy: myStats.passAccuracy,
      result,
      opponent: opponent.shortName,
      opponentColor: opponent.primaryColor,
      homeAway: (isHome ? 'H' : 'A') as 'H' | 'A',
    };
  }).sort((a, b) => a.matchweek - b.matchweek);
}

export function getTeamSeasonStats(teamId: number): TeamSeasonStats {
  const mws = getTeamMatchweeks(teamId);
  const wins = mws.filter(m => m.result === 'W').length;
  const draws = mws.filter(m => m.result === 'D').length;
  const losses = mws.filter(m => m.result === 'L').length;
  const goalsScored = mws.reduce((s, m) => s + m.goalsScored, 0);
  const goalsConceded = mws.reduce((s, m) => s + m.goalsConceded, 0);
  const cleanSheets = mws.filter(m => m.goalsConceded === 0).length;
  const avgPossession = mws.length ? mws.reduce((s, m) => s + m.possession, 0) / mws.length : 0;
  const avgPassAccuracy = mws.length ? mws.reduce((s, m) => s + m.passAccuracy, 0) / mws.length : 0;
  const avgShots = mws.length ? mws.reduce((s, m) => s + m.shots, 0) / mws.length : 0;
  const avgSOT = mws.length ? mws.reduce((s, m) => s + m.shotsOnTarget, 0) / mws.length : 0;

  return {
    teamId,
    matches: mws.length,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    cleanSheets,
    avgPossession: Math.round(avgPossession * 10) / 10,
    avgPassAccuracy: Math.round(avgPassAccuracy * 10) / 10,
    avgShotsPerGame: Math.round(avgShots * 10) / 10,
    avgShotsOnTargetPerGame: Math.round(avgSOT * 10) / 10,
    points: wins * 3 + draws,
  };
}

// Players mock data
export const PLAYERS: PlayerWithStats[] = [
  // Arsenal (id: 1)
  {
    id: 1, name: 'Bukayo Saka', position: 'FWD', teamId: 1, age: 23, nationality: 'England', number: 7,
    totalGoals: 9, totalAssists: 7, averageRating: 8.2,
    stats: [
      { matchweek: 1, goals: 1, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 45, passAccuracy: 89, rating: 8.5, yellowCard: false, redCard: false },
      { matchweek: 2, goals: 0, assists: 1, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 42, passAccuracy: 86, rating: 7.8, yellowCard: false, redCard: false },
      { matchweek: 3, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 2, passes: 38, passAccuracy: 84, rating: 7.9, yellowCard: false, redCard: false },
      { matchweek: 4, goals: 2, assists: 0, minutesPlayed: 90, shots: 6, shotsOnTarget: 3, passes: 41, passAccuracy: 87, rating: 8.8, yellowCard: false, redCard: false },
      { matchweek: 5, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 44, passAccuracy: 88, rating: 7.6, yellowCard: true, redCard: false },
      { matchweek: 6, goals: 1, assists: 1, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 47, passAccuracy: 91, rating: 8.7, yellowCard: false, redCard: false },
      { matchweek: 7, goals: 0, assists: 0, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 39, passAccuracy: 85, rating: 7.2, yellowCard: false, redCard: false },
      { matchweek: 8, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 43, passAccuracy: 88, rating: 7.5, yellowCard: false, redCard: false },
      { matchweek: 9, goals: 1, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 46, passAccuracy: 89, rating: 8.4, yellowCard: false, redCard: false },
      { matchweek: 10, goals: 0, assists: 0, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 42, passAccuracy: 86, rating: 7.4, yellowCard: false, redCard: false },
      { matchweek: 11, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 44, passAccuracy: 88, rating: 8.1, yellowCard: false, redCard: false },
      { matchweek: 12, goals: 0, assists: 1, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 45, passAccuracy: 89, rating: 7.7, yellowCard: false, redCard: false },
      { matchweek: 13, goals: 1, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 48, passAccuracy: 90, rating: 8.6, yellowCard: false, redCard: false },
      { matchweek: 14, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 2, passes: 43, passAccuracy: 87, rating: 8.2, yellowCard: false, redCard: false },
      { matchweek: 15, goals: 1, assists: 0, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 41, passAccuracy: 87, rating: 8.0, yellowCard: false, redCard: false },
    ],
  },
  {
    id: 2, name: 'Leandro Trossard', position: 'MID', teamId: 1, age: 29, nationality: 'Belgium', number: 19,
    totalGoals: 6, totalAssists: 4, averageRating: 7.6,
    stats: [
      { matchweek: 1, goals: 1, assists: 0, minutesPlayed: 90, shots: 3, shotsOnTarget: 2, passes: 52, passAccuracy: 88, rating: 7.9, yellowCard: false, redCard: false },
      { matchweek: 2, goals: 0, assists: 1, minutesPlayed: 78, shots: 2, shotsOnTarget: 0, passes: 41, passAccuracy: 83, rating: 7.3, yellowCard: false, redCard: false },
      { matchweek: 3, goals: 0, assists: 0, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 54, passAccuracy: 86, rating: 7.1, yellowCard: false, redCard: false },
      { matchweek: 4, goals: 1, assists: 1, minutesPlayed: 90, shots: 3, shotsOnTarget: 2, passes: 56, passAccuracy: 87, rating: 8.2, yellowCard: false, redCard: false },
      { matchweek: 5, goals: 0, assists: 0, minutesPlayed: 90, shots: 1, shotsOnTarget: 0, passes: 49, passAccuracy: 84, rating: 6.9, yellowCard: false, redCard: false },
      { matchweek: 6, goals: 1, assists: 0, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 53, passAccuracy: 89, rating: 8.0, yellowCard: false, redCard: false },
      { matchweek: 7, goals: 0, assists: 0, minutesPlayed: 65, shots: 1, shotsOnTarget: 0, passes: 34, passAccuracy: 82, rating: 6.8, yellowCard: false, redCard: false },
      { matchweek: 8, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 51, passAccuracy: 87, rating: 7.5, yellowCard: false, redCard: false },
      { matchweek: 9, goals: 1, assists: 0, minutesPlayed: 90, shots: 4, shotsOnTarget: 3, passes: 54, passAccuracy: 88, rating: 8.1, yellowCard: false, redCard: false },
      { matchweek: 10, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 52, passAccuracy: 87, rating: 7.6, yellowCard: false, redCard: false },
      { matchweek: 11, goals: 1, assists: 0, minutesPlayed: 90, shots: 3, shotsOnTarget: 2, passes: 55, passAccuracy: 88, rating: 7.9, yellowCard: false, redCard: false },
      { matchweek: 12, goals: 0, assists: 0, minutesPlayed: 80, shots: 2, shotsOnTarget: 0, passes: 44, passAccuracy: 84, rating: 7.0, yellowCard: false, redCard: false },
      { matchweek: 13, goals: 1, assists: 0, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 53, passAccuracy: 88, rating: 8.0, yellowCard: false, redCard: false },
      { matchweek: 14, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 55, passAccuracy: 89, rating: 7.6, yellowCard: false, redCard: false },
      { matchweek: 15, goals: 1, assists: 0, minutesPlayed: 90, shots: 3, shotsOnTarget: 2, passes: 50, passAccuracy: 87, rating: 7.9, yellowCard: false, redCard: false },
    ],
  },
  // Manchester City (id: 3)
  {
    id: 3, name: 'Erling Haaland', position: 'FWD', teamId: 3, age: 24, nationality: 'Norway', number: 9,
    totalGoals: 16, totalAssists: 4, averageRating: 8.6,
    stats: [
      { matchweek: 1, goals: 2, assists: 0, minutesPlayed: 90, shots: 7, shotsOnTarget: 4, passes: 22, passAccuracy: 72, rating: 9.1, yellowCard: false, redCard: false },
      { matchweek: 2, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 19, passAccuracy: 68, rating: 8.2, yellowCard: false, redCard: false },
      { matchweek: 3, goals: 1, assists: 1, minutesPlayed: 90, shots: 6, shotsOnTarget: 3, passes: 21, passAccuracy: 71, rating: 8.5, yellowCard: false, redCard: false },
      { matchweek: 4, goals: 1, assists: 1, minutesPlayed: 90, shots: 8, shotsOnTarget: 4, passes: 23, passAccuracy: 74, rating: 8.8, yellowCard: false, redCard: false },
      { matchweek: 5, goals: 2, assists: 0, minutesPlayed: 90, shots: 9, shotsOnTarget: 5, passes: 20, passAccuracy: 70, rating: 9.2, yellowCard: false, redCard: false },
      { matchweek: 6, goals: 1, assists: 0, minutesPlayed: 90, shots: 6, shotsOnTarget: 3, passes: 18, passAccuracy: 67, rating: 8.3, yellowCard: false, redCard: false },
      { matchweek: 7, goals: 0, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 1, passes: 24, passAccuracy: 75, rating: 7.6, yellowCard: false, redCard: false },
      { matchweek: 8, goals: 1, assists: 0, minutesPlayed: 90, shots: 7, shotsOnTarget: 4, passes: 21, passAccuracy: 71, rating: 8.4, yellowCard: false, redCard: false },
      { matchweek: 9, goals: 2, assists: 1, minutesPlayed: 90, shots: 8, shotsOnTarget: 5, passes: 22, passAccuracy: 73, rating: 9.3, yellowCard: false, redCard: false },
      { matchweek: 10, goals: 1, assists: 0, minutesPlayed: 90, shots: 6, shotsOnTarget: 3, passes: 20, passAccuracy: 70, rating: 8.2, yellowCard: false, redCard: false },
      { matchweek: 11, goals: 1, assists: 0, minutesPlayed: 90, shots: 7, shotsOnTarget: 4, passes: 19, passAccuracy: 68, rating: 8.5, yellowCard: false, redCard: false },
      { matchweek: 12, goals: 0, assists: 1, minutesPlayed: 90, shots: 5, shotsOnTarget: 2, passes: 25, passAccuracy: 76, rating: 7.8, yellowCard: false, redCard: false },
      { matchweek: 13, goals: 1, assists: 0, minutesPlayed: 90, shots: 6, shotsOnTarget: 3, passes: 21, passAccuracy: 71, rating: 8.3, yellowCard: false, redCard: false },
      { matchweek: 14, goals: 1, assists: 0, minutesPlayed: 90, shots: 7, shotsOnTarget: 4, passes: 22, passAccuracy: 72, rating: 8.6, yellowCard: false, redCard: false },
      { matchweek: 15, goals: 2, assists: 0, minutesPlayed: 90, shots: 9, shotsOnTarget: 5, passes: 20, passAccuracy: 70, rating: 9.0, yellowCard: false, redCard: false },
    ],
  },
  // Liverpool (id: 4)
  {
    id: 4, name: 'Mohamed Salah', position: 'FWD', teamId: 4, age: 32, nationality: 'Egypt', number: 11,
    totalGoals: 14, totalAssists: 10, averageRating: 8.5,
    stats: [
      { matchweek: 1, goals: 1, assists: 2, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 48, passAccuracy: 87, rating: 9.0, yellowCard: false, redCard: false },
      { matchweek: 2, goals: 2, assists: 0, minutesPlayed: 90, shots: 6, shotsOnTarget: 4, passes: 44, passAccuracy: 84, rating: 9.1, yellowCard: false, redCard: false },
      { matchweek: 3, goals: 1, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 46, passAccuracy: 86, rating: 8.6, yellowCard: false, redCard: false },
      { matchweek: 4, goals: 0, assists: 1, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 50, passAccuracy: 88, rating: 7.8, yellowCard: false, redCard: false },
      { matchweek: 5, goals: 0, assists: 0, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 47, passAccuracy: 85, rating: 7.3, yellowCard: false, redCard: false },
      { matchweek: 6, goals: 2, assists: 1, minutesPlayed: 90, shots: 7, shotsOnTarget: 4, passes: 49, passAccuracy: 88, rating: 9.4, yellowCard: false, redCard: false },
      { matchweek: 7, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 2, passes: 43, passAccuracy: 84, rating: 8.1, yellowCard: false, redCard: false },
      { matchweek: 8, goals: 1, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 46, passAccuracy: 86, rating: 8.4, yellowCard: false, redCard: false },
      { matchweek: 9, goals: 0, assists: 1, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 50, passAccuracy: 87, rating: 7.6, yellowCard: false, redCard: false },
      { matchweek: 10, goals: 0, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 48, passAccuracy: 87, rating: 7.9, yellowCard: false, redCard: false },
      { matchweek: 11, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 44, passAccuracy: 85, rating: 8.2, yellowCard: false, redCard: false },
      { matchweek: 12, goals: 1, assists: 1, minutesPlayed: 90, shots: 5, shotsOnTarget: 2, passes: 47, passAccuracy: 87, rating: 8.5, yellowCard: false, redCard: false },
      { matchweek: 13, goals: 2, assists: 0, minutesPlayed: 90, shots: 7, shotsOnTarget: 4, passes: 46, passAccuracy: 86, rating: 9.0, yellowCard: false, redCard: false },
      { matchweek: 14, goals: 1, assists: 1, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 50, passAccuracy: 88, rating: 8.7, yellowCard: false, redCard: false },
      { matchweek: 15, goals: 1, assists: 1, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 49, passAccuracy: 88, rating: 8.6, yellowCard: false, redCard: false },
    ],
  },
  // Chelsea (id: 2)
  {
    id: 5, name: 'Cole Palmer', position: 'MID', teamId: 2, age: 22, nationality: 'England', number: 20,
    totalGoals: 11, totalAssists: 8, averageRating: 8.3,
    stats: [
      { matchweek: 1, goals: 1, assists: 1, minutesPlayed: 90, shots: 5, shotsOnTarget: 2, passes: 62, passAccuracy: 88, rating: 8.5, yellowCard: false, redCard: false },
      { matchweek: 2, goals: 0, assists: 0, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 54, passAccuracy: 84, rating: 7.1, yellowCard: false, redCard: false },
      { matchweek: 3, goals: 1, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 64, passAccuracy: 89, rating: 8.6, yellowCard: false, redCard: false },
      { matchweek: 4, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 65, passAccuracy: 90, rating: 7.8, yellowCard: false, redCard: false },
      { matchweek: 5, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 60, passAccuracy: 87, rating: 8.2, yellowCard: false, redCard: false },
      { matchweek: 6, goals: 2, assists: 1, minutesPlayed: 90, shots: 6, shotsOnTarget: 4, passes: 63, passAccuracy: 88, rating: 9.1, yellowCard: false, redCard: false },
      { matchweek: 7, goals: 1, assists: 0, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 61, passAccuracy: 87, rating: 8.0, yellowCard: false, redCard: false },
      { matchweek: 8, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 63, passAccuracy: 89, rating: 7.5, yellowCard: false, redCard: false },
      { matchweek: 9, goals: 1, assists: 1, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 65, passAccuracy: 90, rating: 8.7, yellowCard: false, redCard: false },
      { matchweek: 10, goals: 0, assists: 1, minutesPlayed: 90, shots: 3, shotsOnTarget: 1, passes: 62, passAccuracy: 88, rating: 7.7, yellowCard: false, redCard: false },
      { matchweek: 11, goals: 1, assists: 0, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 63, passAccuracy: 88, rating: 8.1, yellowCard: false, redCard: false },
      { matchweek: 12, goals: 0, assists: 1, minutesPlayed: 90, shots: 2, shotsOnTarget: 1, passes: 64, passAccuracy: 89, rating: 7.6, yellowCard: false, redCard: false },
      { matchweek: 13, goals: 1, assists: 0, minutesPlayed: 90, shots: 5, shotsOnTarget: 3, passes: 63, passAccuracy: 88, rating: 8.3, yellowCard: false, redCard: false },
      { matchweek: 14, goals: 2, assists: 0, minutesPlayed: 90, shots: 6, shotsOnTarget: 4, passes: 61, passAccuracy: 87, rating: 9.0, yellowCard: false, redCard: false },
      { matchweek: 15, goals: 1, assists: 1, minutesPlayed: 90, shots: 4, shotsOnTarget: 2, passes: 62, passAccuracy: 88, rating: 8.4, yellowCard: false, redCard: false },
    ],
  },
];

export function getPlayersByTeam(teamId: number): PlayerWithStats[] {
  return PLAYERS.filter(p => p.teamId === teamId);
}

export function getLeagueTopScorers(): Array<{ player: PlayerWithStats; team: Team }> {
  return [...PLAYERS]
    .sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 10)
    .map(p => ({
      player: p,
      team: getTeam(p.teamId),
    }));
}

// Standings
export function getStandings() {
  return TEAMS.slice(0, 10).map(team => {
    const stats = getTeamSeasonStats(team.id);
    return { team, stats };
  }).sort((a, b) => b.stats.points - a.stats.points);
}
