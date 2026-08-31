import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const AtmosphericBackgroundComponent = () => {
  const { theme } = useTheme();
  const isArctic = theme === 'arctic';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700">
      {/* 1. Base Atmospheric Layer with Subtle Soft Gradients */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isArctic ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(ellipse 95% 75% at 75% 42%, rgba(232, 238, 242, 0.85) 0%, rgba(238, 243, 246, 0.45) 50%, rgba(243, 246, 248, 0.2) 80%, transparent 100%),
            radial-gradient(circle at 18% 28%, rgba(238, 243, 246, 0.95) 0%, rgba(243, 246, 248, 0.3) 60%, transparent 100%),
            radial-gradient(ellipse 80% 50% at 50% 90%, rgba(231, 238, 243, 0.7) 0%, transparent 70%),
            #F3F6F8
          `,
        }}
      />

      {/* 2. Midnight Base Atmospheric Layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          !isArctic ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 72% 38%, rgba(17, 23, 30, 0.8) 0%, transparent 70%),
            radial-gradient(circle at 20% 20%, rgba(13, 19, 26, 0.9) 0%, transparent 60%),
            #080B10
          `,
        }}
      />

      {/* 3. Arctic Geospatial Orbital Curves & Faint Data Grid (Extremely Subtle) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isArctic ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Soft Radial Vignette for Earth Area */}
            <radialGradient id="earthHaze" cx="72%" cy="46%" r="42%">
              <stop offset="0%" stopColor="#EEF3F6" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#F3F6F8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F3F6F8" stopOpacity="0" />
            </radialGradient>

            {/* Dotted pattern for hero */}
            <pattern id="arcticDotGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#285474" fillOpacity="0.065" />
            </pattern>

            {/* Faint crosshair */}
            <pattern id="arcticTechGrid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path
                d="M 120 0 L 0 0 0 120"
                fill="none"
                stroke="#285474"
                strokeWidth="0.5"
                strokeOpacity="0.04"
              />
              <path
                d="M 60 56 L 60 64 M 56 60 L 64 60"
                fill="none"
                stroke="#285474"
                strokeWidth="0.5"
                strokeOpacity="0.05"
              />
            </pattern>
          </defs>

          {/* Background Dotted & Technical Grid */}
          <rect width="100%" height="100%" fill="url(#arcticTechGrid)" />
          <rect x="0" y="0" width="800" height="900" fill="url(#arcticDotGrid)" opacity="0.7" />

          {/* Soft White Atmospheric Haze behind Earth */}
          <circle cx="1150" cy="410" r="420" fill="url(#earthHaze)" />

          {/* Orbital Geospatial Curves around Globe Center (1150, 410) */}
          {/* Orbit 1 */}
          <ellipse
            cx="1150"
            cy="410"
            rx="460"
            ry="450"
            fill="none"
            stroke="#285474"
            strokeWidth="0.75"
            strokeOpacity="0.07"
            strokeDasharray="4 8"
            transform="rotate(-15 1150 410)"
          />

          {/* Orbit 2 */}
          <ellipse
            cx="1150"
            cy="410"
            rx="540"
            ry="510"
            fill="none"
            stroke="#285474"
            strokeWidth="0.75"
            strokeOpacity="0.055"
            strokeDasharray="2 12"
            transform="rotate(22 1150 410)"
          />

          {/* Orbit 3 (Larger faint sweep) */}
          <ellipse
            cx="1150"
            cy="410"
            rx="640"
            ry="590"
            fill="none"
            stroke="#285474"
            strokeWidth="0.5"
            strokeOpacity="0.04"
            strokeDasharray="8 16"
            transform="rotate(-35 1150 410)"
          />

          {/* Geospatial Coordinate Markers (Faint telemetry) */}
          <g opacity="0.3" fill="#285474" fontSize="9" fontFamily="Plus Jakarta Sans" fontWeight="600" letterSpacing="0.08em">
            <text x="680" y="140">LAT 28°33&apos;22&quot; N</text>
            <text x="680" y="156">LON 77°06&apos;00&quot; E</text>
            <circle cx="670" cy="144" r="1.5" fill="#285474" fillOpacity="0.4" />

            <text x="1420" y="740">GEO-ORBITAL // 01-E</text>
            <text x="1420" y="754">ALT 34,000 FT</text>
            <circle cx="1410" cy="744" r="1.5" fill="#285474" fillOpacity="0.4" />
          </g>
        </svg>
      </div>

      {/* 4. Precision Technical Grid for Midnight */}
      <div
        className={`absolute inset-0 bg-grid-tech transition-opacity duration-700 ${
          !isArctic ? 'opacity-25' : 'opacity-0'
        }`}
      />
    </div>
  );
};
export const AtmosphericBackground = React.memo(AtmosphericBackgroundComponent);
