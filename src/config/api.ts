/**
 * AIRFARE INDEX INDIA — Centralized API Configuration
 * Supports environment variable overrides for seamless backend integration.
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT_MS: 0, // Disabled: Do not abort fetch requests on timeout
  ENDPOINTS: {
    // System & Health
    HEALTH: '/health',
    REFRESH: '/refresh',

    // Airfare Index
    INDEX: '/index',
    INDEX_HISTORY: '/index/history',

    // Dashboard
    DASHBOARD: '/dashboard',

    // Route Intelligence
    ROUTES: '/routes',
    ROUTE_DETAIL: (route: string) => `/routes/${encodeURIComponent(route)}`,
    ROUTE_HISTORY: (route: string) => `/routes/${encodeURIComponent(route)}/history`,

    // Search & On-Demand Scraping
    SEARCH: '/search',

    // Data Stream & Quality
    DATA_STATUS: '/data/status',
    DATA_QUALITY: '/data/quality',

    // CPI Augmentation & Macro-Inflation
    CPI: '/cpi',
    CPI_COMPARISON: '/cpi/comparison',
    CPI_DECOMPOSITION: '/cpi/decomposition',
    CPI_SIMULATE: '/cpi/simulate',

    // Scraper Management
    SCRAPER_STATUS: '/scraper/status',
    SCRAPER_RUN: '/scraper/run',
    SCRAPER_JOBS: '/scraper/jobs',
    SCRAPER_JOB_DETAIL: (id: string) => `/scraper/jobs/${id}`,
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Platform': 'AirfareIndex-India-Web',
  },
};
