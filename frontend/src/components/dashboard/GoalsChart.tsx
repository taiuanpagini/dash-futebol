import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MatchweekData, Team } from '@/types/football';

interface GoalsChartProps {
  data: MatchweekData[];
  team: Team;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MatchweekData;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur p-3 shadow-lg text-xs">
      <p className="font-bold mb-1 text-foreground">Rodada {label} {d.homeAway === 'H' ? '(Casa)' : '(Fora)'}</p>
      <p className="text-muted-foreground mb-2">vs <span className="font-semibold text-foreground">{d.opponent}</span></p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function GoalsChart({ data, team }: GoalsChartProps) {
  return (
    <div data-wb-label="Gráfico de Gols por Rodada" className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Gols por Rodada</h3>
        <p className="text-xs text-muted-foreground">Gols marcados e sofridos ao longo da temporada</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="matchweek"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Rodada', position: 'insideBottom', offset: -2, fontSize: 10, opacity: 0.5 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="goalsScored"
            name="Marcados"
            fill={team.primaryColor}
            radius={[3, 3, 0, 0]}
            opacity={0.85}
          />
          <Bar
            dataKey="goalsConceded"
            name="Sofridos"
            fill="#ef4444"
            radius={[3, 3, 0, 0]}
            opacity={0.7}
          />
          <Line
            type="monotone"
            dataKey="goalsScored"
            name=" "
            stroke={team.primaryColor}
            strokeWidth={2}
            dot={false}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
