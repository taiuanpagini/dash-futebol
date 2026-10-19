import { Trophy, BarChart3, Users, ArrowLeftRight, RefreshCw, CheckCircle2, AlertCircle, Wifi } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/comparativo', label: 'Comparativo', icon: ArrowLeftRight },
  { path: '/jogadores', label: 'Jogadores', icon: Users },
];

function formatLastSync(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  return date.toLocaleDateString('pt-BR');
}

export function Header() {
  const location = useLocation();
  const { status, isBusy, error, triggerSync } = useSyncStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  const syncOk = status?.status === 'success';
  const syncError = status?.status === 'error' || !!error;
  const isConfigured = status?.isConfigured ?? false;

  return (
    <>
      <header data-wb-label="Header Principal" className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-foreground">Premier</span>
              <span className="text-sm font-bold text-primary"> League</span>
              <span className="ml-1 text-xs text-muted-foreground font-normal">Analytics</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav data-wb-label="Navegação Principal" className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                  location.pathname === path
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: sync + season badge + toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sync button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isBusy) triggerSync();
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={isBusy}
                title={isConfigured ? 'Sincronizar dados reais' : 'Configure SPORTS_API_KEY para sincronizar'}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all duration-150',
                  isBusy && 'opacity-70 cursor-not-allowed',
                  !isBusy && 'cursor-pointer',
                  syncOk && !isBusy
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    : syncError
                    ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                    : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {isBusy ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : syncOk ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : syncError ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                  <Wifi className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isBusy
                    ? 'Sincronizando…'
                    : syncOk
                    ? 'Sincronizado'
                    : syncError
                    ? 'Erro'
                    : 'Sincronizar'}
                </span>
              </button>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg text-xs">
                  {!isConfigured ? (
                    <div>
                      <p className="font-semibold text-foreground mb-1">API não configurada</p>
                      <p className="text-muted-foreground">
                        Adicione a variável <code className="bg-muted px-1 rounded font-mono">SPORTS_API_KEY</code> com sua chave da{' '}
                        <span className="text-primary font-medium">API-Football</span> para carregar dados reais da Premier League.
                      </p>
                    </div>
                  ) : status?.status === 'error' || error ? (
                    <div>
                      <p className="font-semibold text-red-500 mb-1">Erro na sincronização</p>
                      <p className="text-muted-foreground break-words">{error ?? status?.errorMessage}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Dados da API-Football</p>
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Última sincronização</span>
                          <span className="font-medium text-foreground">{formatLastSync(status?.lastSyncedAt ?? null)}</span>
                        </div>
                        {status?.teamsCount != null && (
                          <div className="flex justify-between">
                            <span>Times</span>
                            <span className="font-medium text-foreground">{status.teamsCount}</span>
                          </div>
                        )}
                        {status?.fixturesCount != null && (
                          <div className="flex justify-between">
                            <span>Partidas</span>
                            <span className="font-medium text-foreground">{status.fixturesCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              2024/25
            </span>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Banner when API key not configured */}
      {status && !isConfigured && (
        <div data-wb-label="Banner de configuração da API" className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-400">
          <span className="font-medium">Modo demonstração</span>
          {' — '}usando dados simulados. Para conectar dados reais da Premier League, adicione{' '}
          <code className="bg-amber-500/10 px-1 rounded font-mono">SPORTS_API_KEY</code> nas variáveis de ambiente do projeto com sua chave da{' '}
          <a
            href="https://www.api-football.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
          >
            API-Football
          </a>.
        </div>
      )}
    </>
  );
}
