import React, { useState } from 'react';
import {
  Search,
  X,
  Plane,
  TrendingUp,
  Scale,
  Building,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { searchFares } from '../../services/airfareService';
import { SearchResultData } from '../../types/api';
import { Preloader } from '../common/Preloader';
import { ErrorFallback } from '../common/ErrorFallback';

interface LiveFareSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveFareSearchModal: React.FC<LiveFareSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('DEL-BOM');
  const [searchResult, setSearchResult] = useState<SearchResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await searchFares(query);
      setSearchResult(res);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const comparison = searchResult?.priceComparison;
  const providers = comparison?.providers || {};
  const engine = searchResult?.routeIndexEngine;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
                Live Flight Fare Search &amp; Price Comparison
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Database-first lookup with automated on-demand web scraping for fresh fare intelligence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter corridor (e.g. BOM-DEL, Mumbai to Delhi, SpiceJet DEL-BOM)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-medium"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60 shadow-md"
          >
            {loading ? 'LOOKING UP...' : 'SEARCH'}
          </button>
        </form>

        {/* Preloader / Error / Results */}
        {loading ? (
          <Preloader
            variant="card"
            message="QUERYING DATABASE & DISPATCHING ON-DEMAND SCRAPERS..."
          />
        ) : error ? (
          <ErrorFallback
            error={error}
            onRetry={handleSearch as any}
            title="Corridor Search Unsuccessful"
            variant="card"
          />
        ) : searchResult ? (
          <div className="space-y-5">
            {/* Status & Freshness Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    searchResult.state === 'DATABASE_FRESH'
                      ? 'bg-[var(--positive)] animate-ping'
                      : 'bg-[var(--accent)] animate-spin'
                  }`}
                />
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  STATUS: {searchResult.state}
                </span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-secondary)]">
                  {searchResult.scraped ? 'Freshly Scraped via Puppeteer' : 'Served from Database Cache'}
                </span>
              </div>
              <span className="font-mono text-[var(--accent)] font-semibold">
                {searchResult.observationsCount} Fares Analyzed
              </span>
            </div>

            {/* Provider Price Comparison */}
            {Object.keys(providers).length > 0 && (
              <div>
                <h3 className="text-xs font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                  AIRLINE PRICE COMPARISON &amp; SPREAD
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(providers).map(([providerName, stats]) => {
                    const isCheapest = comparison?.cheapest === providerName;
                    return (
                      <div
                        key={providerName}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCheapest
                            ? 'bg-[var(--surface-elevated)] border-[var(--accent)]/60 shadow-md'
                            : 'bg-[var(--surface-subtle)] border-[var(--border)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>{providerName}</span>
                          </span>
                          {isCheapest && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--positive-subtle)] text-[var(--positive)] border border-[var(--positive)]/30 text-[10px] font-bold uppercase">
                              CHEAPEST
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-[var(--border)]">
                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block">MIN</span>
                            <span className="font-bold text-[var(--positive)]">
                              ₹{stats.minFare?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block">MEDIAN</span>
                            <span className="font-bold text-[var(--text-primary)]">
                              ₹{stats.medianFare?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block">MAX</span>
                            <span className="font-bold text-[var(--text-secondary)]">
                              ₹{stats.maxFare?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Route Index Engine Metrics */}
            {engine && (
              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="font-bold text-xs text-[var(--accent)] font-mono uppercase">
                    ROUTE INDEX ENGINE // {engine.route}
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono">
                    Methodology: Laspeyres
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">ROUTE INDEX</span>
                    <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                      {engine.routeIndex.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">REPRESENTATIVE FARE</span>
                    <span className="text-xl font-bold font-mono text-[var(--accent)]">
                      ₹{engine.currentRepresentativeFare?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">BASE FARE</span>
                    <span className="text-xl font-bold font-mono text-[var(--text-secondary)]">
                      ₹{engine.baseRepresentativeFare?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">BASKET WEIGHT</span>
                    <span className="text-xl font-bold font-mono text-[var(--positive)]">
                      {(engine.weight * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scraped Observations Sample */}
            <div>
              <h3 className="text-xs font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                INGESTED OBSERVATIONS ({searchResult.observations.length})
              </h3>
              <div className="max-h-52 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="text-[var(--text-secondary)] border-b border-[var(--border)] text-[10px] uppercase font-semibold">
                      <th className="p-2.5">Carrier</th>
                      <th className="p-2.5">Flight</th>
                      <th className="p-2.5">Dep Date</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5 text-right">Fare (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {searchResult.observations.slice(0, 10).map((obs, i) => (
                      <tr key={i} className="hover:bg-[var(--surface-elevated)]">
                        <td className="p-2.5 font-medium">{obs.airline}</td>
                        <td className="p-2.5 font-mono text-[var(--accent)]">{obs.flightNo || '—'}</td>
                        <td className="p-2.5 text-[var(--text-secondary)]">
                          {obs.departureDate ? new Date(obs.departureDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-2.5 text-[var(--text-secondary)] font-mono">{obs.departureTime || '—'}</td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          ₹{obs.totalFare != null ? obs.totalFare.toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
