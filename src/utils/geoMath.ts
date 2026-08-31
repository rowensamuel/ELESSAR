import * as THREE from 'three';

/**
 * Converts Latitude and Longitude to 3D Cartesian vector on sphere of radius R
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Creates a smooth 3D curved trajectory arc between two points on the globe surface
 */
export function createCurvedFlightArc(
  startVec: THREE.Vector3,
  endVec: THREE.Vector3,
  globeRadius: number,
  altitudeFactor = 0.35,
  pointCount = 64
): { curve: THREE.QuadraticBezierCurve3 | THREE.CubicBezierCurve3; points: THREE.Vector3[] } {
  const distance = startVec.distanceTo(endVec);
  
  // Midpoint
  const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  
  // Calculate elevation offset based on route distance
  const normal = mid.clone().normalize();
  const maxAltitude = globeRadius * (0.12 + Math.min(0.4, (distance / globeRadius) * altitudeFactor));
  
  const midPointElevated = normal.multiplyScalar(globeRadius + maxAltitude);

  // Control points for cubic curve for more aerodynamic arc
  const startControl = new THREE.Vector3().lerpVectors(startVec, midPointElevated, 0.65).normalize().multiplyScalar(globeRadius + maxAltitude * 0.85);
  const endControl = new THREE.Vector3().lerpVectors(endVec, midPointElevated, 0.65).normalize().multiplyScalar(globeRadius + maxAltitude * 0.85);

  const curve = new THREE.CubicBezierCurve3(startVec, startControl, endControl, endVec);
  const points = curve.getPoints(pointCount);

  return { curve, points };
}
