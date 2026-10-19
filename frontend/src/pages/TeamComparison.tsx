import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { TEAMS, getTeamSeasonStats, getFixtures } from '@/data/mockData';
import { RadarComparisonChart } from '@/components/comparison/RadarComparisonChart';
import { cn } from '@/lib/utils';

function StatRow({
  label,
  valueA,
  valueB,
  colorA,
  colorB,
  higherIsBetter = true,
}: {
  label: string;
  valueA: number;
  valueB: number;
  colorA: string;
  colorB: string;
  higherIsBetter?: boolean;
}) {
  const totalA = valueA + valueB || 1;
  const pctA = (valueA / totalA) * 100;
  const pctB = (valueB / totalA) * 100;
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-bold', aWins ? 'text-foreground' : 'text-muted-foreground')}>
          {typeof valueA === 'number' && valueA % 1 !== 0 ? valueA.toFixed(1) : valueA}
        </span>
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={cn('font-bold', bWins ? 'text-foreground' : 'text-muted-foreground')}>
          {typeof valueB === 'number' && valueB % 1 !== 0 ? valueB.toFixed(1) : valueB}
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted gap-0.5">
        <div
          className="rounded-l-full transition-all duration-700"
          style={{ width: `${pctA}%`, backgroundColor: colorA, opacity: aWins ? 1 : 0.5 }}
        />
        <div
          className="rounded-r-full transition-all duration-700"
          style={{ width: `${pctB}%`, backgroundColor: colorB, opacity: bWins ? 1 : 0.5 }}
        />
      </div>
    </div>
  );
}

function TeamSelector({
  label,
  selectedId,
  excludeId,
  onSelect,
}: {
  label: string;
  selectedId: number;
  excludeId: number;
  onSelect: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const team = TEAMS.find(t => t.id === selectedId)!;

  return (
    <div className="relative">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm hover:bg-muted/50 transition-colors w-full"
      >
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow"
          style={{ backgroundColor: team.primaryColor }}
        >
          {team.logoText.slice(0, 3)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">{team.name}</p>
          <p className="text-xs text-muted-foreground">{team.stadium}</p>
        </div>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border bg-card shadow-xl p-1 max-h-60 overflow-y-auto">
          {TEAMS.filter(t => t.id !== excludeId).map(t => (
            <button
              key={t.id}
              onClick={() => { onSelect(t.id); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                t.id === selectedId ? 'bg-primary/10 font-semibold text-foreground' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: t.primaryColor }} />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamComparison() {
  const [teamAId, setTeamAId] = useState(1); // Arsenal
  const [teamBId, setTeamBId] = useState(3); // Man City

  const teamA = TEAMS.find(t => t.id === teamAId)!;
  const teamB = TEAMS.find(t => t.id === teamBId)!;
  const statsA = getTeamSeasonStats(teamAId);
  const statsB = getTeamSeasonStats(teamBId);

  // Head to head
  const allFixtures = getFixtures();
  const h2h = allFixtures.filter(
    f =>
      (f.homeTeam.id === teamAId && f.awayTeam.id === teamBId) ||
      (f.homeTeam.id === teamBId && f.awayTeam.id === teamAId)
  );

  const swapTeams = () => {
    setTeamAId(teamBId);
    setTeamBId(teamAId);
  };

  return (
    <div data-wb-label="Página de Comparativo" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Comparativo entre Times</h1>
        <p className="text-sm text-muted-foreground">Compare estatísticas de dois times lado a lado</p>
      </div>

      {/* Team selectors */}
      <div data-wb-label="Seletor de Times para Comparação" className="grid grid-cols-5 gap-3 items-end">
        <div className="col-span-2">
          <TeamSelector label="Time A" selectedId={teamAId} excludeId={teamBId} onSelect={setTeamAId} />
        </div>
        <div className="flex justify-center">
          <button
            onClick={swapTeams}
            className="h-10 w-10 rounded-full border border-border bg-card flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
            title="Trocar times"
          >
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="col-span-2">
          <TeamSelector label="Time B" selectedId={teamBId} excludeId={teamAId} onSelect={setTeamBId} />
        </div>
      </div>

      {/* Main comparison */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Stats comparison */}
        <div data-wb-label="Estatísticas Comparativas" className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Estatísticas da Temporada</h3>

          {/* Team headers */}
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md" style={{ backgroundColor: teamA.primaryColor }} />
              <span className="text-sm font-bold text-foreground">{teamA.shortName}</span>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <div className="h-6 w-6 rounded-md" style={{ backgroundColor: teamB.primaryColor }} />
              <span className="text-sm font-bold text-foreground">{teamB.shortName}</span>
            </div>
          </div>

          <div className="space-y-4">
            <StatRow label="Pontos" valueA={statsA.points} valueB={statsB.points} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
            <StatRow label="Gols Marcados" valueA={statsA.goalsScored} valueB={statsB.goalsScored} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
            <StatRow label="Gols Sofridos" valueA={statsA.goalsConceded} valueB={statsB.goalsConceded} colorA={teamA.primaryColor} colorB={teamB.primaryColor} higherIsBetter={false} />
            <StatRow label="Vitórias" valueA={statsA.wins} valueB={statsB.wins} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
            <StatRow label="Posse Média %" valueA={statsA.avgPossession} valueB={statsB.avgPossession} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
            <StatRow label="Precisão Passe %" valueA={statsA.avgPassAccuracy} valueB={statsB.avgPassAccuracy} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
            <StatRow label="Chutes/Jogo" valueA={statsA.avgShotsPerGame} valueB={statsB.avgShotsPerGame} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
            <StatRow label="Chutes no Alvo/Jogo" valueA={statsA.avgShotsOnTargetPerGame} valueB={statsB.avgShotsOnTargetPerGame} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
            <StatRow label="Jogos Sem Sofrer Gol" valueA={statsA.cleanSheets} valueB={statsB.cleanSheets} colorA={teamA.primaryColor} colorB={teamB.primaryColor} />
          </div>
        </div>

        {/* Radar chart */}
        <RadarComparisonChart
          teamA={teamA}
          teamB={teamB}
          statsA={statsA}
          statsB={statsB}
        />
      </div>

      {/* Quick stats cards */}
      <div data-wb-label="Cards de Resumo Comparativo" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Posição Atual', a: statsA.points, b: statsB.points, suffix: 'pts', higherWins: true },
          { label: 'Saldo de Gols', a: statsA.goalsScored - statsA.goalsConceded, b: statsB.goalsScored - statsB.goalsConceded, suffix: '', higherWins: true },
          { label: 'Clean Sheets', a: statsA.cleanSheets, b: statsB.cleanSheets, suffix: '', higherWins: true },
          { label: 'Eficiência Ataque', a: statsA.avgShotsOnTargetPerGame, b: statsB.avgShotsOnTargetPerGame, suffix: '/jogo', higherWins: true },
        ].map((item) => {
          const aWins = item.higherWins ? item.a > item.b : item.a < item.b;
          const bWins = item.higherWins ? item.b > item.a : item.b < item.a;
          return (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground mb-2">{item.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className={cn('text-xl font-black', aWins ? '' : 'opacity-50')} style={{ color: aWins ? teamA.primaryColor : undefined }}>
                    {typeof item.a === 'number' && item.a % 1 !== 0 ? item.a.toFixed(1) : item.a}
                    <span className="text-xs font-normal ml-0.5">{item.suffix}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{teamA.shortName}</p>
                </div>
                <span className="text-xs text-muted-foreground font-bold">vs</span>
                <div className="text-right">
                  <p className={cn('text-xl font-black', bWins ? '' : 'opacity-50')} style={{ color: bWins ? teamB.primaryColor : undefined }}>
                    {typeof item.b === 'number' && item.b % 1 !== 0 ? item.b.toFixed(1) : item.b}
                    <span className="text-xs font-normal ml-0.5">{item.suffix}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{teamB.shortName}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Head-to-head */}
      {h2h.length > 0 && (
        <div data-wb-label="Histórico de Confrontos Diretos" className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Confrontos Diretos — 2024/25</h3>
          </div>
          <div className="divide-y divide-border/50">
            {h2h.map(f => {
              const isAHome = f.homeTeam.id === teamAId;
              const aGoals = isAHome ? f.homeGoals : f.awayGoals;
              const bGoals = isAHome ? f.awayGoals : f.homeGoals;
              return (
                <div key={f.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md" style={{ backgroundColor: teamA.primaryColor }} />
                    <span className="text-sm font-semibold">{teamA.shortName}</span>
                    {isAHome && <span className="text-xs text-muted-foreground">(Casa)</span>}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-foreground">{aGoals} – {bGoals}</div>
                    <div className="text-xs text-muted-foreground">Rodada {f.matchweek}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <div className="h-6 w-6 rounded-md" style={{ backgroundColor: teamB.primaryColor }} />
                    <span className="text-sm font-semibold">{teamB.shortName}</span>
                    {!isAHome && <span className="text-xs text-muted-foreground">(Casa)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
