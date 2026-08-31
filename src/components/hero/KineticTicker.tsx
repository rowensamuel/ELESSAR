import React from 'react';
import { TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';

interface KineticTickerProps {
  onSelectItem?: (pair: string) => void;
}

const KineticTickerComponent: React.FC<KineticTickerProps> = ({ onSelectItem }) => {
  return (
    <div className="relative w-full z-30 overflow-hidden pointer-events-auto bg-[var(--surface)]/95 border-t border-[var(--border)] backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-2.5">
        
        {/* Institutional 5-Metric Strip */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs font-sans">
          
          {/* 1. AIRFARE INDEX (INDIA) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide">
              AIRFARE INDEX (INDIA):
            </span>
            <span className="text-[var(--text-primary)] font-semibold tracking-tight tabular-nums">
              116.84 PTS
            </span>
            <span className="flex items-center text-[11px] font-semibold text-[var(--positive)] tabular-nums">
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              +2.41%
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-3.5 bg-[var(--border)] flex-shrink-0" />

          {/* 2. DGCA DOMESTIC VOLUME */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide">
              DGCA DOMESTIC VOLUME:
            </span>
            <span className="text-[var(--text-primary)] font-semibold tabular-nums">
              12,842 OBS
            </span>
            <span className="flex items-center text-[11px] font-semibold text-[var(--positive)]">
              <CheckCircle2 className="w-3 h-3 mr-0.5 inline" />
              100% HEALTH
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-3.5 bg-[var(--border)] flex-shrink-0" />

          {/* 3. DECCAN TECH CORRIDOR */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide">
              DECCAN TECH CORRIDOR:
            </span>
            <span className="text-[var(--text-primary)] font-semibold tabular-nums">
              104.8 PTS
            </span>
            <span className="flex items-center text-[11px] font-semibold text-[var(--positive)] tabular-nums">
              <TrendingDown className="w-3 h-3 mr-0.5 inline" />
              -1.8%
            </span>
          </div>

          <div className="hidden lg:block w-[1px] h-3.5 bg-[var(--border)] flex-shrink-0" />

          {/* 4. METRO-TO-METRO TRUNK */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide">
              METRO-TO-METRO TRUNK:
            </span>
            <span className="text-[var(--text-primary)] font-semibold tabular-nums">
              114.2 PTS
            </span>
            <span className="flex items-center text-[11px] font-semibold text-[var(--negative)] tabular-nums">
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              +3.2%
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-3.5 bg-[var(--border)] flex-shrink-0" />

          {/* 5. LAST UPDATED / STATUS */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide">
              LAST UPDATED:
            </span>
            <span className="text-[var(--text-secondary)] font-medium">
              30 sec ago
            </span>
            <span className="flex items-center text-[10px] font-semibold tracking-wider text-[var(--positive)] px-1.5 py-0.5 rounded bg-[var(--positive)]/10 border border-[var(--positive)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)] animate-pulse mr-1" />
              LIVE
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
export const KineticTicker = React.memo(KineticTickerComponent);
