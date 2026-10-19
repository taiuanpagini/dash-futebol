import { MatchweekData } from '@/types/football';
import { cn } from '@/lib/utils';

interface RecentMatchesTableProps {
  data: MatchweekData[];
}

function ResultBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  return (
    <span className={cn(
      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
      result === 'W' && 'bg-green-500/15 text-green-600 dark:text-green-400',
      result === 'D' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      result === 'L' && 'bg-red-500/15 text-red-500 dark:text-red-400',
    )}>
      {result}
    </span>
  );
}

export function RecentMatchesTable({ data }: RecentMatchesTableProps) {
  const recent = [...data].sort((a, b) => b.matchweek - a.matchweek).slice(0, 8);
  const form = data.slice(-5).map(d => d.result);

  return (
    <div data-wb-label="Tabela de Partidas Recentes" className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Últimas Partidas</h3>
          <p className="text-xs text-muted-foreground">Estatísticas por rodada</p>
        </div>
        {/* Form guide */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Forma:</span>
          {form.map((r, i) => (
            <span
              key={i}
              className={cn(
                'h-5 w-5 rounded text-xs font-bold flex items-center justify-center',
                r === 'W' && 'bg-green-500 text-white',
                r === 'D' && 'bg-amber-500 text-white',
                r === 'L' && 'bg-red-500 text-white',
              )}
            >
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">Rd</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">Adversário</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground uppercase tracking-wide">L/F</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground uppercase tracking-wide">Res</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground uppercase tracking-wide">Posse</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Chutes</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">No Alvo</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Precisão</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((match) => (
              <tr
                key={match.matchweek}
                className="border-b border-border/50 transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{match.matchweek}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: match.opponentColor }}
                    />
                    <span className="font-medium text-foreground">{match.opponent}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={cn(
                    'text-xs font-medium px-1.5 rounded',
                    match.homeAway === 'H' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  )}>
                    {match.homeAway === 'H' ? 'Casa' : 'Fora'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <ResultBadge result={match.result} />
                    <span className="font-bold text-foreground">
                      {match.goalsScored}–{match.goalsConceded}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${match.possession}%`, backgroundColor: '#8b5cf6' }}
                      />
                    </div>
                    <span className="font-medium text-foreground w-8">{match.possession}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center font-medium text-foreground hidden sm:table-cell">{match.shots}</td>
                <td className="px-4 py-2.5 text-center hidden md:table-cell">
                  <span className="font-medium text-amber-600 dark:text-amber-400">{match.shotsOnTarget}</span>
                </td>
                <td className="px-4 py-2.5 text-center font-medium text-foreground hidden md:table-cell">{match.passAccuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
