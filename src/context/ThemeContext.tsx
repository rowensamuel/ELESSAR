import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'midnight' | 'arctic';

export interface ThemeColors {
  id: ThemeMode;
  name: string;
  shortName: string;
  tagline: string;
  bg: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  positive: string;
  negative: string;
  border: string;
  cardBg: string;
  chartAreaFill: string;
  chartStroke: string;
  chartGrid: string;
  isLight: boolean;
  swatches: string[];
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeColors> = {
  midnight: {
    id: 'midnight',
    name: 'MIDNIGHT AVIATION',
    shortName: 'MIDNIGHT',
    tagline: 'Deep navy & aviation gold',
    bg: '#080B10',
    surface: '#11171E',
    surfaceElevated: '#171F29',
    textPrimary: '#F3F1EA',
    textSecondary: '#9AA5B1',
    textMuted: '#64748B',
    accent: '#C6A15B',
    accentHover: '#D4B26F',
    positive: '#4F9B72',
    negative: '#C75B5B',
    border: 'rgba(255, 255, 255, 0.08)',
    cardBg: '#11171E',
    chartAreaFill: 'rgba(198, 161, 91, 0.15)',
    chartStroke: '#C6A15B',
    chartGrid: 'rgba(255, 255, 255, 0.07)',
    isLight: false,
    swatches: ['#080B10', '#11171E', '#C6A15B'],
  },
  arctic: {
    id: 'arctic',
    name: 'ARCTIC AVIATION',
    shortName: 'ARCTIC',
    tagline: 'Cool white & aviation blue',
    bg: '#F3F6F8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#172536',
    textSecondary: '#526577',
    textMuted: '#71808D',
    accent: '#285474',
    accentHover: '#1F435E',
    positive: '#3F765E',
    negative: '#B45C5C',
    border: '#D7E0E6',
    cardBg: '#FFFFFF',
    chartAreaFill: 'rgba(40, 84, 116, 0.12)',
    chartStroke: '#285474',
    chartGrid: 'rgba(40, 84, 116, 0.08)',
    isLight: true,
    swatches: ['#F3F6F8', '#FFFFFF', '#285474'],
  },
};

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themeConfig: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'airfare_index_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'midnight' || saved === 'arctic') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'midnight';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    // Apply data-theme to HTML root
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove('theme-midnight', 'theme-arctic', 'theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    if (THEME_CONFIGS[theme].isLight) {
      root.classList.add('theme-light');
    } else {
      root.classList.add('theme-dark');
    }
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    themeConfig: THEME_CONFIGS[theme],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
