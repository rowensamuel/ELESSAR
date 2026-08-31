import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';

interface GlobeProps {
  radius: number;
  heroScrollProgress?: number;
}

const EarthShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uArcticProgress; // 0.0 = Midnight, 1.0 = Arctic
    uniform vec3 uArcticBg;
    uniform vec3 uSunDir;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec4 tex = texture2D(uTexture, vUv);
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);
      vec3 L = normalize(uSunDir);

      // ----------------------------------------------------
      // 1. MIDNIGHT SATELLITE EARTH (Preserved 100% untouched)
      // ----------------------------------------------------
      float nDotL_mid = max(0.0, dot(N, L));
      float midDiffuse = nDotL_mid * 0.92 + 0.32;
      vec3 midnightEmissive = vec3(0.024, 0.047, 0.094) * 0.32;
      float midLimb = 1.0 - max(0.0, dot(N, V));
      vec3 midAtmo = vec3(0.11, 0.31, 0.85) * pow(midLimb, 4.0) * 0.38;
      vec3 colorMidnight = tex.rgb * midDiffuse + midnightEmissive + midAtmo;

      // ----------------------------------------------------
      // 2. ARCTIC DESATURATED EARTH OBSERVATION SATELLITE STYLE
      // ----------------------------------------------------
      // Standard accurate photometric luminance
      float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

      // Desaturate to ~22% saturation (retains subtle natural satellite color data)
      vec3 desat = mix(vec3(lum), tex.rgb, 0.22);

      // Calibrated Earth-observation tone mapping:
      // Land: cool gray / charcoal with muted olive-gray undertone
      // Ocean: deep desaturated blue-gray
      // Clouds & snow: crisp natural white / light gray
      vec3 oceanTone = vec3(0.13, 0.19, 0.27);
      vec3 landTone = vec3(0.38, 0.40, 0.39);
      vec3 graded = mix(desat, mix(oceanTone, landTone, smoothstep(0.12, 0.42, lum)), 0.24);

      // Micro-contrast curve to preserve mountain ranges, coastlines, and cloud patterns
      vec3 contrastCol = (graded - 0.46) * 1.20 + 0.46;
      contrastCol = clamp(contrastCol, 0.0, 1.0);

      // Soft realistic directional sunlight
      float nDotL_arc = max(0.0, dot(N, L));
      // Soft wrap lighting across terminator for realistic atmospheric scatter
      float softSun = pow(nDotL_arc * 0.65 + 0.35, 1.12);
      float fillSun = max(0.0, dot(N, normalize(vec3(-0.4, -0.3, -0.5)))) * 0.20;
      vec3 litArctic = contrastCol * (softSun * 1.10 + fillSun + 0.24);

      // Restrained atmospheric haze on day limb
      float arcLimb = 1.0 - max(0.0, dot(N, V));
      vec3 arcAtmo = vec3(0.35, 0.46, 0.58) * pow(arcLimb, 3.8) * softSun * 0.30;
      litArctic += arcAtmo;

      // Subtle peripheral radial feathering into Arctic page background (eliminates hard circle edge)
      float viewEdge = dot(N, V);
      float edgeFade = smoothstep(0.02, 0.26, viewEdge);
      vec3 arcticFinal = mix(uArcticBg, litArctic, edgeFade);

      // ----------------------------------------------------
      // 3. SMOOTH THEME DISSOLVE TRANSITION (500–800ms)
      // ----------------------------------------------------
      vec3 finalColor = mix(colorMidnight, arcticFinal, uArcticProgress);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const EarthSphere: React.FC<{ radius: number; heroScrollProgress?: number }> = ({
  radius,
  heroScrollProgress = 0,
}) => {
  const { theme } = useTheme();
  const earthTexture = useTexture('/earth_satellite.jpg');
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const outerLimbRef = useRef<THREE.Mesh>(null);
  const sphereGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useMemo(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.anisotropy = 16;
      earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
      earthTexture.magFilter = THREE.LinearFilter;
      earthTexture.wrapS = THREE.RepeatWrapping;
      earthTexture.wrapT = THREE.ClampToEdgeWrapping;
      earthTexture.needsUpdate = true;
    }
  }, [earthTexture]);

  const uniforms = useMemo(() => ({
    uTexture: { value: earthTexture },
    uArcticProgress: { value: theme === 'arctic' ? 1.0 : 0.0 },
    uArcticBg: { value: new THREE.Color('#F6F7F8') },
    uSunDir: { value: new THREE.Vector3(0.5, 0.35, 0.8).normalize() },
  }), [earthTexture]);

  // Update texture uniform reference if texture changes
  useEffect(() => {
    if (uniforms.uTexture) {
      uniforms.uTexture.value = earthTexture;
    }
  }, [earthTexture, uniforms]);

  // Frame update: Smooth theme transition interpolation & scroll rotation
  useFrame((_, delta) => {
    const targetProgress = theme === 'arctic' ? 1.0 : 0.0;
    if (materialRef.current) {
      materialRef.current.uniforms.uArcticProgress.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uArcticProgress.value,
        targetProgress,
        4.5, // ~600ms smooth transition
        delta
      );
    }

    const currentArcticProgress = materialRef.current
      ? materialRef.current.uniforms.uArcticProgress.value
      : targetProgress;

    // Atmospheric rim responds smoothly to theme & scroll
    if (atmosphereRef.current) {
      const targetAtmosphereRotY = heroScrollProgress * 0.15;
      atmosphereRef.current.rotation.y = THREE.MathUtils.damp(
        atmosphereRef.current.rotation.y,
        targetAtmosphereRotY,
        4,
        delta
      );
      const atmoMat = atmosphereRef.current.material as THREE.MeshStandardMaterial;
      if (atmoMat) {
        // Fade out atmosphere mesh in Arctic (since shader handles edge feathering)
        const targetAtmoOpacity = THREE.MathUtils.lerp(0.025, 0.0, currentArcticProgress);
        atmoMat.opacity = THREE.MathUtils.damp(atmoMat.opacity, targetAtmoOpacity, 4, delta);
      }
    }

    if (outerLimbRef.current) {
      const targetLimbOpacity = THREE.MathUtils.lerp(
        0.04 + heroScrollProgress * 0.02,
        0.0,
        currentArcticProgress
      );
      const limbMat = outerLimbRef.current.material as THREE.MeshBasicMaterial;
      if (limbMat) {
        limbMat.opacity = THREE.MathUtils.damp(limbMat.opacity, targetLimbOpacity, 4, delta);
      }
    }
  });

  return (
    <group ref={sphereGroupRef}>
      {/* High-definition Satellite Earth Sphere with Earth Observation Shader */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={EarthShader.vertexShader}
          fragmentShader={EarthShader.fragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmospheric rim for Midnight */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[radius * 1.003, 64, 64]} />
        <meshStandardMaterial
          color="#60A5FA"
          transparent
          opacity={0.025}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      {/* Outer atmosphere limb for Midnight */}
      <mesh ref={outerLimbRef}>
        <sphereGeometry args={[radius * 1.014, 64, 64]} />
        <meshBasicMaterial
          color="#1D4ED8"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// Fallback dark sphere while satellite texture streams in
const GlobeFallback: React.FC<{ radius: number }> = ({ radius }) => (
  <mesh>
    <sphereGeometry args={[radius, 36, 36]} />
    <meshStandardMaterial
      color="#0B132B"
      roughness={0.8}
      metalness={0.1}
    />
  </mesh>
);

export const Globe: React.FC<GlobeProps> = ({ radius, heroScrollProgress = 0 }) => {
  return (
    <React.Suspense fallback={<GlobeFallback radius={radius} />}>
      <EarthSphere radius={radius} heroScrollProgress={heroScrollProgress} />
    </React.Suspense>
  );
};

useTexture.preload('/earth_satellite.jpg');
