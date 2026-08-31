import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route as RouteIcon,
  Flame,
  ArrowUpRight,
  Plane,
  Search,
  Crosshair,
  Plus,
  Minus,
} from 'lucide-react';
import { Scene } from '../components/3d/Scene';
import { AIRPORTS } from '../data/airports';
import { getRoutes } from '../services/airfareService';
import { useApiQuery } from '../hooks/useApiQuery';
import { Preloader } from '../components/common/Preloader';
import { ErrorFallback } from '../components/common/ErrorFallback';
import { Airport, FlightRoute } from '../types';

export const IndiaMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rawRoutes, loading, error, refetch } = useApiQuery(getRoutes, []);
  const routes = rawRoutes || [];

  const [filterType, setFilterType] = useState<
    'all' | 'increasing' | 'decreasing' | 'stable' | 'highest-index' | 'highest-volatility'
  >('all');
  const [selectedHub, setSelectedHub] = useState<string>('ALL');
  const [heatmapMode, setHeatmapMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [hoveredAirport, setHoveredAirport] = useState<Airport | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<FlightRoute | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<FlightRoute | null>(null);

  React.useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0]);
    }
  }, [routes, selectedRoute]);

  const [zoomLevel, setZoomLevel] = useState<number>(4.35);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth) * 2 - 1,
      y: -(clientY / innerHeight) * 2 + 1,
    });
  }, []);

  const handleResetToIndia = () => {
    setSelectedAirport(null);
    setZoomLevel(4.35);
    setResetTrigger((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(3.5, prev - 0.4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(6.2, prev + 0.4));
  };

  // Filtered routes based on selected filter and hub
  const displayedRoutes = useMemo(() => {
    let result = [...routes];

    if (selectedHub !== 'ALL') {
      result = result.filter(
        (r) => r.fromIata === selectedHub || r.toIata === selectedHub
      );
    }

    if (filterType === 'increasing') {
      result = result.filter((r) => r.trend === 'up');
    } else if (filterType === 'decreasing') {
      result = result.filter((r) => r.trend === 'down');
    } else if (filterType === 'stable') {
      result = result.filter((r) => r.trend === 'neutral');
    } else if (filterType === 'highest-index') {
      result.sort((a, b) => b.routeIndex - a.routeIndex);
    } else if (filterType === 'highest-volatility') {
      result.sort(
        (a, b) => Math.abs(b.priceDeltaPercent) - Math.abs(a.priceDeltaPercent)
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.routeName.toLowerCase().includes(q) ||
          r.fromIata.toLowerCase().includes(q) ||
          r.toIata.toLowerCase().includes(q)
      );
    }

    return result;
  }, [routes, filterType, selectedHub, searchQuery]);

  if (loading && routes.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-20 flex items-center justify-center">
        <Preloader variant="full" message="LOADING NATIONAL FLIGHT NETWORK MAP..." />
      </div>
    );
  }

  if (error && routes.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-20 flex items-center justify-center">
        <ErrorFallback error={error} onRetry={refetch} variant="page" title="Unable to Load Corridor Map" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-hidden transition-colors duration-200"
      onMouseMove={handleMouseMove}
    >
      
      {/* 3D WebGL Canvas Layer (Permanent Background) */}
      <div className="absolute inset-0 z-0">
        <Scene
          airports={AIRPORTS}
          routes={displayedRoutes}
          activeSection={2}
          scrollProgress={0.5}
          mousePos={mousePos}
          hoveredAirport={hoveredAirport}
          selectedAirport={selectedAirport}
          hoveredRoute={hoveredRoute}
          selectedRoute={selectedRoute}
          onHoverAirport={setHoveredAirport}
          onSelectAirport={(a) => {
            setSelectedAirport(a);
            setSelectedHub(a.iata);
          }}
          onHoverRoute={setHoveredRoute}
          onSelectRoute={setSelectedRoute}
          isMapPage={true}
          zoomLevel={zoomLevel}
          resetTrigger={resetTrigger}
        />
      </div>

      {/* Floating Top Controls Bar */}
      <div className="absolute top-20 left-4 right-4 sm:left-6 sm:right-6 z-20 pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)]/90 backdrop-blur-xl p-3 rounded-2xl border border-[var(--border)] shadow-[var(--card-shadow)] max-w-7xl mx-auto font-sans">
        
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-sans">
          <span className="text-[var(--text-secondary)] hidden sm:inline mr-1 font-semibold">CORRIDOR FILTER:</span>
          
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[var(--accent)] text-white font-bold'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] font-medium'
            }`}
          >
            All Corridors ({routes.length})
          </button>

          <button
            onClick={() => setFilterType('increasing')}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'increasing'
                ? 'bg-[var(--negative)] text-white font-bold'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] font-medium'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative)]" />
            Increasing
          </button>

          <button
            onClick={() => setFilterType('decreasing')}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'decreasing'
                ? 'bg-[var(--positive)] text-white font-bold'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] font-medium'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
            Decreasing
          </button>

          <button
            onClick={() => setFilterType('stable')}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'stable'
                ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold border border-[var(--border)]'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] font-medium'
            }`}
          >
            Stable
          </button>

          <button
            onClick={() => setFilterType('highest-volatility')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filterType === 'highest-volatility'
                ? 'bg-[var(--accent)] text-white font-bold'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] font-medium'
            }`}
          >
            Highest Volatility
          </button>
        </div>

        {/* Hub Selector & Heatmap Toggle */}
        <div className="flex items-center gap-2 text-xs ml-auto font-sans">
          {/* Hub Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-elevated)] px-3 py-1.5 rounded-full border border-[var(--border)] font-medium">
            <span className="text-[var(--text-secondary)]">HUB:</span>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text-primary)]">All Hubs</option>
              <option value="DEL" className="bg-[var(--surface)] text-[var(--text-primary)]">DEL · Delhi</option>
              <option value="BOM" className="bg-[var(--surface)] text-[var(--text-primary)]">BOM · Mumbai</option>
              <option value="BLR" className="bg-[var(--surface)] text-[var(--text-primary)]">BLR · Bengaluru</option>
              <option value="HYD" className="bg-[var(--surface)] text-[var(--text-primary)]">HYD · Hyderabad</option>
              <option value="MAA" className="bg-[var(--surface)] text-[var(--text-primary)]">MAA · Chennai</option>
              <option value="CCU" className="bg-[var(--surface)] text-[var(--text-primary)]">CCU · Kolkata</option>
              <option value="PNQ" className="bg-[var(--surface)] text-[var(--text-primary)]">PNQ · Pune</option>
              <option value="GOI" className="bg-[var(--surface)] text-[var(--text-primary)]">GOI · Goa</option>
            </select>
          </div>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer font-semibold ${
              heatmapMode
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Price Heatmap</span>
          </button>
        </div>

      </div>

      {/* Floating Left Drawer: Route Explorer / Search */}
      <div className="absolute left-4 bottom-4 top-40 w-80 sm:w-96 z-20 pointer-events-auto flex flex-col bg-[var(--surface)]/90 backdrop-blur-xl rounded-2xl border border-[var(--border)] shadow-[var(--card-shadow)] p-4 hidden md:flex font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Domestic Corridors ({displayedRoutes.length})
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--accent)] border border-[var(--accent-border)]">
            3D SYNCED
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative my-3">
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search BOM, DEL, Goa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-xs font-sans placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-medium"
          />
        </div>

        {/* Scrollable list of routes */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar font-sans">
          {displayedRoutes.map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                onMouseEnter={() => setHoveredRoute(route)}
                onMouseLeave={() => setHoveredRoute(null)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--nav-active-pill)] border-[var(--accent-border)]'
                    : 'bg-[var(--surface-subtle)] border-[var(--border)] hover:bg-[var(--surface-elevated)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)] text-xs">
                      {route.fromIata} → {route.toIata}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                      {route.flightDuration}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] text-xs tabular-nums">
                    {route.avgFare}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-[var(--text-secondary)] truncate max-w-[160px] font-medium">
                    {route.routeName}
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${
                      route.trend === 'up'
                        ? 'text-[var(--negative)]'
                        : route.trend === 'down'
                        ? 'text-[var(--positive)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {route.priceDeltaPercent > 0 ? '+' : ''}
                    {route.priceDeltaPercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)] flex items-center justify-between font-medium">
          <span>COLOR CODED BY YIELD VELOCITY</span>
          <span className="text-[var(--accent)] font-semibold">CLICK TO INSPECT</span>
        </div>
      </div>

      {/* Floating Right Detail Panel: Selected Route Analytics */}
      {selectedRoute && (
        <div className="absolute right-4 bottom-4 w-80 sm:w-96 z-20 pointer-events-auto bg-[var(--surface)]/90 backdrop-blur-xl rounded-2xl border border-[var(--border)] shadow-[var(--card-shadow)] p-5 font-sans">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-[var(--accent)]" />
              <span className="font-bold text-sm text-[var(--text-primary)]">
                {selectedRoute.fromIata} ↔ {selectedRoute.toIata}
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                selectedRoute.trend === 'up'
                  ? 'bg-[var(--negative)]/20 text-[var(--negative)] border border-[var(--negative)]/40'
                  : 'bg-[var(--positive)]/20 text-[var(--positive)] border border-[var(--positive)]/40'
              }`}
            >
              {selectedRoute.trend === 'up' ? 'FARE INCREASING' : 'FARE DECREASING'}
            </span>
          </div>

          <div className="mt-3">
            <h4 className="text-base font-display font-bold text-[var(--text-primary)]">
              {selectedRoute.routeName}
            </h4>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium mt-1">
              <span>{selectedRoute.distanceKm != null ? selectedRoute.distanceKm.toLocaleString() : 1200} km</span>
              <span>•</span>
              <span>{selectedRoute.flightDuration}</span>
              <span>•</span>
              <span>{selectedRoute.activeFrequency}</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 my-4">
            <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block font-medium">CURRENT SPOT FARE</span>
              <span className="text-xl font-display font-bold text-[var(--text-primary)] mt-0.5 block tabular-nums">
                {selectedRoute.avgFare}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block font-medium">ROUTE INDEX</span>
              <span className="text-xl font-display font-bold text-[var(--accent)] mt-0.5 block tabular-nums">
                {selectedRoute.routeIndex}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block font-medium">24H CHANGE</span>
              <span
                className={`text-sm font-semibold mt-0.5 block tabular-nums ${
                  selectedRoute.priceDeltaPercent > 0 ? 'text-[var(--negative)]' : 'text-[var(--positive)]'
                }`}
              >
                {selectedRoute.priceDeltaPercent > 0 ? '+' : ''}
                {selectedRoute.priceDeltaPercent}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-secondary)] block font-medium">7D VOLATILITY</span>
              <span className="text-sm font-semibold text-[var(--accent)] mt-0.5 block tabular-nums">
                {selectedRoute.priceDelta7dPercent > 0 ? '+' : ''}
                {selectedRoute.priceDelta7dPercent}%
              </span>
            </div>
          </div>

          {/* Action Button to Full Route Detail Page */}
          <button
            onClick={() => navigate(`/routes/${selectedRoute.slug}`)}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[var(--card-shadow)] cursor-pointer"
          >
            <span>VIEW FULL ROUTE ANALYTICS</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Map Viewport Controls */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 md:right-[26rem] z-20 pointer-events-auto flex flex-col items-center bg-[var(--surface)]/90 backdrop-blur-xl rounded-2xl border border-[var(--border)] p-1.5 shadow-[var(--card-shadow)] gap-1 font-sans">
        <button
          id="map-recenter-india-btn"
          onClick={handleResetToIndia}
          title="Center on India"
          className="p-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          id="map-zoom-in-btn"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          id="map-zoom-out-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          id="map-reset-3d-btn"
          onClick={handleResetToIndia}
          title="Reset 3D View"
          className="px-2 py-1 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] text-[10px] font-bold transition-all cursor-pointer"
        >
          3D
        </button>
      </div>

      {/* Floating Bottom Legend */}
      <div className="absolute left-4 bottom-4 z-10 pointer-events-none hidden lg:flex items-center gap-4 bg-[var(--surface)]/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] shadow-[var(--card-shadow)] font-sans">
        <span className="text-[var(--text-primary)] font-bold">MAP LEGEND:</span>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--negative)]" />
          <span>Fare Increasing</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--positive)]" />
          <span>Fare Decreasing</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
          <span>Stable</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span>Major Airport Node</span>
        </div>
      </div>

    </div>
  );
};
