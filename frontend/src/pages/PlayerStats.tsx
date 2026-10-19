import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TEAMS, PLAYERS, getPlayersByTeam } from '@/data/mockData';
import { PlayerWithStats, Team } from '@/types/football';
import { cn } from '@/lib/utils';

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goleiro',
  DEF: 'Defensor',
  MID: 'Meio-Campo',
  FWD: 'Atacante',
};

function PlayerCard({ player, team, selected, onClick }: { player: PlayerWithStats; team: Team; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all',
        selected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/60'
      )}
    >
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-black shadow shrink-0"
        style={{ backgroundColor: team.primaryColor }}
      >
        {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{player.name}</p>
        <p className="text-xs text-muted-foreground">{POSITION_LABELS[player.position]} · #{player.number}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold" style={{ color: team.primaryColor }}>{player.totalGoals}G</p>
        <p className="text-xs text-muted-foreground">{player.totalAssists}A</p>
      </div>
    </button>
  );
}

export function PlayerStats() {
  const [selectedTeamId, setSelectedTeamId] = useState(1);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(PLAYERS.find(p => p.teamId === 1)?.id ?? null);

  const team = TEAMS.find(t => t.id === selectedTeamId)!;
  const players = getPlayersByTeam(selectedTeamId);
  const player = players.find(p => p.id === selectedPlayerId) ?? players[0];

  const handleTeamChange = (id: number) => {
    setSelectedTeamId(id);
    const firstPlayer = getPlayersByTeam(id)[0];
    setSelectedPlayerId(firstPlayer?.id ?? null);
  };

  if (!player) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum jogador disponível para este time.
      </div>
    );
  }

  return (
    <div data-wb-label="Página de Jogadores" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Desempenho de Jogadores</h1>
        <p className="text-sm text-muted-foreground">Análise individual ao longo da temporada</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Left: Team + Player selector */}
        <div className="space-y-4">
          {/* Team selector */}
          <div data-wb-label="Seletor de Time" className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selecionar Time</p>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {TEAMS.slice(0, 10).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTeamChange(t.id)}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                    t.id === selectedTeamId ? 'bg-primary/10 text-foreground font-semibold' : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: t.primaryColor }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Player list */}
          <div data-wb-label="Lista de Jogadores" className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{team.name}</p>
            {players.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sem dados disponíveis</p>
            ) : (
              <div className="space-y-0.5">
                {players.map(p => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    team={team}
                    selected={p.id === selectedPlayerId}
                    onClick={() => setSelectedPlayerId(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Player detail */}
        <div className="xl:col-span-3 space-y-5">
          {/* Player profile */}
          <div data-wb-label="Perfil do Jogador" className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="h-2" style={{ backgroundColor: team.primaryColor }} />
            <div className="p-5 flex items-center gap-5">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0"
                style={{ backgroundColor: team.primaryColor }}
              >
                {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">{player.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {POSITION_LABELS[player.position]} · #{player.number} · {player.nationality} · {player.age} anos
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{team.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black" style={{ color: team.primaryColor }}>{player.totalGoals}</p>
                  <p className="text-xs text-muted-foreground">Gols</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-cyan-500">{player.totalAssists}</p>
                  <p className="text-xs text-muted-foreground">Assist.</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-500">{player.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Média</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Goals & Assists chart */}
            <div data-wb-label="Gráfico Gols e Assistências" className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3 text-foreground">Gols e Assistências por Rodada</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={player.stats} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="matchweek" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(l) => `Rodada ${l}`}
                  />
                  <Bar dataKey="goals" name="Gols" fill={team.primaryColor} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="assists" name="Assist." fill="#06b6d4" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rating chart */}
            <div data-wb-label="Gráfico de Avaliação por Rodada" className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3 text-foreground">Avaliação por Rodada</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={player.stats} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="matchweek" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[5, 10]} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(l) => `Rodada ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    name="Avaliação"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance table */}
          <div data-wb-label="Tabela de Desempenho por Rodada" className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Desempenho por Rodada</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Rd', 'Gols', 'Assist.', 'Min.', 'Chutes', 'No Alvo', 'Passes', 'Prec.', 'Nota'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...player.stats].reverse().map((s) => (
                    <tr key={s.matchweek} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2 font-mono text-muted-foreground">{s.matchweek}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: s.goals > 0 ? team.primaryColor : undefined }}>{s.goals || '—'}</td>
                      <td className="px-3 py-2 font-bold text-cyan-500">{s.assists || '—'}</td>
                      <td className="px-3 py-2 text-foreground">{s.minutesPlayed}'</td>
                      <td className="px-3 py-2 text-foreground">{s.shots}</td>
                      <td className="px-3 py-2 text-amber-500 font-medium">{s.shotsOnTarget}</td>
                      <td className="px-3 py-2 text-foreground">{s.passes}</td>
                      <td className="px-3 py-2 text-foreground">{s.passAccuracy}%</td>
                      <td className="px-3 py-2">
                        <span className={cn(
                          'font-bold',
                          s.rating >= 8.5 ? 'text-green-500' :
                          s.rating >= 7.5 ? 'text-amber-500' :
                          'text-red-400'
                        )}>
                          {s.rating.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
