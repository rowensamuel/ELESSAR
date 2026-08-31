/**
 * India Airfare Intelligence & CPI Augmentation API
 * TypeScript Type Definitions conforming to API_ROUTES.md specification.
 */

// =========================================================================
//  Standard API Response Wrappers
// =========================================================================
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  query?: string;
  status?: string;
  [key: string]: any;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =========================================================================
//  Airfare Index & Health
// =========================================================================
export interface HealthStatus {
  status: string;
  service: string;
  database: 'connected' | 'standalone' | string;
  timestamp: string;
}

export interface AirfareIndexSummary {
  value: number;
  baseValue: number;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  referenceYear: number;
  basePeriod: {
    start: string;
    end: string;
  };
  calculatedAt: string;
}

export interface IndexHistoryPoint {
  timestamp: string;
  value: number;
}

export interface IndexHistoryData {
  period: string;
  granularity: string;
  points: IndexHistoryPoint[];
}

// =========================================================================
//  Route & Dashboard Models
// =========================================================================
export interface RouteSummaryItem {
  route: string;
  origin: string;
  destination: string;
  routeName: string;
  currentFare: number;
  baseFare: number;
  index: number;
  weight: number;
  passengerVolume: number;
  contribution: number;
  observations: number;
  change24h: number | null;
  change7d: number | null;
}

export interface DashboardData {
  summary: {
    indiaAirfareIndex: number;
    baseIndex: number;
    change24h: number | null;
    change7d: number | null;
    change30d: number | null;
    routesTracked: number;
    fareObservations: number;
    dataSources: {
      active: number;
      total: number;
    };
    lastUpdated: string;
  };
  trend: IndexHistoryPoint[];
  topRoutes: RouteSummaryItem[];
  dataStream: {
    status: 'LIVE' | 'MOCK' | string;
    lastCollection: string;
    observations: number;
    activeSources: number;
    totalSources: number;
  };
  warnings: Array<{ route: string; reason: string }>;
}

export interface RouteDetail {
  route: string;
  origin: { code: string; city: string };
  destination: { code: string; city: string };
  currentFare: number;
  baseFare: number;
  routeIndex: number;
  weight: number;
  contribution: number;
  passengerVolume: number;
  observations: number;
  change24h: number | null;
  change7d: number | null;
  fareObservations: FareObservation[];
  historicalFare: Array<{ date: string; fare: number }>;
}

export interface RouteHistoryData {
  route: string;
  period: string;
  points: Array<{ timestamp: string; fare: number }>;
}

export interface FareObservation {
  _id?: string;
  source: string;
  airline: string;
  flightNo?: string;
  origin: string;
  destination: string;
  route: string;
  departureDate: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  totalFare: number;
  currency: string;
  scrapedAt: string;
}

// =========================================================================
//  Search Models
// =========================================================================
export interface ProviderComparison {
  status: string;
  observationsCount: number;
  minFare: number | null;
  maxFare: number | null;
  medianFare: number | null;
  meanFare: number | null;
}

export interface SearchResultData {
  source: 'database' | 'fresh_scrape' | 'multi_provider_scrape' | string;
  scraped: boolean;
  state: 'DATABASE_FRESH' | 'SCRAPED' | 'DATABASE_STALE' | 'NO_DATA' | 'SCRAPE_FAILED' | string;
  route?: string;
  observationsCount: number;
  latestScrapedAt?: string;
  priceComparison?: {
    providers: Record<string, ProviderComparison>;
    cheapest: string | null;
    comparedAt: string;
  };
  routeIndexEngine?: {
    engineStatus: string;
    methodology: string;
    route: string;
    routeIndex: number;
    currentRepresentativeFare: number | null;
    baseRepresentativeFare: number | null;
    baseSource: string;
    isBaselineEstablished: boolean;
    weight: number;
    contribution: number;
    passengerVolume: number;
    nationalIndex: number;
    basePeriod: { start: string; end: string };
    fareStats: {
      observationsCount: number;
      validObservationsCount: number;
      medianFare: number | null;
      meanFare: number | null;
      minFare: number | null;
      maxFare: number | null;
    };
  };
  results: any[];
  observations: FareObservation[];
}

// =========================================================================
//  Data Pipeline & Quality Models
// =========================================================================
export interface DataStatus {
  status: 'LIVE' | 'MOCK' | string;
  lastCollection: string;
  observations: number;
  activeSources: number;
  totalSources: number;
  dataQuality: {
    valid: number;
    invalid: number;
  };
  database: 'connected' | 'disconnected' | string;
  totalFareObservations: number;
  observationsToday: number;
  routesTracked: number;
  activeScrapeJobs: number;
}

export interface DataQualityReport {
  totalFareObservations: number;
  validFareObservations: number;
  invalidFareObservations: number;
  routesTracked: number;
  routesMissingHistoricalData: string[];
  routesMissingDGCAData: string[];
  unknownAirportMappings: string[];
  warnings: Array<{
    route: string;
    reason: string;
  }>;
}

// =========================================================================
//  CPI Augmentation Models
// =========================================================================
export interface CpiSummaryData {
  summary: {
    indiaAirfareIndex: number;
    baseIndex: number;
    airfareInflationRate: number;
    transportCpiImpactPercentagePoints: number;
    headlineCpiImpactBasisPoints: number;
    urbanImpactBasisPoints: number;
    ruralImpactBasisPoints: number;
    nowcastGeneralCpi: number;
    effectiveWeightInCpi: number;
    weights: {
      transportGroupInCpi: number;
      airTransportInGroup: number;
      effectiveTotalWeight: number;
    };
    publicationAdvantage: {
      leadTimeDays: number;
      frequency: string;
      officialReleaseFrequency: string;
    };
    calculatedAt: string;
  };
  topCorridorContributors: RouteCpiContribution[];
  recentComparison: CpiComparisonPoint[];
  meta: {
    methodology: string;
    basePeriod: { start: string; end: string };
    referenceYear: number;
    sourcesTracked: string[];
  };
}

export interface RouteCpiContribution {
  route: string;
  routeName: string;
  origin: string;
  destination: string;
  currentFare: number;
  baseFare: number;
  routeIndex: number;
  routeWeightInBasket: number;
  airIndexContribution: number;
  transportGroupContributionPct: number;
  headlineCpiContributionBps: number;
  passengerVolume: number;
}

export interface CpiComparisonPoint {
  month: string;
  generalCpi: number | null;
  transportCpi: number | null;
  airfareCpiOfficial: number | null;
  realTimeNowcast: number | null;
  lagDays: number;
  isNowcast?: boolean;
}

export interface CpiComparisonData {
  series: CpiComparisonPoint[];
  leadTimeAdvantageDays: number;
  frequency: string;
}

export interface CpiDecompositionData {
  totalRoutesTracked: number;
  routes: RouteCpiContribution[];
}

export interface CpiShockSimulation {
  shockPercentage: number;
  simulatedAirfareIndex: number;
  headlineCpiImpactBasisPoints: number;
  transportCpiImpactPercentagePoints: number;
  impliedNationalInflationDelta: number;
}

export interface CpiSimulationResponse {
  currentAirfareIndex: number;
  baselineBaseYear: number;
  shocks: CpiShockSimulation[];
}

// =========================================================================
//  Scraper Models
// =========================================================================
export interface ScraperStatus {
  running: boolean;
  currentJob: string | null;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  observationsCollected: number;
  observationsSaved: number;
  lastChange24h: number;
  lastChange7d: number;
  activeInFlightScrapes: number;
}

export interface ScrapeJob {
  _id: string;
  source: string;
  origin: string;
  destination: string;
  departureDate: string;
  days: number;
  enabled: boolean;
  priority: number;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  lastError?: string;
  lastFare?: number;
  lastChange24h?: number;
  lastChange7d?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScrapeJobParams {
  origin: string;
  destination: string;
  source?: string;
  departureDate?: string;
  days?: number;
  enabled?: boolean;
  priority?: number;
}

export interface UpdateScrapeJobParams {
  enabled?: boolean;
  priority?: number;
  days?: number;
  source?: string;
  departureDate?: string;
}

export interface TriggerScrapeParams {
  jobId?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  days?: number;
  source?: string;
}
