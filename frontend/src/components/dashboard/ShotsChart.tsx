import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MatchweekData, Team } from '@/types/football';

interface ShotsChartProps {
  data: MatchweekData[];
  team: Team;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MatchweekData;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur p-3 shadow-lg text-xs">
      <p className="font-bold mb-1">Rodada {label}</p>
      <p className="text-muted-foreground mb-2">vs {d.opponent}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Total de chutes:</span>
          <span className="font-semibold">{d.shots}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">No alvo:</span>
          <span className="font-semibold text-amber-500">{d.shotsOnTarget}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Conversão:</span>
          <span className="font-semibold">
            {d.shots > 0 ? ((d.goalsScored / d.shots) * 100).toFixed(0) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export function ShotsChart({ data, team }: ShotsChartProps) {
  return (
    <div data-wb-label="Gráfico de Chutes" className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Chutes por Rodada</h3>
        <p className="text-xs text-muted-foreground">Total de chutes e chutes no alvo</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="matchweek"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="shots" name="Chutes" radius={[3, 3, 0, 0]} opacity={0.3}>
            {data.map((_entry, index) => (
              <Cell key={index} fill={team.primaryColor} />
            ))}
          </Bar>
          <Bar dataKey="shotsOnTarget" name="No Alvo" radius={[3, 3, 0, 0]}>
            {data.map((_entry, index) => (
              <Cell key={index} fill="#f59e0b" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
