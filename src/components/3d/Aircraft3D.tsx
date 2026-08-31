import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FlightRoute, Airport } from '../../types';
import { latLngToVector3, createCurvedFlightArc } from '../../utils/geoMath';
import { useTheme } from '../../context/ThemeContext';

interface Aircraft3DProps {
  routes: FlightRoute[];
  airports: Airport[];
  globeRadius: number;
  selectedRoute: FlightRoute | null;
  hoveredRoute: FlightRoute | null;
}

export const Aircraft3D: React.FC<Aircraft3DProps> = ({
  routes,
  airports,
  globeRadius,
  selectedRoute,
  hoveredRoute,
}) => {
  const { theme } = useTheme();
  const airportMap = useMemo(() => {
    const map = new Map<string, Airport>();
    (airports || []).forEach((a) => {
      if (a && a.iata) {
        map.set(a.iata.toUpperCase(), a);
      }
    });
    return map;
  }, [airports]);

  // Select active Indian corridors to animate planes along (e.g. DEL-BOM, DEL-BLR, DEL-HYD, DEL-CCU, BOM-BLR, BOM-GOI, BLR-MAA, DEL-AMD)
  const activeRoutes = useMemo(() => {
    if (selectedRoute) return [selectedRoute];
    if (hoveredRoute) return [hoveredRoute];
    const keyCorridors = ['del-bom', 'del-blr', 'del-hyd', 'del-ccu', 'bom-blr', 'bom-goi', 'blr-maa', 'del-pnq'];
    const filtered = (routes || []).filter((r) => r && keyCorridors.includes(r.id));
    return filtered.length > 0 ? filtered : (routes || []).slice(0, 8);
  }, [routes, selectedRoute, hoveredRoute]);

  const planes = useMemo(() => {
    return activeRoutes
      .map((route, index) => {
        const fromAirport = airportMap.get(route.fromIata);
        const toAirport = airportMap.get(route.toIata);
        if (!fromAirport || !toAirport) return null;

        const startVec = latLngToVector3(fromAirport.lat, fromAirport.lng, globeRadius);
        const endVec = latLngToVector3(toAirport.lat, toAirport.lng, globeRadius);
        const { curve } = createCurvedFlightArc(startVec, endVec, globeRadius);

        return {
          route,
          curve,
          speed: 0.07 + (index % 4) * 0.02,
          offset: (index * 0.22) % 1,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [activeRoutes, airportMap, globeRadius]);

  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    planes.forEach((plane, i) => {
      const group = groupRefs.current[i];
      if (!group) return;

      const progress = (t * plane.speed + plane.offset) % 1;
      const point = plane.curve.getPointAt(progress);
      const tangent = plane.curve.getTangentAt(progress).normalize();

      group.position.copy(point);

      // Orient aircraft smoothly along the forward flight trajectory
      const lookTarget = point.clone().add(tangent);
      const up = point.clone().normalize(); // Globe radial normal
      const m = new THREE.Matrix4();
      m.lookAt(lookTarget, point, up);
      group.quaternion.setFromRotationMatrix(m);
    });
  });

  if (planes.length === 0) return null;

  const isArctic = theme === 'arctic';

  return (
    <group>
      {planes.map((p, index) => (
        <group
          key={p.route.id + index}
          ref={(el) => {
            groupRefs.current[index] = el;
          }}
        >
          {/* Detailed Commercial Aircraft Jet Model */}
          <group scale={[0.048, 0.048, 0.048]}>
            {/* Fuselage - aerodynamic streamlined tube & nose */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.24, 1.6, 12]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive={isArctic ? '#285474' : '#00E5FF'}
                emissiveIntensity={isArctic ? 0.12 : 0.4}
                roughness={isArctic ? 0.4 : 0.2}
                metalness={isArctic ? 0.25 : 0.85}
              />
            </mesh>
            {/* Cockpit Nosecone */}
            <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.18, 0.45, 12]} />
              <meshStandardMaterial
                color={isArctic ? '#285474' : '#00E5FF'}
                emissive={isArctic ? '#1F435E' : '#00E5FF'}
                emissiveIntensity={isArctic ? 0.25 : 0.8}
                roughness={isArctic ? 0.3 : 0.1}
                metalness={isArctic ? 0.3 : 0.9}
              />
            </mesh>
            {/* Swept Main Wings */}
            <mesh position={[0, -0.02, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[1.8, 0.04, 0.42]} />
              <meshStandardMaterial
                color={isArctic ? '#416B8A' : '#38BDF8'}
                emissive={isArctic ? '#285474' : '#0284C7'}
                emissiveIntensity={isArctic ? 0.18 : 0.5}
                roughness={isArctic ? 0.4 : 0.25}
                metalness={isArctic ? 0.25 : 0.8}
              />
            </mesh>
            {/* Tail Vertical Fin */}
            <mesh position={[0, 0.32, -0.65]} rotation={[-Math.PI / 8, 0, 0]}>
              <boxGeometry args={[0.04, 0.48, 0.36]} />
              <meshStandardMaterial
                color={isArctic ? '#285474' : '#00E5FF'}
                emissive={isArctic ? '#1F435E' : '#00E5FF'}
                emissiveIntensity={isArctic ? 0.25 : 0.8}
                roughness={isArctic ? 0.3 : 0.2}
                metalness={isArctic ? 0.3 : 0.8}
              />
            </mesh>
            {/* Horizontal Stabilizers */}
            <mesh position={[0, 0.04, -0.72]}>
              <boxGeometry args={[0.7, 0.03, 0.22]} />
              <meshStandardMaterial
                color={isArctic ? '#416B8A' : '#38BDF8'}
                emissive={isArctic ? '#285474' : '#0369A1'}
                emissiveIntensity={isArctic ? 0.18 : 0.4}
              />
            </mesh>
            {/* Port (Left) Red Nav Light */}
            <mesh position={[-0.92, 0, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color={isArctic ? '#B45C5C' : '#EF4444'} />
            </mesh>
            {/* Starboard (Right) Green Nav Light */}
            <mesh position={[0.92, 0, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color={isArctic ? '#3F765E' : '#10B981'} />
            </mesh>
            {/* Strobe Light Beacon */}
            <pointLight
              color={isArctic ? '#FFFFFF' : '#00E5FF'}
              intensity={isArctic ? 0.35 : 0.8}
              distance={1.5}
            />
          </group>
        </group>
      ))}
    </group>
  );
};
