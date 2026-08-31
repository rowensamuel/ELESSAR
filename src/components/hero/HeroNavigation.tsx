import React, { useState, useEffect } from 'react';
import { Compass, Globe2, Activity, Radio, ChevronRight } from 'lucide-react';
import { AirfareLogo } from '../common/AirfareLogo';

interface HeroNavigationProps {
  activeSection: number;
  onNavigateSection: (section: number) => void;
  onOpenTerminal: () => void;
}

export const HeroNavigation: React.FC<HeroNavigationProps> = ({
  activeSection,
  onNavigateSection,
  onOpenTerminal,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: '01 NETWORK', index: 0 },
    { label: '02 AIRPORTS', index: 1 },
    { label: '03 ROUTES', index: 2 },
    { label: '04 FARES', index: 3 },
    { label: '05 INDEX', index: 4 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-auto border-b border-slate-800/60 bg-[#0B0E14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Telemetry Mark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            <AirfareLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-[0.05em] text-white">
                AIRFARE INDEX
              </span>
              <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-semibold">
                v2.6.4
              </span>
            </div>
            <p className="text-[10px] font-sans text-slate-400 font-medium tracking-tight hidden sm:block">
              INDIA DOMESTIC AVIATION INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Story Section Stepper */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-md border border-slate-800 font-sans">
          {navItems.map((item) => {
            const isActive = activeSection === item.index;
            return (
              <button
                key={item.index}
                id={`nav-step-${item.index}`}
                onClick={() => onNavigateSection(item.index)}
                className={`px-3 py-1.5 rounded text-[11px] font-sans tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Telemetry Status & Action */}
        <div className="flex items-center gap-3 font-sans">
          {/* UTC Clock */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-sans text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 font-medium">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="tabular-nums">{utcTime || '2026-08-29 09:20:00 UTC'}</span>
          </div>

          {/* Real-time Status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-sans font-semibold px-2 py-1 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>FEED ACTIVE</span>
          </div>

          {/* Main Action CTA */}
          <button
            id="nav-explore-index-btn"
            onClick={onOpenTerminal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-amber-400 text-slate-950 font-sans text-xs font-bold hover:bg-amber-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            <span>INDEX FEED</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
