import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  Ticket,
  Activity,
  Search,
  Plane,
  AlertTriangle,
  Database,
  Calculator,
  Compass,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { AIRPORTS } from '../../data/airports';
import { getRoutes, getIndexHistory, getAnomalies } from '../../services/airfareService';
import { Airport, FlightRoute, Anomaly } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ScrollStoryProps {
  activeSection: number;
  onSelectAirport: (airport: Airport) => void;
  onSelectRoute: (route: FlightRoute) => void;
  onNavigateSection: (section: number) => void;
}

// Sophisticated, smooth cubic-bezier easing
const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

// Common reveal animation variants for scroll sections (supports bidirectional scroll)
const sectionHeadingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: CUBIC_EASE },
  },
};

const sectionTextVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: 0.1, ease: CUBIC_EASE },
  },
};

const sectionContentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: 0.18, ease: CUBIC_EASE },
  },
};

const ScrollStoryComponent: React.FC<ScrollStoryProps> = ({
  onSelectAirport,
  onSelectRoute,
}) => {
  const { themeConfig } = useTheme();
  const [chartRange, setChartRange] = useState<'24H' | '7D' | '30D' | '3M' | '1Y'>('7D');
  const [searchQuery, setSearchQuery] = useState('');
  const [corridorFilter, setCorridorFilter] = useState<'all' | 'increasing' | 'decreasing'>('all');
  const [routes, setRoutes] = useState<FlightRoute[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [activeIndexHistory, setActiveIndexHistory] = useState<any[]>([]);

  useEffect(() => {
    getRoutes().then(setRoutes).catch(() => {});
    getAnomalies().then(setAnomalies).catch(() => {});
  }, []);

  useEffect(() => {
    getIndexHistory(chartRange.toLowerCase()).then(setActiveIndexHistory).catch(() => {});
  }, [chartRange]);

  const sampleRouteSparkline = useMemo(() => {
    const r = routes[0];
    if (r?.history && Array.isArray(r.history) && r.history.length > 0) {
      return r.history.slice(-14);
    }
    if (r?.historicalFares && Array.isArray(r.historicalFares) && r.historicalFares.length > 0) {
      return r.historicalFares.map((fare, idx) => ({
        date: `Day ${idx + 1}`,
        avgFare: fare,
      }));
    }
    return [
      { date: 'Day 1', avgFare: 4920 },
      { date: 'Day 2', avgFare: 5050 },
      { date: 'Day 3', avgFare: 5180 },
      { date: 'Day 4', avgFare: 5300 },
      { date: 'Day 5', avgFare: 5380 },
      { date: 'Day 6', avgFare: 5420 },
      { date: 'Day 7', avgFare: 5480 },
    ];
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    return (routes || []).filter((r) => {
      const matchesSearch =
        r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fromIata.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.toIata.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fromCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.toCity.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (corridorFilter === 'increasing') return r.trend === 'up';
      if (corridorFilter === 'decreasing') return r.trend === 'down';
      return true;
    });
  }, [routes, searchQuery, corridorFilter]);

  return (
    <div className="relative z-10 w-full pointer-events-none">
      
      {/* =========================================================================
          SECTION 01 — HERO (Clean Editorial Layout with Unobstructed 3D Earth)
          ========================================================================= */}
      <section
        id="section-0"
        className="min-h-screen w-full flex flex-col justify-between px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 pb-12"
      >
        <div className="max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-180px)]">
          
          {/* LEFT COLUMN: Editorial Hero Content */}
          <div className="lg:col-span-6 xl:col-span-5 pointer-events-auto flex flex-col justify-center">
            
            {/* 1. Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: CUBIC_EASE }}
              className="flex items-center gap-2.5 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
                AIRFARE INDEX INDIA · DOMESTIC AVIATION INTELLIGENCE
              </span>
            </motion.div>

            {/* 2. Headline in Zodiak Bold */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: CUBIC_EASE }}
              className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[var(--text-primary)] leading-[0.92] uppercase"
            >
              AIRFARE<br />INDEX
            </motion.h1>

            {/* 3. Subtitle in Plus Jakarta Sans */}
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.22, ease: CUBIC_EASE }}
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--accent)] tracking-tight mt-5 uppercase font-sans"
            >
              THE SUBCONTINENT IN MOTION.
            </motion.h2>

            {/* 4. Description in Plus Jakarta Sans */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.32, ease: CUBIC_EASE }}
              className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] font-normal leading-relaxed max-w-lg font-sans"
            >
              Real-time intelligence for Indian domestic airfares — tracking routes, demand, and price volatility across 34+ major hubs.
            </motion.p>

            {/* 5. CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.42, ease: CUBIC_EASE }}
              className="mt-7 flex flex-wrap items-center gap-3.5"
            >
              <Link
                to="/dashboard"
                id="hero-explore-cta"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-[var(--card-shadow)] hover:shadow-md cursor-pointer"
              >
                <span>Explore Live Index</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/routes"
                id="hero-routes-cta"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                <span>Browse Corridors</span>
              </Link>
            </motion.div>

            {/* 6. Key Statistics Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.52, ease: CUBIC_EASE }}
              className="grid grid-cols-3 gap-4 mt-8 pt-5 border-t border-[var(--border)] max-w-lg font-sans"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight tabular-nums">
                    34+
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Airports
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-[var(--border)] pl-4">
                <Ticket className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight tabular-nums">
                    100M+
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Fare Records
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-[var(--border)] pl-4">
                <Activity className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight">
                    Real-time
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                    Price Intelligence
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Generous Breathing Room for 3D Earth — No Overlays */}
          <div className="lg:col-span-6 xl:col-span-7 hidden lg:flex items-center justify-end min-h-[460px] pointer-events-none" />

        </div>

        {/* Bottom indicator hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: CUBIC_EASE }}
          className="flex items-center justify-between font-sans text-[11px] text-[var(--text-muted)] pointer-events-auto border-t border-[var(--border)] pt-3.5 mt-8 max-w-[1600px] w-full mx-auto"
        >
          <span className="font-mono text-[10px] tracking-wider">
            AIRFARE INDEX // GEO-SPATIAL INTELLIGENCE GRID [INDIA]
          </span>
          <span className="font-medium text-[var(--accent)] flex items-center gap-1.5">
            <span>SCROLL TO EXPLORE CORRIDORS</span>
            <span>↓</span>
          </span>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 02 — DOMESTIC CORRIDORS (Dedicated, Clean, High-Precision Grid)
          ========================================================================= */}
      <section
        id="section-1"
        className="min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-24"
      >
        <div className="max-w-5xl w-full pointer-events-auto">
          
          {/* Eyebrow */}
          <motion.div
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
              SECTION 01 // DOMESTIC ARTERIAL NETWORK
            </span>
          </motion.div>

          {/* Section Heading */}
          <motion.h2
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-none uppercase"
          >
            DOMESTIC CORRIDORS.
          </motion.h2>

          {/* Supporting Text */}
          <motion.p
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans max-w-2xl"
          >
            Live pricing telemetry, 24-hour yield movement, and volatility benchmarks across India&apos;s busiest flight pairs.
          </motion.p>

          {/* Controls: Search & Filter Tabs */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-[var(--card-shadow)] font-sans"
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by city (Mumbai, Delhi) or code (DEL, BOM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[var(--accent)] transition-colors font-sans"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border)] text-xs">
              {(['all', 'increasing', 'decreasing'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCorridorFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                    corridorFilter === filter
                      ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {filter === 'all' ? `All (${routes.length})` : filter}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Route Matrix Cards Grid */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4 font-sans"
          >
            {filteredRoutes.slice(0, 6).map((route, idx) => {
              const isUp = route.trend === 'up';
              return (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
                  transition={{ duration: 0.5, delay: 0.08 * idx, ease: CUBIC_EASE }}
                  onClick={() => onSelectRoute(route)}
                  className="p-4 rounded-2xl bg-[var(--surface)]/95 hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/50 shadow-[var(--card-shadow)] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Origin → Dest */}
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-[var(--accent)]" />
                        <span className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {route.fromIata} → {route.toIata}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold flex items-center tabular-nums px-2 py-0.5 rounded-full ${
                          isUp
                            ? 'bg-[var(--negative-subtle)] text-[var(--negative)]'
                            : 'bg-[var(--positive-subtle)] text-[var(--positive)]'
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3 h-3 mr-1 inline" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1 inline" />
                        )}
                        {isUp ? '+' : ''}{route.priceDeltaPercent}%
                      </span>
                    </div>

                    {/* Route Names */}
                    <div className="mt-2.5 text-xs text-[var(--text-secondary)] font-medium">
                      {route.fromCity} to {route.toCity}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {route.flightDuration} · {route.activeFrequency}
                    </div>
                  </div>

                  {/* Fares & Action */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[var(--text-secondary)] font-medium block">
                        SPOT FARE
                      </span>
                      <span className="text-base font-bold text-[var(--text-primary)] tabular-nums">
                        {route.avgFare}
                      </span>
                    </div>

                    <Link
                      to={`/routes/${route.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>ANALYTICS</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer Link */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-6 flex items-center justify-between text-xs text-[var(--text-secondary)] font-sans"
          >
            <span>Showing {Math.min(filteredRoutes.length, 6)} of {filteredRoutes.length} corridors</span>
            <Link
              to="/routes"
              className="text-[var(--accent)] hover:underline font-semibold flex items-center gap-1.5"
            >
              <span>VIEW ALL {routes.length || 'ACTIVE'} CORRIDORS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 03 — AIRFARE INDEX HERO METRICS & INTERACTIVE TREND
          ========================================================================= */}
      <section
        id="section-2"
        className="min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-24"
      >
        <div className="max-w-3xl pointer-events-auto">
          
          <motion.div
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
              SECTION 02 // NATIONAL AIRFARE BENCHMARK
            </span>
          </motion.div>

          <motion.h2
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-none uppercase"
          >
            INDIA AIRFARE INDEX.
          </motion.h2>

          {/* Large Hero Metric */}
          <motion.div
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex flex-wrap items-baseline gap-4 mt-5 font-sans"
          >
            <span className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)] tabular-nums">
              116.84
            </span>
            <span className="text-base font-bold text-[var(--positive)] flex items-center gap-1 tabular-nums">
              <TrendingUp className="w-5 h-5" />
              +2.41% today
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              (Baseline = 100.0)
            </span>
          </motion.div>

          <motion.p
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal"
          >
            Composite index tracking domestic economy airfares weighted by DGCA passenger volumes across 25+ trunk routes.
          </motion.p>

          {/* Interactive Chart Container */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-6 p-5 sm:p-6 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-[var(--card-shadow)] font-sans"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium">HISTORICAL TIMELINE</span>

              {/* Range Selector: 24H, 7D, 30D, 3M, 1Y */}
              <div className="flex items-center p-0.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-sans">
                {(['24H', '7D', '30D', '3M', '1Y'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-sans ${
                      chartRange === r
                        ? 'bg-[var(--accent)] text-white font-bold shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-44 sm:h-52 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeIndexHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeConfig.accent} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={themeConfig.accent} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke={themeConfig.textSecondary} fontSize={10} tickLine={false} fontFamily="Plus Jakarta Sans" />
                  <YAxis stroke={themeConfig.textSecondary} fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} fontFamily="Plus Jakarta Sans" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: themeConfig.surface,
                      borderColor: themeConfig.accent,
                      borderRadius: '8px',
                      color: themeConfig.textPrimary,
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke={themeConfig.accent} strokeWidth={2.5} fill="url(#heroGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
              <span className="font-medium">Weighted Composite Score</span>
              <Link to="/dashboard" className="text-[var(--accent)] hover:underline font-semibold flex items-center gap-1">
                <span>FULL DASHBOARD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04 — INDIA 3D NETWORK & HUBS
          ========================================================================= */}
      <section
        id="section-2"
        className="min-h-screen w-full flex flex-col justify-center items-end px-4 sm:px-8 lg:px-12 py-24"
      >
        <div className="max-w-xl text-left pointer-events-auto">
          
          <motion.div
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
              SECTION 03 // INDIA 3D FLIGHT NETWORK
            </span>
          </motion.div>

          <motion.h2
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-none uppercase"
          >
            ROUTES CREATE<br />THE MARKET.
          </motion.h2>

          <motion.p
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal"
          >
            Major domestic hubs anchor national price gravity. Color-coded flight arcs signal real-time yield velocity across the subcontinent:
          </motion.p>

          {/* Color Legend Cards */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="grid grid-cols-3 gap-2.5 my-4 font-sans text-xs"
          >
            <div className="p-3 rounded-xl bg-[var(--surface)]/95 border border-[var(--negative)]/30 shadow-[var(--card-shadow)]">
              <span className="text-[var(--negative)] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--negative)]" />
                ROSE
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Fare Surge</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface)]/95 border border-[var(--positive)]/30 shadow-[var(--card-shadow)]">
              <span className="text-[var(--positive)] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--positive)]" />
                EMERALD
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Fare Drop</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[var(--text-secondary)] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                SLATE
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Stable Pricing</span>
            </div>
          </motion.div>

          {/* Interactive Hub Grid */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="space-y-2 font-sans"
          >
            <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold block">
              PRIMARY INDIAN AIRPORTS (CLICK TO FOCUS 3D GLOBE):
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              {AIRPORTS.slice(0, 6).map((airport) => (
                <div
                  key={airport.id}
                  onClick={() => onSelectAirport(airport)}
                  className="p-3 rounded-xl bg-[var(--surface)]/95 hover:bg-[var(--surface-subtle)] border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-all shadow-[var(--card-shadow)] group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--accent)]">
                      {airport.iata}
                    </span>
                    <span
                      className={`text-[10px] font-bold tabular-nums ${
                        airport.trend === 'down' ? 'text-[var(--positive)]' : 'text-[var(--negative)]'
                      }`}
                    >
                      {airport.change24h}%
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5 font-medium">
                    {airport.city}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-6 flex items-center gap-3 font-sans"
          >
            <Link
              to="/map"
              className="px-5 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-[var(--card-shadow)]"
            >
              <span>OPEN 3D MAP EXPLORER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05 — ROUTE ANALYTICS PREVIEW
          ========================================================================= */}
      <section
        id="section-3"
        className="min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-24"
      >
        <div className="max-w-2xl pointer-events-auto">
          
          <motion.div
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
              SECTION 04 // ROUTE ANALYTICS PREVIEW
            </span>
          </motion.div>

          <motion.h2
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-none uppercase"
          >
            CORRIDOR TELEMETRY.
          </motion.h2>

          <motion.p
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal"
          >
            Deep statistical curves, historical ranges, and carrier breakdown for India&apos;s most flown routes.
          </motion.p>

          {/* Featured Route Analytics Card (Mumbai -> Delhi) */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-6 p-5 sm:p-6 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-[var(--card-shadow)] font-sans"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-bold text-[var(--text-primary)] text-base">
                  BOM → DEL · Mumbai to Delhi
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--negative-subtle)] text-[var(--negative)] border border-[var(--negative)]/30 tabular-nums">
                +4.8% (24H)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block font-medium">CURRENT FARE</span>
                <span className="text-xl font-bold text-[var(--text-primary)] mt-1 block tabular-nums">₹5,480</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block font-medium">ROUTE INDEX</span>
                <span className="text-xl font-bold text-[var(--accent)] mt-1 block tabular-nums">114.2</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block font-medium">24H CHANGE</span>
                <span className="text-sm font-bold text-[var(--negative)] mt-1 block tabular-nums">+4.8%</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block font-medium">7D CHANGE</span>
                <span className="text-sm font-bold text-[var(--negative)] mt-1 block tabular-nums">+11.3%</span>
              </div>
            </div>

            {/* Small Fare History Sparkline */}
            <div className="h-28 w-full my-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleRouteSparkline}>
                  <Line type="monotone" dataKey="avgFare" stroke={themeConfig.accent} strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: themeConfig.surface,
                      borderColor: themeConfig.accent,
                      color: themeConfig.textPrimary,
                      fontSize: '11px',
                      fontFamily: 'Plus Jakarta Sans',
                    }}
                    formatter={(v: any) => [`₹${v}`, 'Fare']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                Top carrier: IndiGo · 68 daily flights
              </span>
              <Link
                to="/routes/bom-del"
                className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-[var(--card-shadow)]"
              >
                <span>VIEW ROUTE ANALYTICS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06 — ANOMALY DETECTION PREVIEW
          ========================================================================= */}
      <section
        id="section-4"
        className="min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-24"
      >
        <div className="max-w-3xl pointer-events-auto">
          
          <motion.div
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-2 mb-2"
          >
            <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
              SECTION 05 // ANOMALY DETECTION PREVIEW
            </span>
          </motion.div>

          <motion.h2
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-none uppercase"
          >
            SURGE & FLASH DROP<br />DETECTION.
          </motion.h2>

          <motion.p
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal"
          >
            Real-time algorithmic surveillance identifying price spikes, flash dumps, and statistical outliers across domestic routes:
          </motion.p>

          {/* Anomaly Cards List */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="space-y-3 mt-6 font-sans"
          >
            {anomalies.slice(0, 3).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
                transition={{ duration: 0.5, delay: 0.08 * idx, ease: CUBIC_EASE }}
                className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] hover:border-[var(--accent)]/50 shadow-[var(--card-shadow)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)] text-sm">
                      {item.route}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.severity === 'HIGH'
                          ? 'bg-[var(--negative-subtle)] text-[var(--negative)] border border-[var(--negative)]/30'
                          : 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                    Current: <strong className="text-[var(--text-primary)] tabular-nums font-semibold">₹{item.currentFare != null ? item.currentFare.toLocaleString() : '—'}</strong> · Normal: ₹{item.normalFare != null ? item.normalFare.toLocaleString() : '—'} ({item.airline})
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      item.type === 'SURGE' ? 'text-[var(--negative)]' : 'text-[var(--positive)]'
                    }`}
                  >
                    {item.deviationPercent > 0 ? '+' : ''}
                    {item.deviationPercent}%
                  </span>
                  <Link
                    to={`/routes/${item.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold transition-colors"
                  >
                    INSPECT
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-6 flex items-center gap-3 font-sans"
          >
            <Link
              to="/anomalies"
              className="px-5 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-all shadow-[var(--card-shadow)]"
            >
              <span>VIEW ALL ACTIVE ANOMALIES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 07 — DATA TRANSPARENCY & STATISTICAL PIPELINE
          ========================================================================= */}
      <section
        id="section-5"
        className="min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-24"
      >
        <div className="max-w-4xl pointer-events-auto">
          
          <motion.div
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-2 mb-2"
          >
            <Database className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
              SECTION 06 // DATA TRANSPARENCY
            </span>
          </motion.div>

          <motion.h2
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-none uppercase"
          >
            THE INDEX PIPELINE.
          </motion.h2>

          <motion.p
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal"
          >
            Every score published by the Airfare Index follows a deterministic, 100% reproducible statistical pipeline:
          </motion.p>

          {/* Visual Step-by-Step Flow Diagram */}
          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 my-6 font-sans text-[11px]"
          >
            {[
              { num: '01', title: 'Fare Data', desc: 'GDS & Direct APIs' },
              { num: '02', title: 'Cleaning', desc: '3σ Outliers purged' },
              { num: '03', title: 'Normalization', desc: 'Booking window' },
              { num: '04', title: 'Rep. Fare', desc: 'Median price' },
              { num: '05', title: 'Route Index', desc: 'vs. Base period' },
              { num: '06', title: 'Route Weights', desc: 'DGCA passenger' },
              { num: '07', title: 'National Index', desc: 'Weighted sum', highlight: true },
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
                transition={{ duration: 0.45, delay: 0.06 * idx, ease: CUBIC_EASE }}
                className={`p-3.5 rounded-xl border shadow-[var(--card-shadow)] text-center ${
                  step.highlight
                    ? 'bg-[var(--surface)]/95 border-[var(--accent-border)] col-span-2 sm:col-span-1'
                    : 'bg-[var(--surface)]/95 border-[var(--border)]'
                }`}
              >
                <span className={`font-bold block mb-1 ${step.highlight ? 'text-[var(--positive)]' : 'text-[var(--accent)]'}`}>
                  {step.num}
                </span>
                <span className="text-[var(--text-primary)] font-bold block">
                  {step.title}
                </span>
                <span className="text-[var(--text-secondary)] text-[10px] mt-1 block font-medium">
                  {step.desc}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-3 font-sans"
          >
            <Link
              to="/data"
              className="px-5 py-2.5 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--surface-elevated)] text-[var(--accent)] hover:text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold flex items-center gap-2 transition-all shadow-[var(--card-shadow)]"
            >
              <span>AUDIT RAW OBSERVATIONS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 08 — METHODOLOGY SUMMARY & FORMULAS
          ========================================================================= */}
      <section
        id="section-6"
        className="min-h-screen w-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-24"
      >
        <div className="max-w-4xl pointer-events-auto">
          
          <motion.div
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex items-center gap-2 mb-2"
          >
            <Calculator className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-sans text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
              SECTION 07 // MATHEMATICAL METHODOLOGY
            </span>
          </motion.div>

          <motion.h2
            variants={sectionHeadingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-none uppercase"
          >
            HOW IT WORKS.
          </motion.h2>

          <motion.p
            variants={sectionTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal"
          >
            Transparent price intelligence governed by rigorous statistical formulas:
          </motion.p>

          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-sans text-xs"
          >
            <div className="p-5 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[var(--accent)] font-bold uppercase block mb-2">ROUTE INDEX FORMULA</span>
              <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] text-[var(--text-primary)] font-bold text-center border border-[var(--border)] mb-2 font-sans">
                Route Index = ( Current Fare / Base Fare ) × 100
              </div>
              <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed font-medium">
                Base Index = 100.0 established across normalized domestic baseline.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[var(--positive)] font-bold uppercase block mb-2">NATIONAL INDEX FORMULA</span>
              <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] text-[var(--positive)] font-bold text-center border border-[var(--border)] mb-2 font-sans">
                National Index = ∑ ( Route Indexᵢ × Route Weightᵢ )
              </div>
              <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed font-medium">
                Where ∑ Route Weight = 1.0 based on scheduled DGCA passenger volume.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={sectionContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
            className="flex flex-wrap items-center gap-4 font-sans"
          >
            <Link
              to="/dashboard"
              id="bottom-explore-dashboard-cta"
              className="px-6 py-3.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-2 shadow-[var(--card-shadow)] transition-all cursor-pointer"
            >
              <span>ENTER LIVE DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/methodology"
              id="bottom-methodology-cta"
              className="px-6 py-3.5 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold transition-all cursor-pointer"
            >
              FULL METHODOLOGY DOCUMENTATION
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};
export const ScrollStory = React.memo(ScrollStoryComponent);
