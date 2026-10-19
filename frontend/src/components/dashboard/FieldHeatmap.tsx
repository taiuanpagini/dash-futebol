import { MatchweekData, Team } from '@/types/football';

interface FieldHeatmapProps {
  data: MatchweekData[];
  team: Team;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function FieldHeatmap({ data, team }: FieldHeatmapProps) {
  if (!data.length) return null;

  // Calculate average stats
  const avgPoss = data.reduce((s, d) => s + d.possession, 0) / data.length;
  const avgShots = data.reduce((s, d) => s + d.shots, 0) / data.length;
  const avgSOT = data.reduce((s, d) => s + d.shotsOnTarget, 0) / data.length;

  // Zone intensities based on possession and shot data
  const attackIntensity = Math.min(1, avgShots / 20);
  const midIntensity = Math.min(1, avgPoss / 70);
  const defIntensity = Math.min(1, (100 - avgPoss) / 60);

  const color = team.primaryColor.startsWith('#') ? team.primaryColor : '#7c3aed';

  const zones = [
    { label: 'Defesa', zone: 'DEF', intensity: defIntensity * 0.6, x: 5, y: 15, w: 90, h: 30 },
    { label: 'Meio-Campo', zone: 'MID', intensity: midIntensity * 0.8, x: 5, y: 37, w: 90, h: 26 },
    { label: 'Ataque', zone: 'ATK', intensity: attackIntensity, x: 5, y: 55, w: 90, h: 30 },
  ];

  return (
    <div data-wb-label="Mapa de Campo" className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Posicionamento em Campo</h3>
        <p className="text-xs text-muted-foreground">Intensidade de ação por zona — média da temporada</p>
      </div>
      <div className="flex gap-4">
        {/* Field SVG */}
        <div className="flex-1">
          <svg viewBox="0 0 100 85" className="w-full" style={{ maxHeight: 220 }}>
            {/* Field background */}
            <rect x="0" y="0" width="100" height="85" fill="#166534" rx="2" />
            {/* Grass stripes */}
            {[0, 1, 2, 3, 4].map(i => (
              <rect key={i} x="0" y={i * 17} width="100" height="8.5" fill="#15803d" opacity="0.5" />
            ))}

            {/* Heat zones */}
            {zones.map(z => (
              <rect
                key={z.zone}
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                fill={hexToRgba(color, z.intensity * 0.65)}
                rx="1"
              />
            ))}

            {/* Field lines */}
            <rect x="5" y="5" width="90" height="75" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" rx="0.5" />
            {/* Center circle */}
            <circle cx="50" cy="42.5" r="9" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <circle cx="50" cy="42.5" r="0.8" fill="rgba(255,255,255,0.7)" />
            {/* Halfway line */}
            <line x1="5" y1="42.5" x2="95" y2="42.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            {/* Penalty areas */}
            <rect x="25" y="5" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
            <rect x="25" y="62" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
            {/* Goal areas */}
            <rect x="35" y="5" width="30" height="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
            <rect x="35" y="71" width="30" height="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
            {/* Goals */}
            <rect x="42" y="2" width="16" height="3" fill="rgba(255,255,255,0.3)" />
            <rect x="42" y="80" width="16" height="3" fill="rgba(255,255,255,0.3)" />

            {/* Zone labels */}
            <text x="50" y="24" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="4.5" fontWeight="700">DEFESA</text>
            <text x="50" y="47.5" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="4.5" fontWeight="700">MEIO-CAMPO</text>
            <text x="50" y="68" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="4.5" fontWeight="700">ATAQUE</text>

            {/* Team name */}
            <text x="50" y="80" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="3">{team.name}</text>
          </svg>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 justify-center w-28 shrink-0">
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Posse Média</p>
            <p className="text-lg font-bold" style={{ color: color }}>{avgPoss.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">Chutes/Jogo</p>
            <p className="text-lg font-bold text-amber-500">{avgShots.toFixed(1)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">No Alvo/Jogo</p>
            <p className="text-lg font-bold text-green-500">{avgSOT.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
