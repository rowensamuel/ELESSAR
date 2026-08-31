import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EarthSystem } from './EarthSystem';
import { CameraController } from './CameraController';
import { Airport, FlightRoute } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SceneProps {
  airports: Airport[];
  routes: FlightRoute[];
  activeSection: number;
  scrollProgress: number;
  heroScrollProgress?: number;
  mousePos: { x: number; y: number };
  hoveredAirport: Airport | null;
  selectedAirport: Airport | null;
  hoveredRoute: FlightRoute | null;
  selectedRoute: FlightRoute | null;
  onHoverAirport: (airport: Airport | null) => void;
  onSelectAirport: (airport: Airport) => void;
  onHoverRoute: (route: FlightRoute | null) => void;
  onSelectRoute: (route: FlightRoute) => void;
  isMapPage?: boolean;
  zoomLevel?: number;
  resetTrigger?: number;
}

export const Scene: React.FC<SceneProps> = ({
  airports,
  routes,
  activeSection,
  scrollProgress,
  heroScrollProgress = 0,
  mousePos,
  hoveredAirport,
  selectedAirport,
  hoveredRoute,
  selectedRoute,
  onHoverAirport,
  onSelectAirport,
  onHoverRoute,
  onSelectRoute,
  isMapPage = false,
  zoomLevel = 4.35,
  resetTrigger = 0,
}) => {
  const GLOBE_RADIUS = 2.4;
  const { theme, themeConfig } = useTheme();

  // Lighting configuration per theme
  const ambientIntensity = theme === 'arctic' ? 1.15 : 1.1;
  const ambientColor = theme === 'arctic' ? '#F4F7FA' : '#9AA5B1';
  const rimLightColor = theme === 'arctic' ? '#7A96AD' : '#C6A15B';
  const rimLightIntensity = theme === 'arctic' ? 0.2 : 0.6;
  const fillLightColor = theme === 'arctic' ? '#DCE4EC' : '#2A3B4C';
  const fillLightIntensity = theme === 'arctic' ? 0.35 : 0.5;
  const dirLightIntensity = theme === 'arctic' ? 1.5 : 1.8;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 6.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[themeConfig.bg]} />

        {/* Ambient & Directional Lighting for Satellite Earth Textures */}
        <ambientLight intensity={ambientIntensity} color={ambientColor} />
        <directionalLight position={[6, 4, 6]} intensity={dirLightIntensity} color="#FFFFFF" />
        <directionalLight position={[-6, -3, -4]} intensity={fillLightIntensity} color={fillLightColor} />
        <pointLight position={[2, 4, 5]} intensity={rimLightIntensity} color={rimLightColor} distance={20} />

        <Suspense fallback={null}>
          {/* Synchronized 3D Earth System with Indian Domestic Routes & Nodes */}
          <EarthSystem
            radius={GLOBE_RADIUS}
            airports={airports}
            routes={routes}
            scrollProgress={scrollProgress}
            heroScrollProgress={heroScrollProgress}
            activeSection={activeSection}
            hoveredAirport={hoveredAirport}
            selectedAirport={selectedAirport}
            hoveredRoute={hoveredRoute}
            selectedRoute={selectedRoute}
            onHoverAirport={onHoverAirport}
            onSelectAirport={onSelectAirport}
            onHoverRoute={onHoverRoute}
            onSelectRoute={onSelectRoute}
            isMapPage={isMapPage}
            resetTrigger={resetTrigger}
          />

          {/* Spatial Camera Rig with Continuous Scroll Damping and Parallax */}
          <CameraController
            activeSection={activeSection}
            scrollProgress={scrollProgress}
            mousePos={mousePos}
            selectedAirport={selectedAirport}
            selectedRoute={selectedRoute}
            globeRadius={GLOBE_RADIUS}
            isMapPage={isMapPage}
            zoomLevel={zoomLevel}
            resetTrigger={resetTrigger}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
