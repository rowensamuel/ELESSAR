import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FlightRoute, Airport } from '../../types';
import { latLngToVector3, createCurvedFlightArc } from '../../utils/geoMath';
import { useTheme } from '../../context/ThemeContext';

interface FlightParticlesProps {
  routes: FlightRoute[];
  airports: Airport[];
  globeRadius: number;
}

interface ParticleData {
  curve: THREE.Curve<THREE.Vector3>;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

export const FlightParticles: React.FC<FlightParticlesProps> = ({
  routes,
  airports,
  globeRadius,
}) => {
  const { theme } = useTheme();
  const meshGroupRef = useRef<THREE.Group>(null);

  const airportMap = useMemo(() => {
    const map = new Map<string, Airport>();
    airports.forEach((a) => map.set(a.iata.toUpperCase(), a));
    return map;
  }, [airports]);

  // Create 1-3 particles per route with randomized phases
  const particles = useMemo<ParticleData[]>(() => {
    const list: ParticleData[] = [];

    routes.forEach((route) => {
      const fromAirport = airportMap.get(route.fromIata);
      const toAirport = airportMap.get(route.toIata);
      if (!fromAirport || !toAirport) return;

      const startVec = latLngToVector3(fromAirport.lat, fromAirport.lng, globeRadius);
      const endVec = latLngToVector3(toAirport.lat, toAirport.lng, globeRadius);
      const { curve } = createCurvedFlightArc(startVec, endVec, globeRadius);

      const count = route.highlighted ? 3 : 1;
      for (let i = 0; i < count; i++) {
        list.push({
          curve,
          progress: Math.random(),
          speed: 0.08 + Math.random() * 0.12,
          color:
            theme === 'arctic'
              ? (route.trend === 'down' ? '#3F765E' : '#B45C5C')
              : (route.trend === 'down' ? '#00E5FF' : '#F59E0B'),
          size: route.highlighted ? 0.038 : 0.024,
        });
      }
    });

    return list;
  }, [routes, airportMap, globeRadius, theme]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((_, delta) => {
    if (!instancedMeshRef.current) return;

    particles.forEach((p, idx) => {
      p.progress += delta * p.speed;
      if (p.progress > 1) p.progress = 0;

      const point = p.curve.getPointAt(p.progress);
      const tangent = p.curve.getTangentAt(p.progress).normalize();

      dummy.position.copy(point);
      dummy.scale.set(p.size, p.size, p.size * 2.2);
      dummy.lookAt(point.clone().add(tangent));
      dummy.updateMatrix();

      instancedMeshRef.current!.setMatrixAt(idx, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  const particleColor = theme === 'arctic' ? '#285474' : '#00E5FF';
  const particleOpacity = theme === 'arctic' ? 0.8 : 0.9;

  return (
    <group ref={meshGroupRef}>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, particles.length]}
      >
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshBasicMaterial color={particleColor} transparent opacity={particleOpacity} />
      </instancedMesh>
    </group>
  );
};
