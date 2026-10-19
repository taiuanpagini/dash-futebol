import { Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/pages/Dashboard';
import { TeamComparison } from '@/pages/TeamComparison';
import { PlayerStats } from '@/pages/PlayerStats';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/comparativo" element={<TeamComparison />} />
          <Route path="/jogadores" element={<PlayerStats />} />
        </Routes>
      </main>
      <footer className="border-t border-border py-4 mt-8">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <span>Premier League Analytics · Temporada 2024/25</span>
          <span>Dados estatísticos atualizados até a Rodada 15</span>
        </div>
      </footer>
    </div>
  );
}
