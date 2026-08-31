import React, { useState, useEffect } from 'react';
import { Compass, Crosshair } from 'lucide-react';

export const RadarWidget: React.FC = () => {
  const [heading, setHeading] = useState(284);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeading((prev) => (prev + 1) % 360);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative group p-3 rounded-xl bg-[#0B0F17]/85 border border-slate-800 hover:border-amber-400/50 shadow-2xl backdrop-blur-md transition-all duration-300 font-sans">
      <div className="flex items-center gap-3">
        {/* Radar Circular Bezel */}
        <div className="relative w-14 h-14 rounded-full border border-amber-400/40 bg-[#06090F] flex items-center justify-center overflow-hidden shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]">
          
          {/* Concentric distance rings */}
          <div className="absolute inset-1.5 rounded-full border border-slate-800" />
          <div className="absolute inset-3.5 rounded-full border border-slate-800/60" />

          {/* Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-slate-800/80" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-[1px] bg-slate-800/80" />
          </div>

          {/* Rotating Radar Sweep Line */}
          <div
            className="absolute inset-0 animate-radar-sweep origin-center pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(245, 158, 11, 0.4) 100%)',
            }}
          />

          {/* Blip Target Node */}
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] animate-ping" />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-amber-400" />

          {/* Center Point */}
          <div className="w-1.5 h-1.5 rounded-full bg-white z-10" />
        </div>

        {/* Telemetry Labels */}
        <div className="text-[10px] space-y-0.5 font-sans">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wider uppercase">
            <span>RADAR NAV</span>
            <span className="text-[8px] px-1 py-0.2 rounded bg-amber-400/20 font-semibold">LOCK</span>
          </div>
          <div className="text-slate-200 font-bold text-xs">
            AIRFARE INDEX
          </div>
          <div className="text-slate-400 flex items-center gap-2 font-medium">
            <span>INDIA</span>
            <span className="text-slate-600">·</span>
            <span>2026</span>
          </div>
          <div className="text-slate-500 text-[9px] font-medium tabular-nums">
            HDG: {heading.toString().padStart(3, '0')}° / 34,000 FT
          </div>
        </div>
      </div>
    </div>
  );
};
