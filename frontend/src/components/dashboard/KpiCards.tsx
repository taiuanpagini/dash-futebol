import { Trophy, Target, Shield, Activity, TrendingUp, Crosshair } from 'lucide-react';
import { TeamSeasonStats, Team } from '@/types/football';
import { cn } from '@/lib/utils';

interface KpiCardsProps {
  stats: TeamSeasonStats;
  team: Team;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }: KpiCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      {trend && (
        <div className={cn(
          'absolute bottom-0 right-0 h-1 w-full opacity-20 rounded-b-xl',
          trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
        )} />
      )}
    </div>
  );
}

export function KpiCards({ stats, team }: KpiCardsProps) {
  const { primaryColor } = team;
  const goalDiff = stats.goalsScored - stats.goalsConceded;

  return (
    <div data-wb-label="Cards de KPI" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        label="Pontos"
        value={stats.points}
        sub={`${stats.matches} jogos`}
        icon={Trophy}
        color={primaryColor}
        trend="up"
      />
      <KpiCard
        label="V / E / D"
        value={`${stats.wins}/${stats.draws}/${stats.losses}`}
        sub="vitórias / empates / derrotas"
        icon={Activity}
        color="#10b981"
      />
      <KpiCard
        label="Gols Marcados"
        value={stats.goalsScored}
        sub={`${stats.avgShotsPerGame.toFixed(1)} chutes/jogo`}
        icon={Target}
        color="#f59e0b"
        trend="up"
      />
      <KpiCard
        label="Gols Sofridos"
        value={stats.goalsConceded}
        sub={`${stats.cleanSheets} jogos sem sofrer`}
        icon={Shield}
        color="#ef4444"
        trend={stats.goalsConceded < 15 ? 'up' : 'down'}
      />
      <KpiCard
        label="Posse Média"
        value={`${stats.avgPossession.toFixed(1)}%`}
        sub="por partida"
        icon={TrendingUp}
        color="#8b5cf6"
      />
      <KpiCard
        label="Precisão de Passe"
        value={`${stats.avgPassAccuracy.toFixed(1)}%`}
        sub={`Saldo: ${goalDiff > 0 ? '+' : ''}${goalDiff}`}
        icon={Crosshair}
        color="#06b6d4"
      />
    </div>
  );
}
