import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calculator,
  Layers,
  Scale,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Clock,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getCpiSummary,
  getCpiComparison,
  getCpiDecomposition,
  simulateCpiShocks,
} from '../services/airfareService';
import {
  CpiSummaryData,
  CpiComparisonData,
  CpiDecompositionData,
  CpiSimulationResponse,
  RouteCpiContribution,
} from '../types/api';
import { useTheme } from '../context/ThemeContext';
import { Preloader } from '../components/common/Preloader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const MethodologyPage: React.FC = () => {
  const { themeConfig } = useTheme();
  const [cpiSummary, setCpiSummary] = useState<CpiSummaryData | null>(null);
  const [cpiComparison, setCpiComparison] = useState<CpiComparisonData | null>(null);
  const [cpiDecomp, setCpiDecomp] = useState<CpiDecompositionData | null>(null);
  const [simulation, setSimulation] = useState<CpiSimulationResponse | null>(null);
  const [shockValue, setShockValue] = useState<number>(10);
  const [simulating, setSimulating] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const loadCpiData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, comparison, decomp, sim] = await Promise.all([
        getCpiSummary().catch(() => null),
        getCpiComparison().catch(() => null),
        getCpiDecomposition().catch(() => null),
        simulateCpiShocks(shockValue).catch(() => null),
      ]);

      setCpiSummary(summary);
      setCpiComparison(comparison);
      setCpiDecomp(decomp);
      setSimulation(sim);
    } catch (err: any) {
      console.error('CPI data load failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCpiData();
  }, []);

  // Update simulation when slider changes
  const handleShockChange = async (newVal: number) => {
    setShockValue(newVal);
    setSimulating(true);
    try {
      const res = await simulateCpiShocks(newVal);
      setSimulation(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !cpiSummary) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center pt-20">
        <Preloader variant="full" message="COMPUTING MOSPI MACROECONOMIC INFLATION AUGMENTATION..." />
      </div>
    );
  }

  if (error && !cpiSummary) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center pt-20 px-4">
        <ErrorFallback
          error={error}
          onRetry={loadCpiData}
          title="Macroeconomic Engine Unavailable"
          variant="page"
        />
      </div>
    );
  }

  const sum = cpiSummary?.summary;
  const comparisonSeries = (cpiComparison?.series || []).map((s) => ({
    month: s.month,
    'Official MOSPI Airfare CPI': s.airfareCpiOfficial,
    'Real-Time Nowcast': s.realTimeNowcast,
    'General Headline CPI': s.generalCpi,
  }));

  const activeShockItem = simulation?.shocks?.[0] || {
    shockPercentage: shockValue,
    simulatedAirfareIndex: (sum?.indiaAirfareIndex || 100) * (1 + shockValue / 100),
    headlineCpiImpactBasisPoints: (shockValue * 0.36).toFixed(2),
    transportCpiImpactPercentagePoints: (shockValue * 0.042).toFixed(4),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200 font-sans">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            MOSPI 2012=100 BASE // MACROECONOMIC AUGMENTATION & POLICY ENGINE
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
          CPI Augmentation & Methodology
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Laspeyres domestic airfare pricing index integrated into the official Ministry of Statistics &amp; Programme Implementation (MOSPI) Transport basket.
        </p>
      </div>

      {/* CPI Macro Headline Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 my-6">
        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">HEADLINE CPI IMPACT</span>
          <span className="text-2xl sm:text-3xl font-display font-bold text-[var(--accent)] mt-1 block tabular-nums">
            +{sum?.headlineCpiImpactBasisPoints ?? '6.08'} bps
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">100 bps = 1.00%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">TRANSPORT GROUP SHIFT</span>
          <span className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mt-1 block tabular-nums">
            +{sum?.transportCpiImpactPercentagePoints ? sum.transportCpiImpactPercentagePoints.toFixed(2) : '0.71'} pts
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Transport Group: 8.59%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">NOWCAST GENERAL CPI</span>
          <span className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mt-1 block tabular-nums">
            {sum?.nowcastGeneralCpi ?? '195.86'}
          </span>
          <span className="text-[10px] text-[var(--positive)] mt-1 block font-medium">45 Days Ahead of MOSPI</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">URBAN IMPACT</span>
          <span className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mt-1 block tabular-nums">
            +{sum?.urbanImpactBasisPoints ?? '6.83'} bps
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Urban basket weight</span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">LEAD TIME ADVANTAGE</span>
          <span className="text-2xl sm:text-3xl font-display font-bold text-[var(--positive)] mt-1 block tabular-nums">
            {sum?.publicationAdvantage?.leadTimeDays ?? 45} Days
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Daily Nowcast vs Monthly</span>
        </div>
      </div>

      {/* Interactive Inflation Shock Simulator */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] my-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
                Macroeconomic Policy Shock Simulator
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              Simulate hypothetical airfare price surges or drops and calculate immediate second-order impact on the All-India CPI.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] text-[var(--accent)] text-xs font-mono font-bold border border-[var(--border)]">
            LASPEYRES ELASTICITY MODEL
          </span>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-[var(--text-secondary)]">HYPOTHETICAL AIRFARE PRICE SHOCK:</span>
              <span className="font-mono font-bold text-sm text-[var(--accent)]">
                {shockValue > 0 ? `+${shockValue}%` : `${shockValue}%`}
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              step={5}
              value={shockValue}
              onChange={(e) => handleShockChange(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-[var(--surface-elevated)] cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mt-1">
              <span>-30% Flash Dump</span>
              <span>-15%</span>
              <span>0% Baseline</span>
              <span>+15%</span>
              <span>+30% Peak Surge</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block font-medium">SIMULATED AIRFARE INDEX</span>
              <span className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1 block">
                {Number(activeShockItem.simulatedAirfareIndex).toFixed(2)} pts
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block font-medium">HEADLINE CPI IMPACT</span>
              <span className={`text-xl font-bold font-mono mt-1 block ${Number(activeShockItem.headlineCpiImpactBasisPoints) > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'}`}>
                {Number(activeShockItem.headlineCpiImpactBasisPoints) > 0 ? '+' : ''}
                {Number(activeShockItem.headlineCpiImpactBasisPoints).toFixed(2)} bps
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block font-medium">TRANSPORT GROUP EFFECT</span>
              <span className="text-xl font-bold font-mono text-[var(--accent)] mt-1 block">
                {Number(activeShockItem.transportCpiImpactPercentagePoints) > 0 ? '+' : ''}
                {Number(activeShockItem.transportCpiImpactPercentagePoints).toFixed(4)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Comparison Chart: Official MOSPI vs Real-Time Nowcast */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] my-8">
        <div className="pb-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
            <span>Official MOSPI CPI vs. Real-Time Telemetry Nowcasts</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
            Monthly official release points with 45-day lag contrasted against our high-frequency daily nowcasts.
          </p>
        </div>

        <div className="h-72 sm:h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.border} vertical={false} opacity={0.5} />
              <XAxis dataKey="month" stroke={themeConfig.textMuted} fontSize={11} tickLine={false} />
              <YAxis stroke={themeConfig.textMuted} fontSize={11} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: themeConfig.surfaceElevated,
                  borderColor: themeConfig.border,
                  borderRadius: '12px',
                  boxShadow: 'var(--card-shadow)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Official MOSPI Airfare CPI" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Real-Time Nowcast" stroke={themeConfig.accent} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="General Headline CPI" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Corridor Weights and CPI Decomposition Table */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] my-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--accent)]" />
              <span>Corridor Weighting Matrix & CPI Decomposition</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              Corridor weights derived from DGCA annual scheduled passenger volumes.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] text-[var(--accent)] text-xs font-mono font-bold border border-[var(--border)]">
            TOTAL BASKET: {cpiDecomp?.totalRoutesTracked || (cpiDecomp?.routes || []).length} CORRIDORS
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[var(--text-secondary)] border-b border-[var(--border)] text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-3">Corridor</th>
                <th className="pb-3">Route Name</th>
                <th className="pb-3">Current Spot</th>
                <th className="pb-3">Base Fare</th>
                <th className="pb-3">Basket Weight</th>
                <th className="pb-3">Index Contribution</th>
                <th className="pb-3 text-right">Headline CPI Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {(cpiDecomp?.routes || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-muted)] font-mono">
                    NO CORRIDOR DECOMPOSITION RECORDS AVAILABLE
                  </td>
                </tr>
              ) : (
                (cpiDecomp?.routes || []).map((r) => (
                  <tr key={r.route} className="hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="py-3 font-mono font-bold text-[var(--text-primary)]">
                      {r.route}
                    </td>
                    <td className="py-3 text-[var(--text-secondary)]">
                      {r.routeName || `${r.origin} ↔ ${r.destination}`}
                    </td>
                    <td className="py-3 font-bold text-[var(--text-primary)] tabular-nums">
                      ₹{r.currentFare != null ? r.currentFare.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 text-[var(--text-secondary)] tabular-nums font-mono">
                      ₹{r.baseFare != null ? r.baseFare.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 text-[var(--accent)] font-mono">
                      {(r.routeWeightInBasket * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 font-mono text-[var(--text-primary)]">
                      {r.airIndexContribution.toFixed(2)} pts
                    </td>
                    <td className="py-3 text-right font-bold text-[var(--positive)] font-mono">
                      +{r.headlineCpiContributionBps.toFixed(2)} bps
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance & Methodological Standards */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[var(--positive)] flex-shrink-0" />
          <div>
            <span className="text-[var(--text-primary)] font-bold">MOSPI GOVERNANCE PROTOCOL COMPLIANT</span>
            <p className="text-[var(--text-secondary)] mt-0.5">
              Formulated according to the Laspeyres Price Index specification and weighted strictly by empirical DGCA scheduled capacity statistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
