import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Airport } from '../../types';
import { latLngToVector3 } from '../../utils/geoMath';
import { useTheme } from '../../context/ThemeContext';

interface AirportNodesProps {
  airports: Airport[];
  globeRadius: number;
  hoveredAirport: Airport | null;
  selectedAirport: Airport | null;
  onHoverAirport: (airport: Airport | null) => void;
  onSelectAirport: (airport: Airport) => void;
  activeSection: number;
}

// Major hubs with slightly more prominent radar nodes
const PRIMARY_HUBS = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'GOI', 'COK'];

export const AirportNodes: React.FC<AirportNodesProps> = ({
  airports,
  globeRadius,
  hoveredAirport,
  selectedAirport,
  onHoverAirport,
  onSelectAirport,
}) => {
  const { theme, themeConfig } = useTheme();
  const pulseGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (pulseGroupRef.current) {
      const t = clock.getElapsedTime();
      pulseGroupRef.current.children.forEach((child, i) => {
        const cycle = (t * 1.3 + i * 0.22) % 1;
        const scale = 1 + cycle * 1.8;
        const opacity = Math.max(0, (1 - cycle) * 0.5);
        child.scale.set(scale, scale, scale);
        const mesh = child as THREE.Mesh;
        if (mesh.material && 'opacity' in mesh.material) {
          (mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
        }
      });
    }
  });

  return (
    <group>
      {airports.map((airport) => {
        const pos = latLngToVector3(airport.lat, airport.lng, globeRadius * 1.003);
        const isHovered = hoveredAirport?.id === airport.id;
        const isSelected = selectedAirport?.id === airport.id;
        const isPrimary = PRIMARY_HUBS.includes(airport.iata);

        // Precise, minimal node sizing on the 3D globe surface
        const nodeSize = isHovered || isSelected ? 0.024 : isPrimary ? 0.019 : 0.013;
        const nodeColor =
          isHovered || isSelected
            ? (theme === 'arctic' ? '#172536' : themeConfig.accent)
            : isPrimary
            ? (theme === 'arctic' ? '#285A82' : themeConfig.accent)
            : (theme === 'arctic' ? '#526577' : themeConfig.textPrimary);
        const nodeOpacity = isHovered || isSelected ? 1.0 : isPrimary ? 0.95 : 0.75;

        const normal = pos.clone().normalize();
        const ringQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normal
        );

        return (
          <group key={airport.id} position={pos}>
            {/* Surface node point */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverAirport(airport);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHoverAirport(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectAirport(airport);
              }}
            >
              <sphereGeometry args={[nodeSize, 16, 16]} />
              <meshBasicMaterial
                color={nodeColor}
                transparent
                opacity={nodeOpacity}
              />
            </mesh>

            {/* Radar pulse ring aligned to globe surface */}
            {(isPrimary || isHovered) && (
              <group quaternion={ringQuat}>
                <mesh position={[0, 0, 0.005]}>
                  <ringGeometry args={[0.022, 0.034, 24]} />
                  <meshBasicMaterial
                    color={theme === 'arctic' ? '#285A82' : themeConfig.accent}
                    transparent
                    opacity={theme === 'arctic' ? 0.45 : 0.65}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
