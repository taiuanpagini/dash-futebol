import { getLeagueTopScorers } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface TopScorersProps {
  selectedTeamId?: number;
}

export function TopScorers({ selectedTeamId }: TopScorersProps) {
  const scorers = getLeagueTopScorers();

  return (
    <div data-wb-label="Artilheiros da Liga" className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Artilheiros</h3>
        <p className="text-xs text-muted-foreground">Top jogadores da temporada</p>
      </div>
      <div className="p-3 space-y-2">
        {scorers.map(({ player, team }, idx) => {
          const maxGoals = scorers[0].player.totalGoals;
          const pct = (player.totalGoals / maxGoals) * 100;
          const isSelected = team.id === selectedTeamId;

          return (
            <div
              key={player.id}
              className={cn(
                'rounded-lg p-2.5 transition-all',
                isSelected ? 'bg-primary/8 ring-1 ring-primary/20' : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-5 text-xs font-mono text-muted-foreground text-right">{idx + 1}</span>
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{player.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{team.shortName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: team.primaryColor }}>{player.totalGoals}</p>
                  <p className="text-xs text-muted-foreground">{player.totalAssists}a</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-7">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: team.primaryColor }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  ★{player.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
