import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Globe } from './Globe';
import { AirportNodes } from './AirportNodes';
import { FlightRoutes } from './FlightRoutes';
import { FlightParticles } from './FlightParticles';
import { Aircraft3D } from './Aircraft3D';
import { Airport, FlightRoute } from '../../types';

interface EarthSystemProps {
  radius: number;
  airports: Airport[];
  routes: FlightRoute[];
  scrollProgress: number;
  heroScrollProgress?: number;
  activeSection: number;
  hoveredAirport: Airport | null;
  selectedAirport: Airport | null;
  hoveredRoute: FlightRoute | null;
  selectedRoute: FlightRoute | null;
  onHoverAirport: (airport: Airport | null) => void;
  onSelectAirport: (airport: Airport) => void;
  onHoverRoute: (route: FlightRoute | null) => void;
  onSelectRoute: (route: FlightRoute) => void;
  isMapPage?: boolean;
  resetTrigger?: number;
}

// Base Y-rotation and X-tilt so India faces directly forward towards the camera upright
const BASE_INDIA_ROT_Y = -2.932;
const BASE_INDIA_ROT_X = 0.36; // Perfectly centers India vertically (lat ~21.5°N)

interface Keyframe {
  pos: [number, number, number];
  rot: [number, number, number];
}

const SECTION_KEYFRAMES: Keyframe[] = [
  // 0: Hero - India centered prominently on the right side of viewport
  { pos: [1.15, 0.02, 0.0], rot: [BASE_INDIA_ROT_X, BASE_INDIA_ROT_Y, 0.0] },
  // 1: Domestic Corridors - Gently moves back with slight rotation
  { pos: [0.95, -0.02, -0.10], rot: [BASE_INDIA_ROT_X + 0.02, BASE_INDIA_ROT_Y + 0.20, 0.0] },
  // 2: National Benchmark - Retains subtle presence on right
  { pos: [0.85, -0.02, -0.15], rot: [BASE_INDIA_ROT_X + 0.02, BASE_INDIA_ROT_Y + 0.40, 0.0] },
  // 3: Routes & Hubs - Smoothly shifts to the left to balance the right-side text panel
  { pos: [-0.65, 0.02, 0.05], rot: [BASE_INDIA_ROT_X + 0.03, BASE_INDIA_ROT_Y + 0.65, 0.0] },
  // 4: Corridor telemetry - Slides back to right
  { pos: [0.85, -0.02, -0.10], rot: [BASE_INDIA_ROT_X - 0.02, BASE_INDIA_ROT_Y + 0.95, 0.0] },
  // 5: Anomaly detection
  { pos: [0.75, 0.0, -0.15], rot: [BASE_INDIA_ROT_X + 0.02, BASE_INDIA_ROT_Y + 1.25, 0.0] },
  // 6: Pipeline & Methodology - Subtly recedes into background
  { pos: [0.45, 0.05, -0.25], rot: [BASE_INDIA_ROT_X, BASE_INDIA_ROT_Y + 1.55, 0.0] },
];

const interpolatedPos = new THREE.Vector3();
const interpolatedRot = new THREE.Euler();

function interpolateKeyframes(progress: number): {
  pos: THREE.Vector3;
  rot: THREE.Euler;
} {
  const maxIdx = SECTION_KEYFRAMES.length - 1;
  const clampedProgress = Math.max(0, Math.min(maxIdx, progress * maxIdx));
  const index = Math.min(maxIdx - 1, Math.floor(clampedProgress));
  const t = clampedProgress - index;
  // Smoothstep easing for continuous organic transitions
  const smoothT = t * t * (3 - 2 * t);

  const k1 = SECTION_KEYFRAMES[index];
  const k2 = SECTION_KEYFRAMES[index + 1];

  interpolatedPos.set(
    THREE.MathUtils.lerp(k1.pos[0], k2.pos[0], smoothT),
    THREE.MathUtils.lerp(k1.pos[1], k2.pos[1], smoothT),
    THREE.MathUtils.lerp(k1.pos[2], k2.pos[2], smoothT)
  );

  interpolatedRot.set(
    THREE.MathUtils.lerp(k1.rot[0], k2.rot[0], smoothT),
    THREE.MathUtils.lerp(k1.rot[1], k2.rot[1], smoothT),
    THREE.MathUtils.lerp(k1.rot[2], k2.rot[2], smoothT)
  );

  return { pos: interpolatedPos, rot: interpolatedRot };
}

export const EarthSystem: React.FC<EarthSystemProps> = ({
  radius,
  airports,
  routes,
  scrollProgress,
  heroScrollProgress = 0,
  activeSection,
  hoveredAirport,
  selectedAirport,
  hoveredRoute,
  selectedRoute,
  onHoverAirport,
  onSelectAirport,
  onHoverRoute,
  onSelectRoute,
  isMapPage = false,
  resetTrigger = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  // Initial frame is positioned on the right with India visible immediately
  const currentPos = useRef(new THREE.Vector3(1.18, 0.04, 0));
  const currentRot = useRef(new THREE.Vector3(BASE_INDIA_ROT_X, BASE_INDIA_ROT_Y, 0));

  // Timer for Map Page entrance rotation to India
  const animStartTimeRef = useRef<number>(0);
  const prevResetTrigger = useRef<number>(resetTrigger);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    if (isMapPage) {
      if (animStartTimeRef.current === 0 || prevResetTrigger.current !== resetTrigger) {
        animStartTimeRef.current = clock.getElapsedTime();
        prevResetTrigger.current = resetTrigger;
      }

      const elapsed = clock.getElapsedTime() - animStartTimeRef.current;
      const duration = 2.4; // 2.4s controlled smooth transition
      const rawT = Math.min(1.0, Math.max(0.0, elapsed / duration));
      
      // Smooth cubic in-out ease
      const easeT = rawT < 0.5
        ? 4 * rawT * rawT * rawT
        : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

      // Start from an initial rotation offset and rotate smoothly to India
      const startRotY = BASE_INDIA_ROT_Y - 1.4;
      const startRotX = 0.15;

      const targetRotX = THREE.MathUtils.lerp(startRotX, BASE_INDIA_ROT_X, easeT);
      const targetRotY = THREE.MathUtils.lerp(startRotY, BASE_INDIA_ROT_Y, easeT);
      const targetRotZ = 0.0;

      // Position centered at origin
      const targetPos = new THREE.Vector3(0.0, 0.0, 0.0);

      // Smooth lerp to target
      const lerpRate = delta * 4.0;
      currentPos.current.lerp(targetPos, lerpRate);
      currentRot.current.x = THREE.MathUtils.lerp(currentRot.current.x, targetRotX, lerpRate);
      currentRot.current.y = THREE.MathUtils.lerp(currentRot.current.y, targetRotY, lerpRate);
      currentRot.current.z = THREE.MathUtils.lerp(currentRot.current.z, targetRotZ, lerpRate);

      groupRef.current.position.copy(currentPos.current);
      groupRef.current.rotation.set(
        currentRot.current.x,
        currentRot.current.y,
        currentRot.current.z
      );
      return;
    }

    // Check for user's reduced-motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      groupRef.current.position.set(1.18, 0.04, 0);
      groupRef.current.rotation.set(BASE_INDIA_ROT_X, BASE_INDIA_ROT_Y, 0);
      return;
    }

    // 1. Calculate continuous scroll-driven target state (Landing Page)
    // Scrolling DOWN smoothly rotates forward, scrolling UP smoothly reverses
    const { pos: targetPos, rot: targetRot } = interpolateKeyframes(scrollProgress);

    // 2. Smooth inertial damping lerp (spring-like physical feel)
    const lerpRate = Math.min(1.0, delta * 4.2);
    currentPos.current.lerp(targetPos, lerpRate);
    currentRot.current.x = THREE.MathUtils.lerp(currentRot.current.x, targetRot.x, lerpRate);
    currentRot.current.y = THREE.MathUtils.lerp(currentRot.current.y, targetRot.y, lerpRate);
    currentRot.current.z = THREE.MathUtils.lerp(currentRot.current.z, targetRot.z, lerpRate);

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.set(
      currentRot.current.x,
      currentRot.current.y,
      currentRot.current.z
    );
  });

  return (
    <group ref={groupRef}>
      {/* 3D Flight Intelligence Earth GLB Model */}
      <Globe radius={radius} heroScrollProgress={heroScrollProgress} />

      {/* Connected Indian Domestic Flight Routes */}
      <FlightRoutes
        routes={routes}
        airports={airports}
        globeRadius={radius}
        hoveredRoute={hoveredRoute}
        selectedRoute={selectedRoute}
        hoveredAirport={hoveredAirport}
        onHoverRoute={onHoverRoute}
        onSelectRoute={onSelectRoute}
        activeSection={activeSection}
      />

      {/* Animated Trajectory Stream Particles */}
      <FlightParticles
        routes={routes}
        airports={airports}
        globeRadius={radius}
      />

      {/* 3D Aircraft Tracking along Indian Corridors */}
      <Aircraft3D
        routes={routes}
        airports={airports}
        globeRadius={radius}
        selectedRoute={selectedRoute}
        hoveredRoute={hoveredRoute}
      />

      {/* Indian Airport Nodes & Primary Hub Radar Beacons */}
      <AirportNodes
        airports={airports}
        globeRadius={radius}
        hoveredAirport={hoveredAirport}
        selectedAirport={selectedAirport}
        onHoverAirport={onHoverAirport}
        onSelectAirport={onSelectAirport}
        activeSection={activeSection}
      />
    </group>
  );
};
