import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Airport, FlightRoute } from '../../types';
import { latLngToVector3 } from '../../utils/geoMath';

interface CameraControllerProps {
  activeSection: number;
  scrollProgress: number;
  mousePos: { x: number; y: number };
  selectedAirport: Airport | null;
  selectedRoute: FlightRoute | null;
  globeRadius: number;
  isMapPage?: boolean;
  zoomLevel?: number;
  resetTrigger?: number;
}

interface CamKeyframe {
  pos: [number, number, number];
  lookAt: [number, number, number];
}

const CAM_KEYFRAMES: CamKeyframe[] = [
  // 0: Hero - medium distance
  { pos: [0.0, 0.0, 6.6], lookAt: [0.0, 0.0, 0.0] },
  // 1: National benchmark
  { pos: [0.0, 0.0, 5.8], lookAt: [0.0, 0.0, 0.0] },
  // 2: Routes - zoom into domestic corridors
  { pos: [-0.15, 0.0, 5.0], lookAt: [-0.15, 0.0, 0.0] },
  // 3: Corridor telemetry
  { pos: [0.15, 0.0, 5.3], lookAt: [0.15, 0.0, 0.0] },
  // 4: Anomalies
  { pos: [0.10, 0.0, 5.6], lookAt: [0.10, 0.0, 0.0] },
  // 5: Pipeline
  { pos: [0.0, 0.05, 6.0], lookAt: [0.0, 0.05, 0.0] },
  // 6: Methodology overview
  { pos: [0.0, 0.1, 6.4], lookAt: [0.0, 0.1, 0.0] },
];

const interpolatedCamPos = new THREE.Vector3();
const interpolatedCamLookAt = new THREE.Vector3();

function interpolateCamKeyframes(progress: number): {
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
} {
  const maxIdx = CAM_KEYFRAMES.length - 1;
  const clamped = Math.max(0, Math.min(maxIdx, progress * maxIdx));
  const idx = Math.min(maxIdx - 1, Math.floor(clamped));
  const t = clamped - idx;
  const smoothT = t * t * (3 - 2 * t);

  const k1 = CAM_KEYFRAMES[idx];
  const k2 = CAM_KEYFRAMES[idx + 1];

  interpolatedCamPos.set(
    THREE.MathUtils.lerp(k1.pos[0], k2.pos[0], smoothT),
    THREE.MathUtils.lerp(k1.pos[1], k2.pos[1], smoothT),
    THREE.MathUtils.lerp(k1.pos[2], k2.pos[2], smoothT)
  );

  interpolatedCamLookAt.set(
    THREE.MathUtils.lerp(k1.lookAt[0], k2.lookAt[0], smoothT),
    THREE.MathUtils.lerp(k1.lookAt[1], k2.lookAt[1], smoothT),
    THREE.MathUtils.lerp(k1.lookAt[2], k2.lookAt[2], smoothT)
  );

  return { pos: interpolatedCamPos, lookAt: interpolatedCamLookAt };
}

export const CameraController: React.FC<CameraControllerProps> = ({
  activeSection,
  scrollProgress,
  mousePos,
  selectedAirport,
  selectedRoute,
  globeRadius,
  isMapPage = false,
  zoomLevel = 4.35,
  resetTrigger = 0,
}) => {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 6.6));
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

  const targetPos = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const camNormal = useRef(new THREE.Vector3());

  const animStartTimeRef = useRef<number>(0);
  const prevResetTrigger = useRef<number>(resetTrigger);

  useFrame(({ clock }, delta) => {
    const tPos = targetPos.current;
    const lTar = lookTarget.current;

    if (isMapPage) {
      if (animStartTimeRef.current === 0 || prevResetTrigger.current !== resetTrigger) {
        animStartTimeRef.current = clock.getElapsedTime();
        prevResetTrigger.current = resetTrigger;
      }

      const elapsed = clock.getElapsedTime() - animStartTimeRef.current;
      const targetZoom = zoomLevel; // default 4.35 brings India prominent and clear

      // Initial wide distance that zooms in smoothly as India turns to front
      const startZoom = 6.4;
      const zoomDelay = 0.4;
      const zoomDuration = 2.0;
      const rawZoomT = Math.min(1.0, Math.max(0.0, (elapsed - zoomDelay) / zoomDuration));
      const easeZoom = 1 - Math.pow(1 - rawZoomT, 3); // Cubic ease-out

      const currentZ = THREE.MathUtils.lerp(startZoom, targetZoom, easeZoom);

      if (selectedAirport) {
        // Zoom into selected airport node
        const nodePos = latLngToVector3(selectedAirport.lat, selectedAirport.lng, globeRadius);
        camNormal.current.copy(nodePos).normalize();
        tPos.copy(nodePos).add(camNormal.current.multiplyScalar(1.6));
        lTar.copy(nodePos);
      } else {
        tPos.set(0, 0, currentZ);
        lTar.set(0, 0, 0);
      }

      // Subtle responsive parallax
      const parallaxX = mousePos.x * 0.12;
      const parallaxY = mousePos.y * 0.08;
      tPos.x += parallaxX;
      tPos.y += parallaxY;

      // Smooth camera interpolation
      const lerpSpeed = delta * 3.5;
      currentPos.current.lerp(tPos, lerpSpeed);
      currentTarget.current.lerp(lTar, lerpSpeed);

      camera.position.copy(currentPos.current);
      camera.lookAt(currentTarget.current);
      return;
    }

    if (selectedAirport) {
      // Zoom into selected airport
      const nodePos = latLngToVector3(selectedAirport.lat, selectedAirport.lng, globeRadius);
      camNormal.current.copy(nodePos).normalize();
      tPos.copy(nodePos).add(camNormal.current.multiplyScalar(2.0));
      lTar.copy(nodePos);
    } else {
      // Continuous scroll-driven interpolation across 5 sections
      const interp = interpolateCamKeyframes(scrollProgress);
      tPos.copy(interp.pos);
      lTar.copy(interp.lookAt);
    }

    // Add subtle micro-parallax from mouse cursor
    const parallaxX = mousePos.x * 0.35;
    const parallaxY = mousePos.y * 0.25;
    tPos.x += parallaxX;
    tPos.y += parallaxY;

    // Smooth inertial damping
    const lerpSpeed = delta * 3.2;
    currentPos.current.lerp(tPos, lerpSpeed);
    currentTarget.current.lerp(lTar, lerpSpeed);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
};
