import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { TeamSeasonStats, Team } from '@/types/football';

interface RadarComparisonChartProps {
  teamA: Team;
  teamB: Team;
  statsA: TeamSeasonStats;
  statsB: TeamSeasonStats;
}

function normalize(value: number, min: number, max: number): number {
  return Math.round(((value - min) / (max - min)) * 100);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 p-2 shadow-lg text-xs">
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function RadarComparisonChart({ teamA, teamB, statsA, statsB }: RadarComparisonChartProps) {
  const data = [
    {
      metric: 'Ataque',
      [teamA.shortName]: normalize(statsA.goalsScored, 5, 35),
      [teamB.shortName]: normalize(statsB.goalsScored, 5, 35),
    },
    {
      metric: 'Defesa',
      [teamA.shortName]: normalize(30 - statsA.goalsConceded, 0, 25),
      [teamB.shortName]: normalize(30 - statsB.goalsConceded, 0, 25),
    },
    {
      metric: 'Posse',
      [teamA.shortName]: normalize(statsA.avgPossession, 35, 70),
      [teamB.shortName]: normalize(statsB.avgPossession, 35, 70),
    },
    {
      metric: 'Passes',
      [teamA.shortName]: normalize(statsA.avgPassAccuracy, 70, 95),
      [teamB.shortName]: normalize(statsB.avgPassAccuracy, 70, 95),
    },
    {
      metric: 'Eficiência',
      [teamA.shortName]: normalize(statsA.avgShotsOnTargetPerGame, 2, 10),
      [teamB.shortName]: normalize(statsB.avgShotsOnTargetPerGame, 2, 10),
    },
    {
      metric: 'Forma',
      [teamA.shortName]: normalize(statsA.wins * 3 + statsA.draws, 0, 45),
      [teamB.shortName]: normalize(statsB.wins * 3 + statsB.draws, 0, 45),
    },
  ];

  return (
    <div data-wb-label="Gráfico Radar de Comparação" className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Análise Comparativa</h3>
        <p className="text-xs text-muted-foreground">Desempenho normalizado por categoria</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="currentColor" opacity={0.15} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
          />
          <Radar
            name={teamA.shortName}
            dataKey={teamA.shortName}
            stroke={teamA.primaryColor}
            fill={teamA.primaryColor}
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name={teamB.shortName}
            dataKey={teamB.shortName}
            stroke={teamB.primaryColor}
            fill={teamB.primaryColor}
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="circle"
            iconSize={8}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
