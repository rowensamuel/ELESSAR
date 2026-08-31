import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { getAnomalies } from '../services/airfareService';
import { Anomaly } from '../types';
import { Preloader } from '../components/common/Preloader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnomalies();
      setAnomalies(data);
    } catch (err: any) {
      console.error('Error fetching anomalies:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAnomalies = useMemo(() => {
    let list = [...anomalies];

    if (severityFilter !== 'ALL') {
      list = list.filter((a) => a.severity === severityFilter);
    }

    if (categoryFilter !== 'ALL') {
      list = list.filter((a) => a.category === categoryFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.route.toLowerCase().includes(q) ||
          a.airline.toLowerCase().includes(q) ||
          a.cause.toLowerCase().includes(q)
      );
    }

    return list;
  }, [anomalies, severityFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = anomalies.length;
    const high = anomalies.filter((a) => a.severity === 'HIGH').length;
    const surges = anomalies.filter((a) => a.type === 'SURGE').length;
    const drops = anomalies.filter((a) => a.type === 'DROP').length;
    return { total, high, surges, drops };
  }, [anomalies]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200 font-sans">
      {/* Page Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            REAL-TIME ANOMALY ENGINE // STATISTICAL SURVEILLANCE
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
          Airfare Anomaly & Volatility Detection
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Algorithmic surveillance flagging significant deviations, flash drops, demand surges, and baseline integrity gaps.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">FLAGGED CORRIDORS</span>
          <span className="text-3xl font-display font-bold text-[var(--text-primary)] mt-1 block tabular-nums">
            {stats.total}
          </span>
          <span className="text-[10px] text-[var(--accent)] mt-1 block font-medium">Dynamic statistical outliers</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">HIGH SEVERITY</span>
          <span className="text-3xl font-display font-bold text-[var(--negative)] mt-1 block tabular-nums">
            {stats.high}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">&gt;5.0% rapid shift</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">PRICE SURGES</span>
          <span className="text-3xl font-display font-bold text-[var(--negative)] mt-1 block tabular-nums">
            {stats.surges}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Capacity compression</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">PRICE DROPS</span>
          <span className="text-3xl font-display font-bold text-[var(--positive)] mt-1 block tabular-nums">
            {stats.drops}
          </span>
          <span className="text-[10px] text-[var(--positive)] mt-1 block font-medium">Promotions / price cuts</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="my-6 p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search route (e.g. BOM-DEL, Delhi, Surge)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-medium"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-secondary)] mr-1 font-semibold">SEVERITY:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
                severityFilter === sev
                  ? sev === 'HIGH'
                    ? 'bg-[var(--negative)] text-white font-bold'
                    : 'bg-[var(--accent)] text-white font-bold'
                  : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-[var(--surface-elevated)] px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs">
          <span className="text-[var(--text-secondary)] font-medium">CATEGORY:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-[var(--text-primary)] font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[var(--surface)] text-[var(--text-primary)]">All Categories</option>
            <option value="Price Surge" className="bg-[var(--surface)] text-[var(--text-primary)]">Price Surge</option>
            <option value="Discount / Flash Drop" className="bg-[var(--surface)] text-[var(--text-primary)]">Discount / Flash Drop</option>
            <option value="Extreme Volatility" className="bg-[var(--surface)] text-[var(--text-primary)]">Extreme Volatility</option>
            <option value="Data Hygiene" className="bg-[var(--surface)] text-[var(--text-primary)]">Data Hygiene</option>
          </select>
        </div>
      </div>

      {/* Main List / Preloader / ErrorFallback */}
      {loading ? (
        <Preloader variant="card" message="CALCULATING VOLATILITY THRESHOLDS ACROSS NETWORK..." />
      ) : error ? (
        <ErrorFallback
          error={error}
          onRetry={loadData}
          title="Could Not Execute Anomaly Engine"
          variant="card"
        />
      ) : filteredAnomalies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-[var(--text-muted)]">
          NO ACTIVE ANOMALIES MATCHING THE CURRENT FILTERS. CORRIDOR NETWORK OPERATING WITHIN NORMAL VOLATILITY BANDS.
        </div>
      ) : (
        <div className="space-y-4 my-6">
          {filteredAnomalies.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all shadow-[var(--card-shadow)]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold text-lg text-[var(--text-primary)]">
                      {item.route}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.severity === 'HIGH'
                          ? 'bg-[var(--negative-subtle)] text-[var(--negative)] border border-[var(--negative)]/30'
                          : 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--text-secondary)] text-[10px] font-semibold border border-[var(--border)]">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Triggered by: <strong className="text-[var(--text-primary)]">{item.cause}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-6 self-start md:self-auto text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">SPOT / OBSERVED</span>
                    <span className="text-base font-bold font-mono text-[var(--text-primary)]">
                      {item.observedFareFormatted}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">ESTIMATED NORMAL</span>
                    <span className="text-base font-mono text-[var(--text-secondary)]">
                      {item.normalFareFormatted}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">DEVIATION</span>
                    <span
                      className={`text-base font-bold font-mono ${
                        item.deviationPercent > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'
                      }`}
                    >
                      {item.deviationPercent > 0 ? '+' : ''}
                      {item.deviationPercent.toFixed(1)}%
                    </span>
                  </div>

                  <Link
                    to={`/routes/${item.routeSlug}`}
                    className="p-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] transition-colors"
                    title="Inspect corridor details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
