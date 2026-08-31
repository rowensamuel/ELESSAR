import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Database,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getDashboard,
  getIndexHistory,
  refreshIndex,
  mapRouteSummaryToFlightRoute,
} from '../services/airfareService';
import { DashboardData, RouteSummaryItem } from '../types/api';
import { useTheme } from '../context/ThemeContext';
import { Preloader } from '../components/common/Preloader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { themeConfig } = useTheme();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [trendRange, setTrendRange] = useState<'24H' | '7D' | '30D' | '3M' | '1Y'>('30D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard();
      setDashboard(data);

      const hist = await getIndexHistory(trendRange.toLowerCase());
      setChartData(hist);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update chart when trend range changes (24H, 7D, 30D, 3M, 1Y)
  useEffect(() => {
    async function updateChart() {
      try {
        const data = await getIndexHistory(trendRange.toLowerCase());
        setChartData(data);
      } catch (err) {
        console.warn('Failed to update chart history:', err);
      }
    }
    if (dashboard) {
      updateChart();
    }
  }, [trendRange]);

  const handleRefreshIndex = async () => {
    setRefreshing(true);
    setRefreshMessage(null);
    try {
      const res = await refreshIndex();
      setRefreshMessage(res?.message || 'Master index recalculated successfully');
      await loadDashboardData();
    } catch (err: any) {
      alert(`Refresh failed: ${err.message || 'Error occurred'}`);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center pt-20">
        <Preloader variant="full" message="AGGREGATING NATIONAL AIRFARE DASHBOARD..." />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center pt-20 px-4">
        <ErrorFallback
          error={error}
          onRetry={loadDashboardData}
          title="Could Not Connect to Dashboard Engine"
          variant="page"
        />
      </div>
    );
  }

  const summary = dashboard?.summary;
  const topRoutes: RouteSummaryItem[] = dashboard?.topRoutes || [];
  const dataStream = dashboard?.dataStream;
  const warnings = dashboard?.warnings || [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200">
      {/* Top Header & Telemetry Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              NATIONAL AIRFARE DASHBOARD // INDIA
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            Airfare Intelligence & Price Movements
          </h1>
          <p className="text-[var(--text-secondary)] text-sm font-sans font-medium mt-1">
            Laspeyres composite price benchmark across active trunk corridors.
          </p>
        </div>

        {/* Action Controls & Live Status Badge */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto font-sans">
          {/* Refresh Index Button */}
          <button
            onClick={handleRefreshIndex}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--accent)] border border-[var(--accent)]/40 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'CALCULATING...' : 'REFRESH INDEX'}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] text-xs shadow-[var(--card-shadow)]">
            <span className="w-2 h-2 rounded-full bg-[var(--positive)] animate-ping" />
            <span className="text-[var(--text-primary)] font-bold">
              ● {dataStream?.status || 'LIVE'}
            </span>
            <span className="text-[var(--text-muted)]">|</span>
            <span className="text-[var(--text-secondary)] font-medium">
              {summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleTimeString() : 'Recent'}
            </span>
          </div>
        </div>
      </div>

      {refreshMessage && (
        <div className="my-4 p-3.5 rounded-xl bg-[var(--positive-subtle)] border border-[var(--positive)]/40 text-[var(--positive)] text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{refreshMessage}</span>
        </div>
      )}

      {/* Top Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6 font-sans">
        {/* National Index */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-medium">
            <span>INDIA AIRFARE INDEX</span>
            <span className="text-[var(--accent)] font-semibold">BASE 100</span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-4xl sm:text-5xl font-display font-bold text-[var(--text-primary)] tabular-nums">
              {summary?.indiaAirfareIndex ? summary.indiaAirfareIndex.toFixed(2) : '100.00'}
            </span>
            <span className={`text-sm font-semibold flex items-center tabular-nums ${summary?.change24h && summary.change24h > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'}`}>
              <TrendingUp className="w-4 h-4 mr-0.5" />
              {summary?.change24h && summary.change24h > 0 ? '+' : ''}{summary?.change24h ?? 0}% today
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-secondary)] font-medium">
            Composite national price metric
          </div>
        </div>

        {/* 24H Change */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[var(--text-secondary)] text-xs font-medium block">24H CHANGE</span>
          <span className={`text-2xl font-display font-bold mt-2 block tabular-nums ${summary?.change24h && summary.change24h > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'}`}>
            {summary?.change24h && summary.change24h > 0 ? '+' : ''}{summary?.change24h ?? 0}%
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 block">Day over day delta</span>
        </div>

        {/* Routes Tracked */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[var(--text-secondary)] text-xs font-medium block">ROUTES TRACKED</span>
          <span className="text-2xl font-display font-bold text-[var(--text-primary)] mt-2 block tabular-nums">
            {summary?.routesTracked ?? topRoutes.length}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 block">Active corridor basket</span>
        </div>

        {/* Fare Observations */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[var(--text-secondary)] text-xs font-medium block">FARE SAMPLES</span>
          <span className="text-2xl font-display font-bold text-[var(--accent)] mt-2 block tabular-nums">
            {(summary?.fareObservations || dataStream?.observations || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 block">Logged in MongoDB</span>
        </div>

        {/* Data Sources & Freshness */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[var(--text-secondary)] text-xs font-medium block">DATA SOURCES</span>
          <span className="text-2xl font-display font-bold text-[var(--text-primary)] mt-2 block tabular-nums">
            {summary?.dataSources?.active || dataStream?.activeSources || 2}/{summary?.dataSources?.total || dataStream?.totalSources || 2}
          </span>
          <span className="text-[11px] font-semibold text-[var(--positive)] mt-1 block">Airlines Active</span>
        </div>
      </div>

      {/* Main Chart Section & Switchers */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] my-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)] font-sans">
          <div>
            <span className="text-xs font-semibold text-[var(--accent)] tracking-wider uppercase block">
              HISTORICAL TREND // COMPOSITE INDEX
            </span>
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mt-0.5">
              India Airfare Movement Over Time
            </h2>
          </div>

          {/* Range Selector: 24H, 7D, 30D */}
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] font-sans">
            {(['24H', '7D', '30D'] as const).map((r) => (
              <button
                key={r}
                id={`dashboard-range-${r.toLowerCase()}`}
                onClick={() => setTrendRange(r)}
                className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  trendRange === r
                    ? 'bg-[var(--nav-active-pill)] border border-[var(--accent-border)] text-[var(--accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="h-72 sm:h-80 w-full mt-4">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[var(--text-muted)]">
              AWAITING HISTORICAL SNAPSHOTS FROM DATABASE
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeConfig.accent} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={themeConfig.accent} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.border} vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="label"
                  stroke={themeConfig.textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={themeConfig.textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(v) => Number(v).toFixed(0)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: themeConfig.surfaceElevated,
                    borderColor: themeConfig.border,
                    borderRadius: '12px',
                    boxShadow: 'var(--card-shadow)',
                    fontSize: '12px',
                    color: themeConfig.textPrimary,
                  }}
                  formatter={(val: any) => [val != null && !isNaN(Number(val)) ? `${Number(val).toFixed(2)} Points` : '—', 'Index Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={themeConfig.accent}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#indexGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Corridors Table */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] my-8 font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
              Top Route Movements
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              Click any route to inspect advance purchase curves, airline breakdown, and statistical distribution.
            </p>
          </div>
          <Link
            to="/routes"
            id="view-all-routes-btn"
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline"
          >
            <span>VIEW ALL ROUTES</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="text-[var(--text-secondary)] border-b border-[var(--border)] text-[11px] uppercase font-semibold">
                <th className="pb-3">Corridor Pair</th>
                <th className="pb-3">Route Name</th>
                <th className="pb-3">Current Fare</th>
                <th className="pb-3">Route Index</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">24H Change</th>
                <th className="pb-3">7D Change</th>
                <th className="pb-3 text-right">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-sans">
              {topRoutes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--text-muted)] font-mono">
                    NO ROUTE CORRIDORS LOGGED YET
                  </td>
                </tr>
              ) : (
                topRoutes.slice(0, 10).map((r) => {
                  const flightRoute = mapRouteSummaryToFlightRoute(r);
                  return (
                    <tr
                      key={r.route}
                      onClick={() => navigate(`/routes/${flightRoute.slug}`)}
                      className="hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] font-mono">
                        {r.route}
                      </td>
                      <td className="py-3.5 text-[var(--text-secondary)] font-medium">
                        {r.routeName}
                      </td>
                      <td className="py-3.5 font-bold text-[var(--text-primary)] tabular-nums">
                        ₹{r.currentFare != null ? r.currentFare.toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 text-[var(--accent)] font-semibold tabular-nums">
                        {(r.index ?? 100).toFixed(1)}
                      </td>
                      <td className="py-3.5 text-[var(--text-secondary)] tabular-nums font-mono">
                        {((r.weight ?? 0.05) * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 tabular-nums">
                        <span
                          className={`font-semibold ${
                            r.change24h && r.change24h > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'
                          }`}
                        >
                          {r.change24h && r.change24h > 0 ? '+' : ''}
                          {r.change24h || 0}%
                        </span>
                      </td>
                      <td className="py-3.5 tabular-nums">
                        <span
                          className={`font-semibold ${
                            r.change7d && r.change7d > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'
                          }`}
                        >
                          {r.change7d && r.change7d > 0 ? '+' : ''}
                          {r.change7d || 0}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--accent)] flex items-center justify-end gap-1 font-semibold">
                          <span>INSPECT</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Stream Telemetry Footer */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--positive)] animate-ping" />
          <div>
            <span className="text-[var(--text-primary)] font-bold">DATA STREAM: {dataStream?.status || 'LIVE'}</span>
            <span className="text-[var(--text-secondary)] font-medium ml-2">
              Last sync: {dataStream?.lastCollection ? new Date(dataStream.lastCollection).toLocaleTimeString() : 'Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[var(--text-secondary)] font-medium">
          <Link to="/data" className="text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline font-bold">
            OPEN DATA EXPLORER & PIPELINE AUDIT →
          </Link>
        </div>
      </div>
    </div>
  );
};
