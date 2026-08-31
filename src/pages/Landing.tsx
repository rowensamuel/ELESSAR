import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from '../components/3d/Scene';
import { SiteHeader } from '../components/navigation/SiteHeader';
import { KineticTicker } from '../components/hero/KineticTicker';
import { ScrollStory } from '../components/hero/ScrollStory';
import { RouteInspectorModal } from '../components/hero/RouteInspectorModal';
import { AtmosphericBackground } from '../components/common/AtmosphericBackground';
import { useHeroScrollProgress } from '../hooks/useHeroScrollProgress';
import { AIRPORTS } from '../data/airports';
import { getRoutes } from '../services/airfareService';
import { Airport, FlightRoute } from '../types';

export const Landing: React.FC = () => {
  // Use high-precision, scroll-driven animation hook
  const {
    smoothHeroProgress,
    smoothPageProgress,
    activeSection,
  } = useHeroScrollProgress({
    heroId: 'section-0',
    sectionCount: 7,
    smoothing: 0.12,
  });

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredAirport, setHoveredAirport] = useState<Airport | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<FlightRoute | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<FlightRoute | null>(null);
  const [routes, setRoutes] = useState<FlightRoute[]>([]);

  useEffect(() => {
    getRoutes().then(setRoutes).catch(() => {});
  }, []);

  // Mouse parallax handler (clamped between -1 and 1)
  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const navigateToSection = useCallback((index: number) => {
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleSelectAirport = useCallback((airport: Airport | null) => {
    setSelectedAirport(airport);
    setSelectedRoute(null);
  }, []);

  const handleSelectRoute = useCallback((route: FlightRoute | null) => {
    setSelectedRoute(route);
    setSelectedAirport(null);
  }, []);

  const handleSelectRouteByPair = useCallback((from: string, to: string) => {
    const matching = routes.find(
      (r) => r.fromIata === from && r.toIata === to
    );
    if (matching) {
      setSelectedRoute(matching);
      setSelectedAirport(null);
    }
  }, [routes]);

  const handleSelectTickerPair = useCallback((pair: string) => {
    const parts = pair.split('→').map((p) => p.trim());
    if (parts.length === 2) {
      handleSelectRouteByPair(parts[0], parts[1]);
    }
  }, [handleSelectRouteByPair]);

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text-primary)] selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)] transition-colors duration-500">
      
      {/* Precision Atmospheric & Geospatial Background */}
      <AtmosphericBackground />

      {/* Persistent 3D Global Flight Network Scene (Earth GLB) */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Scene
          airports={AIRPORTS}
          routes={routes}
          activeSection={activeSection}
          scrollProgress={smoothPageProgress}
          heroScrollProgress={smoothHeroProgress}
          mousePos={mousePos}
          hoveredAirport={hoveredAirport}
          selectedAirport={selectedAirport}
          hoveredRoute={hoveredRoute}
          selectedRoute={selectedRoute}
          onHoverAirport={setHoveredAirport}
          onSelectAirport={handleSelectAirport}
          onHoverRoute={setHoveredRoute}
          onSelectRoute={handleSelectRoute}
        />
      </div>

      {/* Fixed Aerospace Navigation Header */}
      <SiteHeader
        activeSection={activeSection}
        onNavigateSection={navigateToSection}
      />

      {/* Scroll Narrative Chapters 01 to 07 */}
      <main className="relative z-10">
        <ScrollStory
          activeSection={activeSection}
          onSelectAirport={handleSelectAirport}
          onSelectRoute={handleSelectRoute}
          onNavigateSection={navigateToSection}
        />
      </main>

      {/* Continuous Kinetic Ticker Ribbon at bottom */}
      <footer className="sticky bottom-0 left-0 right-0 z-40">
        <KineticTicker onSelectItem={handleSelectTickerPair} />
      </footer>

      {/* Detailed Modal for Airport & Route Volatility Telemetry */}
      <RouteInspectorModal
        selectedAirport={selectedAirport}
        selectedRoute={selectedRoute}
        onClose={() => {
          setSelectedAirport(null);
          setSelectedRoute(null);
        }}
      />

    </div>
  );
};
