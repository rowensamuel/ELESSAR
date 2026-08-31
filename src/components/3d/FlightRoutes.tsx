import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FlightRoute, Airport } from '../../types';
import { latLngToVector3, createCurvedFlightArc } from '../../utils/geoMath';
import { useTheme } from '../../context/ThemeContext';

interface FlightRoutesProps {
  routes: FlightRoute[];
  airports: Airport[];
  globeRadius: number;
  hoveredRoute: FlightRoute | null;
  selectedRoute: FlightRoute | null;
  hoveredAirport: Airport | null;
  onHoverRoute: (route: FlightRoute | null) => void;
  onSelectRoute: (route: FlightRoute) => void;
  activeSection: number;
}

export const FlightRoutes: React.FC<FlightRoutesProps> = ({
  routes,
  airports,
  globeRadius,
  hoveredRoute,
  selectedRoute,
  hoveredAirport,
  onHoverRoute,
  onSelectRoute,
}) => {
  const { theme, themeConfig } = useTheme();

  const airportMap = useMemo(() => {
    const map = new Map<string, Airport>();
    airports.forEach((a) => map.set(a.iata.toUpperCase(), a));
    return map;
  }, [airports]);

  const routeCurves = useMemo(() => {
    return routes
      .map((route) => {
        const fromAirport = airportMap.get(route.fromIata);
        const toAirport = airportMap.get(route.toIata);

        if (!fromAirport || !toAirport) return null;

        const startVec = latLngToVector3(fromAirport.lat, fromAirport.lng, globeRadius);
        const endVec = latLngToVector3(toAirport.lat, toAirport.lng, globeRadius);

        const { curve, points } = createCurvedFlightArc(startVec, endVec, globeRadius);

        const lineObj = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color: new THREE.Color(
              route.isHighlighted || route.highlighted ? '#00E5FF' : '#526577'
            ),
            transparent: true,
            opacity: 0.8,
          })
        );

        return {
          route,
          curve,
          points,
          lineObj,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [routes, airportMap, globeRadius]);

  return (
    <group>
      {routeCurves.map(({ route, curve, lineObj }) => {
        const isHovered = hoveredRoute?.id === route.id;
        const isSelected = selectedRoute?.id === route.id;
        const isConnectedToHoveredAirport =
          hoveredAirport &&
          (route.fromIata === hoveredAirport.iata || route.toIata === hoveredAirport.iata);

        const isHighlighted =
          route.isHighlighted || route.highlighted || isHovered || isSelected || isConnectedToHoveredAirport;

        let routeColor = themeConfig.textSecondary;
        let emissiveColor = themeConfig.border;
        let tubeRadius = 0.005;
        let opacity = 0.65;
        let emissiveIntensity = isHighlighted ? 0.9 : 0.5;

        if (theme === 'arctic') {
          if (isHovered || isSelected) {
            routeColor = '#172536';
            emissiveColor = '#285474';
            tubeRadius = 0.012;
            opacity = 1.0;
            emissiveIntensity = 0.4;
          } else if (isConnectedToHoveredAirport) {
            routeColor = '#285474';
            emissiveColor = '#285474';
            tubeRadius = 0.009;
            opacity = 0.9;
            emissiveIntensity = 0.3;
          } else if (route.trend === 'up') {
            routeColor = '#B45C5C';
            emissiveColor = '#8A3B3B';
            tubeRadius = isHighlighted ? 0.009 : 0.006;
            opacity = isHighlighted ? 0.9 : 0.75;
            emissiveIntensity = 0.2;
          } else if (route.trend === 'down') {
            routeColor = '#3F765E';
            emissiveColor = '#2A5842';
            tubeRadius = isHighlighted ? 0.009 : 0.006;
            opacity = isHighlighted ? 0.9 : 0.75;
            emissiveIntensity = 0.2;
          } else {
            routeColor = isHighlighted ? '#416B8A' : '#6D8799';
            emissiveColor = '#416B8A';
            tubeRadius = isHighlighted ? 0.008 : 0.005;
            opacity = isHighlighted ? 0.85 : 0.65;
            emissiveIntensity = 0.15;
          }
        } else {
          // Midnight original styling
          if (isHovered || isSelected) {
            routeColor = themeConfig.accent;
            emissiveColor = themeConfig.accentHover;
            tubeRadius = 0.014;
            opacity = 1.0;
            emissiveIntensity = 0.9;
          } else if (isConnectedToHoveredAirport) {
            routeColor = themeConfig.accent;
            emissiveColor = themeConfig.accent;
            tubeRadius = 0.010;
            opacity = 0.9;
            emissiveIntensity = 0.8;
          } else if (route.trend === 'up') {
            routeColor = themeConfig.negative;
            emissiveColor = themeConfig.negative;
            tubeRadius = isHighlighted ? 0.010 : 0.006;
            opacity = isHighlighted ? 0.9 : 0.75;
            emissiveIntensity = 0.6;
          } else if (route.trend === 'down') {
            routeColor = themeConfig.positive;
            emissiveColor = themeConfig.positive;
            tubeRadius = isHighlighted ? 0.010 : 0.006;
            opacity = isHighlighted ? 0.9 : 0.75;
            emissiveIntensity = 0.6;
          } else {
            routeColor = themeConfig.textSecondary;
            emissiveColor = themeConfig.border;
            tubeRadius = isHighlighted ? 0.008 : 0.005;
            opacity = isHighlighted ? 0.8 : 0.6;
            emissiveIntensity = 0.5;
          }
        }

        // Dynamically update line material color and opacity
        if (lineObj && lineObj.material instanceof THREE.LineBasicMaterial) {
          const lineColor = isHighlighted
            ? (theme === 'arctic' ? '#17212B' : themeConfig.textPrimary)
            : routeColor;
          lineObj.material.color.set(lineColor);
          lineObj.material.opacity = theme === 'arctic' ? 0.75 : 0.9;
        }

        return (
          <group key={route.id}>
            {/* Luminous 3D Flight Corridor Tube */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverRoute(route);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHoverRoute(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRoute(route);
              }}
            >
              <tubeGeometry args={[curve, 48, tubeRadius, 6, false]} />
              <meshStandardMaterial
                color={routeColor}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
                roughness={theme === 'arctic' ? 0.5 : 0.2}
                metalness={theme === 'arctic' ? 0.2 : 0.8}
                transparent
                opacity={opacity}
              />
            </mesh>

            {/* Clean inner core line */}
            <primitive object={lineObj} />
          </group>
        );
      })}
    </group>
  );
};
