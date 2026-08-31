import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  MapPin,
  Route,
  AlertTriangle,
  Database,
  BookOpen,
  Menu,
  X,
  Search,
  RefreshCw,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { AirfareLogo } from '../common/AirfareLogo';
import { ThemeSwitcher } from './ThemeSwitcher';
import { getHealth, refreshIndex } from '../../services/airfareService';
import { HealthStatus } from '../../types/api';
import { LiveFareSearchModal } from '../search/LiveFareSearchModal';

interface SiteHeaderProps {
  activeSection?: number;
  onNavigateSection?: (section: number) => void;
}

const SiteHeaderComponent: React.FC<SiteHeaderProps> = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await getHealth();
        if (isMounted) {
          setHealth(res);
          setHealthLoading(false);
        }
      } catch {
        if (isMounted) {
          setHealth(null);
          setHealthLoading(false);
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleQuickRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshIndex();
      alert('Master Index recalculated from database observations.');
    } catch (err: any) {
      alert(`Refresh failed: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'India Map', path: '/map', icon: MapPin },
    { name: 'Routes', path: '/routes', icon: Route },
    { name: 'Anomalies', path: '/anomalies', icon: AlertTriangle },
    { name: 'Data Explorer', path: '/data', icon: Database },
    { name: 'Methodology & CPI', path: '/methodology', icon: BookOpen },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-auto bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-300 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <Link
            to="/"
            id="header-brand-logo"
            className="flex items-center gap-3 group cursor-pointer flex-shrink-0"
          >
            <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-102">
              <AirfareLogo size={30} />
            </div>
            <div>
              <span className="font-display font-bold text-sm sm:text-[15px] tracking-[0.04em] text-[var(--text-primary)] transition-colors block leading-tight">
                AIRFARE INDEX
              </span>
              <p className="text-[9px] font-sans text-[var(--text-secondary)] font-medium tracking-wider uppercase hidden sm:block">
                DOMESTIC PRICE INTELLIGENCE
              </p>
            </div>
          </Link>

          {/* Minimal Enterprise Horizontal Navigation Bar */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-subtle)]/70 border border-[var(--border)]"
          >
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== '/' && location.pathname.startsWith(link.path));
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`relative flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group cursor-pointer select-none ${
                    isActive
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-[var(--accent)] stroke-[2]'
                        : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] stroke-[1.75]'
                    }`}
                  />
                  <span className="tracking-tight whitespace-nowrap">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Area: Search Fares, Live Health Status & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs border border-[var(--border)] transition-all cursor-pointer shadow-xs"
              title="Search Corridors & Price Comparison"
            >
              <Search className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline font-medium">Search Corridors</span>
            </button>

            {/* Health Badge */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border border-[var(--border)] bg-[var(--surface-subtle)]"
              title={
                health
                  ? `Service: ${health.service} | Database: ${health.database}`
                  : 'Backend server not responding'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.status === 'ok'
                    ? 'bg-[var(--positive)] animate-ping'
                    : 'bg-[var(--negative)]'
                }`}
              />
              <span className="font-bold">
                {healthLoading
                  ? 'CHECKING...'
                  : health?.status === 'ok'
                  ? `API LIVE (${health.database})`
                  : 'API OFFLINE'}
              </span>
            </div>

            {/* Recalculate / Refresh Trigger */}
            <button
              onClick={handleQuickRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] transition-colors cursor-pointer disabled:opacity-50"
              title="Recalculate Master Index (/api/refresh)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <ThemeSwitcher />

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] cursor-pointer"
              aria-label="Toggle full menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 stroke-[1.75]" />
              ) : (
                <Menu className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-2 shadow-md animate-fade-in font-sans">
            <div className="pb-1 text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase flex items-center justify-between">
              <span>Navigation Destinations</span>
              <span className="font-mono text-[10px]">
                {health?.status === 'ok' ? '● API LIVE' : '● API OFFLINE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)] font-semibold border border-[var(--border)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[var(--accent)] stroke-[1.75]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Live Fare Search Modal */}
      <LiveFareSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};
export const SiteHeader = React.memo(SiteHeaderComponent);
