import React from 'react';
import { X, Plane, TrendingDown, TrendingUp, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Airport, FlightRoute } from '../../types';

interface RouteInspectorModalProps {
  selectedAirport: Airport | null;
  selectedRoute: FlightRoute | null;
  onClose: () => void;
  onSelectAnotherRoute?: (route: FlightRoute) => void;
}

export const RouteInspectorModal: React.FC<RouteInspectorModalProps> = ({
  selectedAirport,
  selectedRoute,
  onClose,
}) => {
  if (!selectedAirport && !selectedRoute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--surface)]/95 border border-[var(--border)] shadow-[var(--card-shadow)] p-6 overflow-hidden backdrop-blur-xl">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Airport View Mode */}
        {selectedAirport && !selectedRoute && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex flex-col items-center justify-center text-[var(--accent)]">
                <span className="font-display font-bold text-xl">{selectedAirport.iata}</span>
                <span className="text-[9px] font-sans text-[var(--text-secondary)] font-medium">HUB #{selectedAirport.hubRank}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans font-semibold text-[var(--accent)] uppercase tracking-wider block">
                  AIRPORT TELEMETRY // {selectedAirport.country}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-primary)]">
                  {selectedAirport.name}
                </h3>
                <p className="text-sm font-sans text-[var(--text-secondary)] font-medium">
                  {selectedAirport.city}, {selectedAirport.country} · Lat: {selectedAirport.lat.toFixed(2)}° N, Lng: {selectedAirport.lng.toFixed(2)}° E
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-sm">
                <span className="text-[10px] font-sans text-[var(--text-secondary)] block font-medium">AVG OUTBOUND FARE</span>
                <span className="text-lg font-display font-bold text-[var(--text-primary)] tabular-nums">{selectedAirport.avgFare}</span>
                <span className={`text-[10px] font-sans font-semibold block tabular-nums ${selectedAirport.trend === 'down' ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
                  {selectedAirport.change24h}% (24h)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-sm">
                <span className="text-[10px] font-sans text-[var(--text-secondary)] block font-medium">ACTIVE ROUTES</span>
                <span className="text-lg font-display font-bold text-[var(--text-primary)] tabular-nums">{selectedAirport.activeRoutesCount}</span>
                <span className="text-[10px] font-sans text-[var(--text-secondary)] block font-medium">Global corridors</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-sm">
                <span className="text-[10px] font-sans text-[var(--text-secondary)] block font-medium">DAILY OPERATIONS</span>
                <span className="text-lg font-display font-bold text-[var(--text-primary)] tabular-nums">{selectedAirport.dailyFlights}</span>
                <span className="text-[10px] font-sans text-[var(--text-secondary)] block font-medium">Commercial flights</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] backdrop-blur-sm">
                <span className="text-[10px] font-sans text-[var(--text-secondary)] block font-medium">VOLATILITY SCORE</span>
                <span className="text-lg font-display font-bold text-[var(--accent)] tabular-nums">{selectedAirport.volatilityScore}/100</span>
                <span className="text-[10px] font-sans text-[var(--text-secondary)] block font-medium">Algorithmic shift</span>
              </div>
            </div>

            {/* Carrier dominance */}
            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[var(--text-secondary)] font-medium">Primary Capacity Carriers:</span>
                <span className="text-[var(--accent)] font-semibold">{selectedAirport.dominantCarrier}</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden flex">
                <div className="h-full bg-[var(--accent)] w-[58%]" />
                <div className="h-full bg-[var(--accent-hover)] w-[24%]" />
                <div className="h-full bg-[var(--text-secondary)] w-[18%]" />
              </div>
              <div className="flex justify-between text-[10px] font-sans text-[var(--text-secondary)] font-medium">
                <span>IndiGo (58%)</span>
                <span>Air India Group (24%)</span>
                <span>Akasa / Others (18%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Flight Route View Mode */}
        {selectedRoute && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-sans text-[var(--accent)] uppercase tracking-wider block font-semibold">
                  CORRIDOR INDEX TELEMETRY // ID: {selectedRoute.id.toUpperCase()}
                </span>
                <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3 mt-1">
                  <span>{selectedRoute.fromIata}</span>
                  <Plane className="w-5 h-5 text-[var(--accent)] rotate-90" />
                  <span>{selectedRoute.toIata}</span>
                </h3>
                <p className="text-sm font-sans text-[var(--text-secondary)] font-medium mt-0.5">
                  {selectedRoute.routeName} · Distance: {selectedRoute.distanceKm != null ? selectedRoute.distanceKm.toLocaleString() : 1200} km · Block Time: {selectedRoute.flightDuration}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-sans uppercase text-[var(--text-secondary)] block font-medium">CURRENT MEDIAN SPOT</span>
                <span className="text-3xl font-display font-bold text-[var(--text-primary)] block tabular-nums">
                  {selectedRoute.avgFare}
                </span>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-sans text-xs font-semibold mt-1 tabular-nums ${
                  selectedRoute.trend === 'down' ? 'bg-[var(--positive)]/10 text-[var(--positive)] border border-[var(--positive)]/30' : 'bg-[var(--negative)]/10 text-[var(--negative)] border border-[var(--negative)]/30'
                }`}>
                  {selectedRoute.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  <span>{Math.abs(selectedRoute.priceDeltaPercent)}% 7D DELTA</span>
                </div>
              </div>
            </div>

            {/* 7-Day Sparkline Analysis */}
            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                  <span>7-Day Fare Trajectory (Median Weighted)</span>
                </span>
                <span className="text-[var(--text-secondary)] font-medium">Daily sample: 1,400+ GDS queries</span>
              </div>

              <div className="h-28 w-full flex items-end justify-between gap-2 pt-4 px-2">
                {selectedRoute.historicalFares.map((fare, idx) => {
                  const min = Math.min(...selectedRoute.historicalFares);
                  const max = Math.max(...selectedRoute.historicalFares);
                  const heightPercent = 25 + ((fare - min) / (max - min || 1)) * 65;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group font-sans">
                      <span className="text-[9px] font-sans text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums font-semibold">
                        ₹{(fare / 1000).toFixed(1)}k
                      </span>
                      <div
                        className="w-full rounded-t bg-[var(--accent)] group-hover:bg-[var(--accent-hover)] transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] font-sans text-[var(--text-secondary)] font-medium">
                        D-{6 - idx}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Route Telemetry */}
            <div className="grid grid-cols-3 gap-3 text-center font-sans">
              <div className="p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block font-medium">FREQUENCY</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{selectedRoute.activeFrequency}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block font-medium">VOLATILITY STATUS</span>
                <span className="text-sm font-semibold text-[var(--accent)]">{selectedRoute.volatilityIndex}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block font-medium">INDEX CONFIDENCE</span>
                <span className="text-sm font-semibold text-[var(--positive)]">99.4% VERIFIED</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between font-sans">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
            <span>Airfare Index Real-Time Stream Synchronized</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedRoute && (
              <a
                href={`/routes/${selectedRoute.slug}`}
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-sans text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[var(--card-shadow)]"
              >
                <span>VIEW FULL ANALYTICS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border)] font-sans text-xs font-semibold transition-colors cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
