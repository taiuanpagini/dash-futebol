import { TEAMS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { getTeamSeasonStats } from '@/data/mockData';

interface SidebarProps {
  selectedTeamId: number;
  onSelectTeam: (id: number) => void;
}

export function Sidebar({ selectedTeamId, onSelectTeam }: SidebarProps) {
  const standings = TEAMS.slice(0, 10).map(team => ({
    team,
    stats: getTeamSeasonStats(team.id),
  })).sort((a, b) => b.stats.points - a.stats.points);

  return (
    <aside data-wb-label="Barra Lateral — Times" className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-20 rounded-xl border border-border bg-card p-3 shadow-sm">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Times — Top 10
        </p>
        <div className="space-y-0.5">
          {standings.map(({ team, stats }, idx) => (
            <button
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-all duration-150',
                selectedTeamId === team.id
                  ? 'bg-primary/10 text-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Position */}
              <span className="w-4 text-xs font-mono text-muted-foreground">{idx + 1}</span>
              {/* Color dot */}
              <span
                className="h-3 w-3 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: team.primaryColor }}
              />
              {/* Name */}
              <span className="flex-1 text-xs font-medium truncate">{team.shortName}</span>
              {/* Points */}
              <span className={cn(
                'text-xs font-bold',
                selectedTeamId === team.id ? 'text-primary' : 'text-foreground'
              )}>
                {stats.points}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 border-t border-border pt-3 px-2">
          <p className="text-xs text-muted-foreground text-center">PTS após 15 rodadas</p>
        </div>
      </div>
    </aside>
  );
}
