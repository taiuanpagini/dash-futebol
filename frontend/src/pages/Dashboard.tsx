import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TEAMS, getTeamMatchweeks, getTeamSeasonStats } from '@/data/mockData';
import { Sidebar } from '@/components/layout/Sidebar';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { GoalsChart } from '@/components/dashboard/GoalsChart';
import { PossessionChart } from '@/components/dashboard/PossessionChart';
import { ShotsChart } from '@/components/dashboard/ShotsChart';
import { RecentMatchesTable } from '@/components/dashboard/RecentMatchesTable';
import { TopScorers } from '@/components/dashboard/TopScorers';
import { FieldHeatmap } from '@/components/dashboard/FieldHeatmap';
import { Team } from '@/types/football';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const [selectedTeamId, setSelectedTeamId] = useState(1); // Arsenal default
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const team = TEAMS.find(t => t.id === selectedTeamId)!;
  const matchweeks = getTeamMatchweeks(selectedTeamId);
  const stats = getTeamSeasonStats(selectedTeamId);

  return (
    <div data-wb-label="Dashboard Principal" className="flex gap-6">
      {/* Sidebar */}
      <Sidebar selectedTeamId={selectedTeamId} onSelectTeam={setSelectedTeamId} />

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Team selector header */}
        <div data-wb-label="Seletor de Time" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Team color badge */}
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
              style={{ backgroundColor: team.primaryColor }}
            >
              {team.logoText.slice(0, 3)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
              <p className="text-xs text-muted-foreground">{team.stadium} · Temporada 2024/25</p>
            </div>
          </div>
          {/* Mobile team picker */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors"
            >
              Trocar time
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-border bg-card shadow-xl p-1">
                {TEAMS.slice(0, 10).map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTeamId(t.id); setDropdownOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      t.id === selectedTeamId ? 'bg-primary/10 text-foreground font-semibold' : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards stats={stats} team={team} />

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <GoalsChart data={matchweeks} team={team} />
          <PossessionChart data={matchweeks} team={team} />
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ShotsChart data={matchweeks} team={team} />
          <FieldHeatmap data={matchweeks} team={team} />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentMatchesTable data={matchweeks} />
          </div>
          <TopScorers selectedTeamId={selectedTeamId} />
        </div>
      </div>
    </div>
  );
}
