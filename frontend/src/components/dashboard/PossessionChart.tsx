import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MatchweekData, Team } from '@/types/football';

interface PossessionChartProps {
  data: MatchweekData[];
  team: Team;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MatchweekData;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur p-3 shadow-lg text-xs">
      <p className="font-bold mb-1 text-foreground">Rodada {label}</p>
      <p className="text-muted-foreground mb-2">vs {d.opponent}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Posse:</span>
          <span className="font-semibold text-foreground">{d.possession}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Precisão passe:</span>
          <span className="font-semibold text-foreground">{d.passAccuracy}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Chutes no alvo:</span>
          <span className="font-semibold text-foreground">{d.shotsOnTarget}/{d.shots}</span>
        </div>
      </div>
    </div>
  );
};

export function PossessionChart({ data, team }: PossessionChartProps) {
  const avgPossession = data.reduce((s, d) => s + d.possession, 0) / data.length;

  return (
    <div data-wb-label="Gráfico de Posse de Bola" className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Posse de Bola</h3>
          <p className="text-xs text-muted-foreground">Percentual de posse por rodada</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: team.primaryColor }}>
            {avgPossession.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">média da temporada</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="possGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={team.primaryColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={team.primaryColor} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="matchweek"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[30, 80]}
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={50}
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeDasharray="4 4"
            label={{ value: '50%', fontSize: 10, opacity: 0.5 }}
          />
          <Area
            type="monotone"
            dataKey="possession"
            name="Posse"
            stroke={team.primaryColor}
            strokeWidth={2.5}
            fill="url(#possGrad)"
            dot={{ r: 3, fill: team.primaryColor, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: team.primaryColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
