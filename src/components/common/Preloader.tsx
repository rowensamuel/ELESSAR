import React from 'react';
import { Loader2 } from 'lucide-react';

export interface PreloaderProps {
  variant?: 'full' | 'card' | 'table' | 'chart' | 'inline';
  message?: string;
  rows?: number;
  className?: string;
}

export const Preloader: React.FC<PreloaderProps> = ({
  variant = 'card',
  message = 'CONNECTING TO AIRFARE TELEMETRY ENGINE...',
  rows = 5,
  className = '',
}) => {
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
        {message && <span className="uppercase tracking-wider">{message}</span>}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`min-h-[50vh] flex flex-col items-center justify-center p-8 font-sans ${className}`}>
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* Outer Pulsing Radar Ring */}
          <div className="absolute inset-0 rounded-full border border-[var(--accent)]/30 animate-ping opacity-60" />
          {/* Secondary Concentric Ring */}
          <div className="absolute inset-2 rounded-full border border-[var(--accent)]/40 animate-pulse" />
          {/* Rotating Scanner Line */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent)] border-r-[var(--accent)]/60 animate-spin" />
          {/* Inner Core Radar Dot */}
          <div className="w-3 h-3 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-[var(--accent)] tracking-widest uppercase font-mono animate-pulse">
          {message}
        </p>
        <span className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
          AGGREGATING REAL-TIME DGCA & MOSPI BASKETS
        </span>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden font-sans ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-36 rounded-md bg-[var(--border)] animate-pulse" />
          <div className="h-6 w-24 rounded-full bg-[var(--border)] animate-pulse" />
        </div>
        <div className="h-64 w-full flex items-end justify-between gap-2 pt-8 pb-4">
          {[45, 60, 52, 78, 65, 85, 72, 90, 82, 95, 88, 100].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-[var(--border)]/50 animate-pulse"
              style={{ height: `${h}%`, animationDelay: `${i * 75}ms` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 pt-3 border-t border-[var(--border)] text-xs text-[var(--accent)] font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="font-mono text-[11px] tracking-wider">{message}</span>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden font-sans ${className}`}>
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="h-4 w-40 rounded bg-[var(--border)] animate-pulse" />
          <div className="flex items-center gap-2 text-xs text-[var(--accent)] font-mono font-semibold">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>SYNCING RECORDS...</span>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4 animate-pulse" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--border)]" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-[var(--border)]" />
                  <div className="h-2.5 w-20 rounded bg-[var(--border)]/60" />
                </div>
              </div>
              <div className="h-3.5 w-24 rounded bg-[var(--border)] hidden sm:block" />
              <div className="h-4 w-16 rounded bg-[var(--border)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: 'card'
  return (
    <div className={`p-5 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] font-sans ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-28 rounded bg-[var(--border)] animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
      </div>
      <div className="h-8 w-24 rounded bg-[var(--border)] animate-pulse my-2" />
      <div className="h-3 w-36 rounded bg-[var(--border)]/60 animate-pulse mt-2" />
      <div className="flex items-center gap-2 mt-4 text-[10px] text-[var(--accent)] font-mono">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};
