import React from 'react';

interface AirfareLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'icon' | 'full' | 'inline';
  showText?: boolean;
}

export const AirfareLogo: React.FC<AirfareLogoProps> = ({
  className = '',
  size = 36,
  variant = 'icon',
  showText = false,
}) => {
  const renderIcon = () => (
    <svg
      viewBox="0 0 500 370"
      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoWingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="60%" stopColor="var(--accent-hover)" />
          <stop offset="100%" stopColor="var(--text-secondary)" />
        </linearGradient>
        <linearGradient id="logoRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="var(--text-secondary)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--surface-elevated)" />
        </linearGradient>
        <linearGradient id="logoChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--text-secondary)" />
          <stop offset="100%" stopColor="var(--text-muted)" />
        </linearGradient>
        <linearGradient id="logoPlaneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--text-primary)" />
          <stop offset="50%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-hover)" />
        </linearGradient>
      </defs>

      {/* Circular Frame */}
      <path
        d="M 285 70 C 180 70 145 145 145 200 C 145 275 210 320 275 320 C 345 320 385 265 385 220 C 385 200 378 182 368 165 C 367 175 365 190 360 205 C 345 250 305 290 260 290 C 190 290 162 235 162 185 C 162 135 200 95 285 95 C 315 95 342 105 360 120 C 352 100 325 70 285 70 Z"
        fill="url(#logoRingGradient)"
      />

      {/* Wing Feathers */}
      <path
        d="M 75 110 C 120 120 180 165 195 210 C 170 195 130 170 85 160 C 72 157 65 135 75 110 Z"
        fill="url(#logoWingGradient)"
      />
      <path
        d="M 95 148 C 135 160 185 200 195 235 C 170 220 135 200 98 190 C 88 187 85 170 95 148 Z"
        fill="url(#logoWingGradient)"
      />
      <path
        d="M 118 185 C 150 198 188 230 194 255 C 175 242 145 228 118 220 C 108 218 108 202 118 185 Z"
        fill="url(#logoWingGradient)"
      />

      {/* Ascending 4 Bars */}
      <rect x="202" y="202" width="22" height="60" rx="3" fill="url(#logoChartGradient)" />
      <rect x="232" y="176" width="22" height="86" rx="3" fill="url(#logoChartGradient)" />
      <rect x="262" y="146" width="22" height="116" rx="3" fill="url(#logoChartGradient)" />
      <rect x="292" y="120" width="22" height="142" rx="3" fill="url(#logoChartGradient)" />

      {/* Flight Arc */}
      <path
        d="M 172 248 C 220 290 270 275 320 210 C 355 165 390 105 418 60 C 400 95 350 165 305 210 C 265 252 215 265 172 248 Z"
        fill="var(--accent)"
      />

      {/* Soaring Jet */}
      <g transform="translate(390, 95) rotate(42) scale(0.95)">
        <path
          d="M 0 -38 C 4 -38 7 -25 7 15 L 7 28 L 2 34 L -2 34 L -7 28 L -7 15 C -7 -25 -4 -38 0 -38 Z"
          fill="url(#logoPlaneGradient)"
        />
        <path
          d="M 0 -8 L 36 12 L 36 18 L 0 5 L -36 18 L -36 12 Z"
          fill="url(#logoPlaneGradient)"
        />
        <path
          d="M 0 22 L 15 31 L 15 34 L 0 30 L -15 34 L -15 31 Z"
          fill="url(#logoPlaneGradient)"
        />
      </g>
    </svg>
  );

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div style={{ width: size, height: size }}>{renderIcon()}</div>
        <div className="mt-2 text-center">
          <div className="font-display font-black text-lg tracking-[0.25em] text-[var(--text-primary)]">
            AIRFARE
          </div>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="h-px w-6 bg-[var(--border)]" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-[var(--text-secondary)]">
              INDEX
            </span>
            <span className="h-px w-6 bg-[var(--border)]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline' || showText) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {renderIcon()}
        </div>
        <div className="flex flex-col">
          <div className="font-display font-black text-sm tracking-[0.18em] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
            AIRFARE
          </div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="h-[1px] w-3 bg-[var(--border)] group-hover:bg-[var(--accent)]/60 transition-colors" />
            <span className="text-[9px] font-bold tracking-[0.25em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              INDEX
            </span>
            <span className="h-[1px] w-3 bg-[var(--border)] group-hover:bg-[var(--accent)]/60 transition-colors" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {renderIcon()}
    </div>
  );
};
