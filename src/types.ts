export interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  avgFare: string;
  avgFareNum: number;
  change24h: number;
  trend: 'up' | 'down' | 'neutral';
  hubRank: number;
  activeRoutesCount: number;
  dailyFlights: number;
  volatilityScore: number; // 0 - 100
  dominantCarrier: string;
  category: 'primary' | 'secondary' | 'regional';
}

export interface FlightRoute {
  id: string;
  slug: string;
  fromIata: string;
  toIata: string;
  fromCity: string;
  toCity: string;
  routeName: string;
  distanceKm: number;
  flightDuration: string;
  avgFare: string;
  avgFareNum: number;
  baseFareNum?: number;
  baseFare?: number;
  routeIndex: number;
  priceDeltaPercent: number;
  priceDelta7dPercent: number;
  trend: 'up' | 'down' | 'neutral';
  historicalFares: number[]; // 7-day sparkline
  history?: { date: string; avgFare: number; volume?: number }[];
  activeFrequency: string;
  volatilityIndex: string;
  routeWeightPercent?: number;
  weight?: number;
  observationsCount: number;
  highlighted?: boolean;
  isHighlighted?: boolean;
  carrierName?: string;
  advancePurchases?: AdvancePurchaseFare[];
  advancePurchaseCurve?: { window: string; fare: number; baseline: number }[];
  airlineFares?: AirlineComparisonFare[];
  airlines?: { airline: string; code: string; avgFare: number; minFare: number; dailyFlights: number; marketShare: number }[];
  stats?: RouteStatistics;
}

export interface AdvancePurchaseFare {
  window: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45' | string;
  fare: number;
  fareFormatted: string;
  normalFare: number;
  deltaPercent: number;
}

export interface AirlineComparisonFare {
  airline: string;
  iataCode: string;
  fare: number;
  fareFormatted: string;
  marketShare: number;
  flightCountDaily: number;
  cabin: string;
}

export interface RouteStatistics {
  medianFare?: number;
  median?: number;
  meanFare?: number;
  mean?: number;
  minFare?: number;
  min?: number;
  maxFare?: number;
  max?: number;
  standardDeviation?: number;
  stdDev?: number;
  p25?: number;
  p75?: number;
  observations: number;
  baseFare: number;
}

export interface IndexHistoryPoint {
  timestamp: string;
  label: string;
  value: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export interface IndexData {
  nationalIndex: number;
  baseIndex: number;
  change24h: number;
  change7d: number;
  change30d: number;
  changePeriod: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  routesTracked: number;
  fareObservations: number;
  dataSources: number;
  lastUpdated: string;
  lastCollectionTime: string;
  status: 'LIVE' | 'SYNCING' | 'OFFLINE';
  activeSources: number;
  totalSources: number;
  topMovements: {
    highestIncrease: { route: string; slug: string; change: number; fare: string };
    highestDecrease: { route: string; slug: string; change: number; fare: string };
    mostVolatile: { route: string; slug: string; volatility: string; fare: string };
  };
}

export interface Anomaly {
  id: string;
  routeId: string;
  route: string;
  routeSlug: string;
  slug: string;
  fromIata: string;
  toIata: string;
  fromCity: string;
  toCity: string;
  observedFare: number;
  currentFare: number;
  observedFareFormatted: string;
  normalFare: number;
  normalFareFormatted: string;
  deviationPercent: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  type: 'SURGE' | 'DROP' | 'VOLATILITY';
  airline: string;
  bookingWindow: string;
  cause: string;
  detectedAt: string;
  detectedTime: string;
  zScore: number;
  reason: string;
  historyTrend: { date: string; fare: number; normal: number }[];
}

export interface FareObservation {
  id: string;
  time: string;
  observedAt: string;
  source: string;
  airline: string;
  flightNumber: string;
  airlineCode: string;
  fromIata: string;
  toIata: string;
  route: string;
  routeSlug: string;
  bookingWindow: string;
  departureDate: string;
  baseFare: number;
  fare: number;
  taxes: number;
  fees: number;
  totalFare: number;
  totalFareFormatted: string;
  quality: 'VALID' | 'CLEANED' | 'OUTLIER_ADJUSTED' | 'DUPLICATE' | 'FLAGGED' | 'REJECTED';
  sourceHealth: 'Active' | 'Degraded' | 'Offline';
}

export interface RouteWeight {
  rank: number;
  routeId: string;
  routeCode: string;
  route: string;
  routeName: string;
  cityPair: string;
  passengerVolumeYearly: string;
  capacityShareASK: string;
  routeSlug: string;
  trafficPercentage: number;
  weightPercent: number;
  weightPercentage: number;
  sampleSize: number;
  category: string;
}

export interface DataQualitySummary {
  totalObservations: number;
  validationRate: number;
  outliersFiltered: number;
  ingestionLatencyMs: number;
  activeCollectors: number;
  valid: number;
  missing: number;
  duplicates: number;
  rejected: number;
  healthScore: number;
  sourceHealth: {
    name: string;
    type: string;
    status: 'Active' | 'Degraded' | 'Syncing';
    lastSync: string;
    latencyMs: number;
    observationsCount: number;
  }[];
}

export interface AirfareDataPod {
  id: string;
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  fare: string;
  delta: number;
  trend: 'up' | 'down';
  volatility: string;
  confidence: number;
  screenPos?: { x: number; y: number; z: number };
}

export type SectionIndex = 0 | 1 | 2 | 3 | 4;

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}
