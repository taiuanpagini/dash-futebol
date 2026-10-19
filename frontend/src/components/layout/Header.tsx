import { Trophy, BarChart3, Users, ArrowLeftRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/comparativo', label: 'Comparativo', icon: ArrowLeftRight },
  { path: '/jogadores', label: 'Jogadores', icon: Users },
];

export function Header() {
  const location = useLocation();

  return (
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

        {/* Right: Season badge + toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            2024/25
          </span>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
