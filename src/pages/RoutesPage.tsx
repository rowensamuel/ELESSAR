import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route as RouteIcon,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';
import { AIRPORTS } from '../data/airports';
import { getRoutes } from '../services/airfareService';
import { useApiQuery } from '../hooks/useApiQuery';
import { Preloader } from '../components/common/Preloader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const RoutesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState('ALL');
  const [destinationFilter, setDestinationFilter] = useState('ALL');
  const [trendFilter, setTrendFilter] = useState<'ALL' | 'up' | 'down' | 'neutral'>('ALL');
  const [volatilityFilter, setVolatilityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [sortBy, setSortBy] = useState<'routeIndex' | 'avgFare' | 'priceDeltaPercent' | 'volatility'>('routeIndex');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data: allRoutes,
    loading,
    error,
    refetch,
  } = useApiQuery(getRoutes, []);

  const routes = allRoutes || [];

  const filteredRoutes = useMemo(() => {
    let list = [...routes];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.routeName.toLowerCase().includes(q) ||
          r.fromIata.toLowerCase().includes(q) ||
          r.toIata.toLowerCase().includes(q)
      );
    }

    if (originFilter !== 'ALL') {
      list = list.filter((r) => r.fromIata === originFilter);
    }

    if (destinationFilter !== 'ALL') {
      list = list.filter((r) => r.toIata === destinationFilter);
    }

    if (trendFilter !== 'ALL') {
      list = list.filter((r) => r.trend === trendFilter);
    }

    if (volatilityFilter !== 'ALL') {
      list = list.filter((r) => {
        const vol = Math.abs(r.priceDelta7dPercent);
        if (volatilityFilter === 'HIGH') return vol >= 10;
        if (volatilityFilter === 'MEDIUM') return vol >= 5 && vol < 10;
        return vol < 5;
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (sortBy === 'routeIndex') {
        valA = a.routeIndex;
        valB = b.routeIndex;
      } else if (sortBy === 'avgFare') {
        valA = a.avgFareNum;
        valB = b.avgFareNum;
      } else if (sortBy === 'priceDeltaPercent') {
        valA = a.priceDeltaPercent;
        valB = b.priceDeltaPercent;
      } else if (sortBy === 'volatility') {
        valA = Math.abs(a.priceDelta7dPercent);
        valB = Math.abs(b.priceDelta7dPercent);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [
    routes,
    searchQuery,
    originFilter,
    destinationFilter,
    trendFilter,
    volatilityFilter,
    sortBy,
    sortOrder,
  ]);

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <RouteIcon className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-sans text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            CORRIDOR DIRECTORY // LIVE CORRIDOR TELEMETRY
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
          Domestic Route Intelligence Directory
        </h1>
        <p className="text-[var(--text-secondary)] text-sm font-sans font-medium mt-1">
          Real-time tracking of route indices, median spot fares, 7-day volatility distributions, and carrier competition.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-6 p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] space-y-4 font-sans">
        {/* Top Controls: Search + Origin + Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search route name or IATA (e.g. BOM-DEL, Goa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-sans placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-medium"
            />
          </div>

          {/* Origin Airport */}
          <div className="flex items-center gap-2 bg-[var(--surface-elevated)] px-3 py-2 rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-secondary)] font-medium">ORIGIN:</span>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text-primary)]">All Origins</option>
              {AIRPORTS.map((a) => (
                <option key={a.id} value={a.iata} className="bg-[var(--surface)] text-[var(--text-primary)]">
                  {a.iata} - {a.city}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Airport */}
          <div className="flex items-center gap-2 bg-[var(--surface-elevated)] px-3 py-2 rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-secondary)] font-medium">DESTINATION:</span>
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text-primary)]">All Destinations</option>
              {AIRPORTS.map((a) => (
                <option key={a.id} value={a.iata} className="bg-[var(--surface)] text-[var(--text-primary)]">
                  {a.iata} - {a.city}
                </option>
              ))}
            </select>
          </div>

          {/* Trend Filter */}
          <div className="flex items-center gap-2 bg-[var(--surface-elevated)] px-3 py-2 rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-secondary)] font-medium">TREND:</span>
            <select
              value={trendFilter}
              onChange={(e) => setTrendFilter(e.target.value as any)}
              className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text-primary)]">All Trends</option>
              <option value="up" className="bg-[var(--surface)] text-[var(--text-primary)]">Increasing (Surge)</option>
              <option value="down" className="bg-[var(--surface)] text-[var(--text-primary)]">Decreasing (Drop)</option>
              <option value="neutral" className="bg-[var(--surface)] text-[var(--text-primary)]">Stable</option>
            </select>
          </div>
        </div>

        {/* Secondary Bar: Quick Filters + Count */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border)] text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[var(--text-secondary)] mr-2 font-medium">VOLATILITY:</span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVolatilityFilter(v)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  volatilityFilter === v
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="text-[var(--text-secondary)] font-medium">
            SHOWING <strong className="text-[var(--accent)] tabular-nums">{filteredRoutes.length}</strong> OF {routes.length} CORRIDORS
          </div>
        </div>
      </div>

      {/* Routes Master Table / Preloader / ErrorFallback */}
      {loading && routes.length === 0 ? (
        <Preloader variant="table" message="AGGREGATING LIVE DOMESTIC FLIGHT ROUTES..." rows={8} />
      ) : error && routes.length === 0 ? (
        <ErrorFallback
          error={error}
          onRetry={refetch}
          title="Could Not Load Routes Directory"
          variant="card"
        />
      ) : (
        <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="text-[var(--text-secondary)] border-b border-[var(--border)] text-[11px] uppercase font-semibold">
                  <th className="pb-3 font-semibold">Corridor Pair</th>
                  <th className="pb-3 font-semibold">Route Name</th>
                  <th
                    onClick={() => toggleSort('avgFare')}
                    className="pb-3 font-semibold cursor-pointer hover:text-[var(--text-primary)]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Spot Fare</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="pb-3 font-semibold">Base Fare</th>
                  <th
                    onClick={() => toggleSort('routeIndex')}
                    className="pb-3 font-semibold cursor-pointer hover:text-[var(--text-primary)]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Route Index</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('priceDeltaPercent')}
                    className="pb-3 font-semibold cursor-pointer hover:text-[var(--text-primary)]"
                  >
                    <div className="flex items-center gap-1">
                      <span>24H Delta</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('volatility')}
                    className="pb-3 font-semibold cursor-pointer hover:text-[var(--text-primary)]"
                  >
                    <div className="flex items-center gap-1">
                      <span>7D Delta</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="pb-3 font-semibold">Trend</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[var(--text-muted)] font-mono">
                      NO MATCHING CORRIDORS FOUND FOR CURRENT FILTER CRITERIA
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => (
                    <tr
                      key={route.id}
                      onClick={() => navigate(`/routes/${route.slug}`)}
                      className="hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 font-mono font-bold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                          <span>{route.fromIata} → {route.toIata}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-medium text-[var(--text-primary)]">
                        {route.routeName}
                      </td>
                      <td className="py-3.5 font-bold font-display text-[var(--text-primary)] tabular-nums text-sm">
                        {route.avgFare}
                      </td>
                      <td className="py-3.5 text-[var(--text-secondary)] tabular-nums font-mono">
                        ₹{route.baseFare?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="py-3.5 font-bold tabular-nums">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)]">
                          {route.routeIndex.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 tabular-nums">
                        <span
                          className={`font-semibold ${
                            route.priceDeltaPercent > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'
                          }`}
                        >
                          {route.priceDeltaPercent > 0 ? '+' : ''}
                          {route.priceDeltaPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 tabular-nums">
                        <span
                          className={`font-semibold ${
                            route.priceDelta7dPercent > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'
                          }`}
                        >
                          {route.priceDelta7dPercent > 0 ? '+' : ''}
                          {route.priceDelta7dPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            route.trend === 'up'
                              ? 'bg-[var(--negative)]/15 text-[var(--negative)] border border-[var(--negative)]/30'
                              : route.trend === 'down'
                              ? 'bg-[var(--positive)]/15 text-[var(--positive)] border border-[var(--positive)]/30'
                              : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {route.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                          {route.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                          {route.trend === 'up' ? 'Increasing' : route.trend === 'down' ? 'Decreasing' : 'Stable'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent)] flex items-center justify-end gap-1">
                          <span>ANALYTICS</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
