import { useRef, useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS, Planet } from '@/data/planetaryData';

// ── Constants ───────────────────────────────────────────────────────────────
const CAM_START_Z = 55;
const CAM_END_Z   = 14;
const CAM_START_Y = 15;
const CAM_END_Y   = 6;

const getVisualSize = (size: number) => Math.cbrt(size) * 0.62;

// ── Planet photo textures (public/textures/) ─────────────────────────────────
const PLANET_TEXTURE_PATHS = {
  mercury: '/textures/mercury.jpg',
  venus:   '/textures/venus.jpg',
  earth:   '/textures/earth.jpg',
  mars:    '/textures/mars.jpg',
  jupiter: '/textures/jupiter.jpg',
  saturn:  '/textures/saturn.jpg',
} as const;

// Kick off texture downloads before any component renders
Object.values(PLANET_TEXTURE_PATHS).forEach(p => useTexture.preload(p));

// ── Per-planet glow palette ──────────────────────────────────────────────────
const GLOW: Record<string, { core: string; mid: string }> = {
  mercury: { core: '#c8b8a8', mid: '#9a8878' },
  venus:   { core: '#ffe090', mid: '#ffb840' },
  earth:   { core: '#5aaaff', mid: '#2266dd' },
  mars:    { core: '#ff7055', mid: '#cc3311' },
  jupiter: { core: '#e8b860', mid: '#b88830' },
  saturn:  { core: '#eeddb0', mid: '#c4ac78' },
};

// ── Twinkling star groups ────────────────────────────────────────────────────
const TwinkleGroup = ({ phase, color }: { phase: number; color: string }) => {
  const ref   = useRef<THREE.Points>(null);
  const COUNT = 45;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 220;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 150;
      arr[i * 3 + 2] = -120 + Math.random() * 50;
    }
    return arr;
  }, []);
  useFrame((s) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.PointsMaterial;
    m.opacity = 0.2 + 0.8 * Math.pow((Math.sin(s.clock.elapsedTime * 1.6 + phase) + 1) / 2, 2);
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.22} color={color} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};
const TwinklingStars = () => (
  <>
    <TwinkleGroup phase={0}   color="#ffffff" />
    <TwinkleGroup phase={1.3} color="#ffffcc" />
    <TwinkleGroup phase={2.6} color="#ccddff" />
    <TwinkleGroup phase={3.9} color="#ffeecc" />
    <TwinkleGroup phase={5.2} color="#ffffff" />
  </>
);

// ── Parallax star layer ───────────────────────────────────────────────────────
const ParallaxLayer = ({ scrollRef }: { scrollRef: React.MutableRefObject<{ progress: number }> }) => {
  const ref   = useRef<THREE.Points>(null);
  const COUNT = 600;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 180;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 100;
      arr[i * 3 + 2] = -50 - Math.random() * 30;
    }
    return arr;
  }, []);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.scale.setScalar(1 + scrollRef.current.progress * 0.35);
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.18} color="#aabbdd" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
};

// ── Nebula cloud ─────────────────────────────────────────────────────────────
const NebulaCloud = ({
  position, color, count = 280, spread = 18,
}: { position: [number, number, number]; color: string; count?: number; spread?: number }) => {
  const ref       = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = spread * Math.pow(Math.random(), 0.55);
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = position[0] + r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = position[1] + r * Math.sin(phi) * Math.sin(theta) * 0.35;
      arr[i * 3 + 2] = position[2] + r * Math.cos(phi);
    }
    return arr;
  }, [position, count, spread]);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.004; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} color={color} transparent opacity={0.07} sizeAttenuation />
    </points>
  );
};

// ── Cosmic dust ──────────────────────────────────────────────────────────────
const CosmicDust = () => {
  const ref   = useRef<THREE.Points>(null);
  const COUNT = 800;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) arr[i] = (Math.random() - 0.5) * 110;
    return arr;
  }, []);
  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 1; i < COUNT * 3; i += 3) { arr[i] -= 0.013; if (arr[i] < -55) arr[i] = 55; }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#8899cc" transparent opacity={0.22} sizeAttenuation />
    </points>
  );
};

// ── Shooting stars ────────────────────────────────────────────────────────────
const ShootingStar = ({ id, onComplete }: { id: number; onComplete: (id: number) => void }) => {
  const lineRef = useRef<THREE.Line>(null);
  const lifeRef = useRef(0);
  const doneRef = useRef(false);
  const MAX     = 1.3;
  const { posArray, geometry, start, dir, speed, trail } = useMemo(() => {
    const posArray = new Float32Array(6);
    const geometry = new THREE.BufferGeometry();
    const attr     = new THREE.BufferAttribute(posArray, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', attr);
    return {
      posArray, geometry,
      start: new THREE.Vector3(
        (Math.random() - 0.5) * 200 + 60,
        40 + Math.random() * 55,
        (Math.random() - 0.5) * 80 - 40,
      ),
      dir:   new THREE.Vector3(-(Math.random() * 1.4 + 0.5), -(Math.random() * 0.7 + 0.2), 0).normalize(),
      speed: Math.random() * 32 + 24,
      trail: Math.random() * 9 + 4,
    };
  }, []);
  useFrame((_, dt) => {
    if (doneRef.current) return;
    lifeRef.current += dt;
    if (lifeRef.current > MAX) { doneRef.current = true; onComplete(id); return; }
    const t = lifeRef.current / MAX;
    const d = t * speed * MAX;
    const head = start.clone().addScaledVector(dir, d);
    const tail = start.clone().addScaledVector(dir, Math.max(0, d - trail));
    posArray[0] = tail.x; posArray[1] = tail.y; posArray[2] = tail.z;
    posArray[3] = head.x; posArray[4] = head.y; posArray[5] = head.z;
    (geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    const op = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
    if (lineRef.current) (lineRef.current.material as THREE.LineBasicMaterial).opacity = op * 0.92;
  });
  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0} />
    </line>
  );
};
const ShootingStarManager = () => {
  const [stars, setStars] = useState<{ id: number }[]>([]);
  const nextRef = useRef(9 + Math.random() * 6);
  const elapsed = useRef(0);
  const idRef   = useRef(0);
  const remove  = useCallback((id: number) => setStars(p => p.filter(s => s.id !== id)), []);
  useFrame((_, dt) => {
    elapsed.current += dt;
    if (elapsed.current >= nextRef.current) {
      elapsed.current = 0;
      nextRef.current = 9 + Math.random() * 6;
      setStars(p => [...p, { id: idRef.current++ }]);
    }
  });
  return <>{stars.map(s => <ShootingStar key={s.id} id={s.id} onComplete={remove} />)}</>;
};

// ── Sun ───────────────────────────────────────────────────────────────────────
const SunCore = () => {
  const tex = useTexture('/textures/sun.jpg');
  return (
    <mesh>
      <sphereGeometry args={[1.8, 32, 32]} />
      <meshBasicMaterial map={tex} color="#ffffff" />
    </mesh>
  );
};
const Sun = () => {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (innerRef.current) innerRef.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.045);
    if (outerRef.current) outerRef.current.scale.setScalar(1 + Math.sin(t * 1.3 + 1) * 0.07);
  });
  return (
    <group>
      <Suspense fallback={
        <mesh>
          <sphereGeometry args={[1.8, 32, 32]} />
          <meshBasicMaterial color="#fff8e0" />
        </mesh>
      }>
        <SunCore />
      </Suspense>
      <mesh ref={innerRef}>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.3} />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[3.3, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.6, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.04} />
      </mesh>
      <pointLight intensity={3.5} color="#fff9e0" distance={250} />
      <pointLight intensity={1.2} color="#ffaa22" distance={70} />
    </group>
  );
};

// ── Orbital path ──────────────────────────────────────────────────────────────
const COLOR_GOLD  = new THREE.Color('#FFD700');
const COLOR_ORBIT = new THREE.Color('#3a4f7a');

const OrbitalRing = ({
  radius, scrollRef, isHighlighted = false,
}: { radius: number; scrollRef: React.MutableRefObject<{ progress: number }>; isHighlighted?: boolean }) => {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const COUNT  = 128;
  const positions = useMemo(() => {
    const arr = new Float32Array((COUNT + 1) * 3);
    for (let i = 0; i <= COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * radius; arr[i * 3 + 1] = 0; arr[i * 3 + 2] = Math.sin(a) * radius;
    }
    return arr;
  }, [radius]);
  useFrame(() => {
    if (!matRef.current) return;
    const targetOpacity = isHighlighted ? 0.75 : THREE.MathUtils.lerp(0, 0.22, scrollRef.current.progress);
    matRef.current.color.lerp(isHighlighted ? COLOR_GOLD : COLOR_ORBIT, 0.08);
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, 0.08);
  });
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT + 1} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial ref={matRef} color="#3a4f7a" transparent opacity={0} />
    </line>
  );
};

// ── Saturn rings ─────────────────────────────────────────────────────────────
const SaturnRings = () => (
  <group rotation={[Math.PI * 0.4, 0.1, 0.05]}>
    <mesh>
      <ringGeometry args={[1.52, 2.0, 64]} />
      <meshBasicMaterial color="#e8d0a0" transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
    <mesh>
      <ringGeometry args={[2.05, 2.55, 64]} />
      <meshBasicMaterial color="#c4ac78" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// ── Planet ────────────────────────────────────────────────────────────────────
interface PlanetProps {
  planet: Planet;
  texture: THREE.Texture | null;
  isSelected: boolean;
  anySelected: boolean;
  onSelect: () => void;
  canInteract: boolean;
  scrollRef: React.MutableRefObject<{ progress: number }>;
}
const PlanetComponent = ({
  planet, texture, isSelected, anySelected, onSelect, canInteract, scrollRef,
}: PlanetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const vs       = getVisualSize(planet.size);
  const selScale = Math.max(1.6, 1.9 / vs) * vs;
  const glow     = GLOW[planet.id] ?? { core: planet.color, mid: planet.color };

  const spinData       = useRef({ active: false, startTime: 0 });
  const prevIsSelected = useRef(false);
  const SPIN_DUR       = 1.4;
  const glowMidColor   = useMemo(() => new THREE.Color(glow.mid), [glow.mid]);

  useEffect(() => {
    if (meshRef.current) meshRef.current.scale.setScalar(vs);
    if (glowRef.current) glowRef.current.scale.setScalar(vs * 1.25);
  }, [vs]);

  useFrame((s, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    const t        = s.clock.elapsedTime;
    const progress = scrollRef.current.progress;

    // Orbit
    if (isSelected) {
      groupRef.current.position.lerp(new THREE.Vector3(8, 0, 5), 0.04);
    } else {
      const angle = t * planet.speed * 0.22;
      groupRef.current.position.set(
        Math.cos(angle) * planet.orbitRadius,
        0,
        Math.sin(angle) * planet.orbitRadius,
      );
    }

    // Scale
    const ts = isSelected ? selScale : vs;
    meshRef.current.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.04);

    // Spin: trigger 360° bell-curve spin on selection
    if (isSelected && !prevIsSelected.current) {
      spinData.current = { active: true, startTime: t };
    }
    prevIsSelected.current = isSelected;

    if (spinData.current.active) {
      const elapsed = t - spinData.current.startTime;
      const p       = Math.min(1, elapsed / SPIN_DUR);
      if (p >= 1) {
        spinData.current.active = false;
      } else {
        const peakRate = (Math.PI * Math.PI) / SPIN_DUR;
        meshRef.current.rotation.y += peakRate * Math.sin(p * Math.PI) * delta;
      }
    } else {
      meshRef.current.rotation.y += 0.003 / Math.max(planet.speed, 0.2);
    }

    // Material opacity (dim non-selected planets to 45%)
    const mat = meshRef.current.material as THREE.MeshPhongMaterial;
    if (mat) {
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity, anySelected && !isSelected ? 0.45 : 1.0, 0.04,
      );
      const p2           = progress * progress;
      const baseEmissive = THREE.MathUtils.lerp(0.06, 0.18, p2);
      const target       = isSelected ? 0.32 : hovered ? 0.18 : baseEmissive;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, 0.07);
    }

    // Glow halo — golden aura when selected
    if (glowRef.current) {
      const gm         = glowRef.current.material as THREE.MeshBasicMaterial;
      const p2         = progress * progress;
      const tOp        = isSelected ? 0.65 : hovered ? 0.38 : THREE.MathUtils.lerp(0.22, 0.45, p2);
      const tGs        = isSelected ? selScale * 1.65
                       : hovered   ? vs * 1.42
                       : vs * THREE.MathUtils.lerp(1.1, 1.32, p2);
      gm.color.lerp(isSelected ? COLOR_GOLD : glowMidColor, 0.06);
      gm.opacity = THREE.MathUtils.lerp(gm.opacity, tOp, 0.07);
      glowRef.current.scale.lerp(new THREE.Vector3(tGs, tGs, tGs), 0.05);
    }
  });

  const onEnter = canInteract ? () => { setHovered(true);  document.body.style.cursor = 'pointer'; } : undefined;
  const onLeave = canInteract ? () => { setHovered(false); document.body.style.cursor = 'auto';    } : undefined;
  const onClick = canInteract ? onSelect : undefined;

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        scale={vs}
        onClick={onClick}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        <sphereGeometry args={[1, 42, 42]} />

        {/* Material is created with texture already set — no needsUpdate required */}
        {texture ? (
          <meshPhongMaterial
            map={texture}
            color="#ffffff"
            emissive={glow.core}
            emissiveIntensity={0.06}
            shininess={35}
            transparent
            opacity={1}
          />
        ) : (
          <meshPhongMaterial
            color={glow.core}
            emissive={glow.core}
            emissiveIntensity={0.42}
            shininess={30}
            transparent
            opacity={1}
          />
        )}

        {planet.id === 'saturn' && <SaturnRings />}
      </mesh>

      {/* Glow halo */}
      <mesh ref={glowRef} scale={vs * 1.25}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={glow.mid} transparent opacity={0.22} />
      </mesh>

      {/* Hover tooltip */}
      {hovered && canInteract && (
        <Html center distanceFactor={12} position={[0, vs + 1.0, 0]}>
          <div style={{
            background:   'rgba(4,6,18,0.85)',
            color:         glow.core,
            padding:       '3px 12px',
            borderRadius:  '20px',
            fontSize:      '11px',
            fontFamily:    "'Iceland', sans-serif",
            letterSpacing: '2.5px',
            border:        `1px solid ${glow.core}55`,
            whiteSpace:    'nowrap',
            textShadow:    `0 0 8px ${glow.core}`,
            pointerEvents: 'none',
          }}>
            {planet.name.toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  );
};

// ── Planet texture loader — suspends until all textures are ready ─────────────
// Same pattern as SunCore: useTexture inside a Suspense, materials created
// with the texture already set so Three.js compiles the shader correctly.
interface PlanetGroupProps {
  selectedPlanet: Planet | null;
  onPlanetSelect: (planet: Planet | null) => void;
  scrollRef: React.MutableRefObject<{ progress: number }>;
  canInteract: boolean;
}
const PlanetGroupWithTextures = ({ selectedPlanet, onPlanetSelect, scrollRef, canInteract }: PlanetGroupProps) => {
  const textures = useTexture(PLANET_TEXTURE_PATHS) as Record<keyof typeof PLANET_TEXTURE_PATHS, THREE.Texture>;

  useMemo(() => {
    Object.values(textures).forEach(tex => { tex.colorSpace = THREE.SRGBColorSpace; });
  }, [textures]);

  return (
    <>
      {PLANETS.map((p: Planet) => (
        <PlanetComponent
          key={p.id}
          planet={p}
          texture={textures[p.id as keyof typeof PLANET_TEXTURE_PATHS] ?? null}
          isSelected={selectedPlanet?.id === p.id}
          anySelected={selectedPlanet !== null}
          onSelect={() => onPlanetSelect(selectedPlanet?.id === p.id ? null : p)}
          canInteract={canInteract}
          scrollRef={scrollRef}
        />
      ))}
    </>
  );
};

// Fallback: render planets with solid colors while textures download
const PlanetGroupFallback = ({ selectedPlanet, onPlanetSelect, scrollRef, canInteract }: PlanetGroupProps) => (
  <>
    {PLANETS.map((p: Planet) => (
      <PlanetComponent
        key={p.id}
        planet={p}
        texture={null}
        isSelected={selectedPlanet?.id === p.id}
        anySelected={selectedPlanet !== null}
        onSelect={() => onPlanetSelect(selectedPlanet?.id === p.id ? null : p)}
        canInteract={canInteract}
        scrollRef={scrollRef}
      />
    ))}
  </>
);

// ── Main scene ────────────────────────────────────────────────────────────────
interface SceneProps {
  selectedPlanet: Planet | null;
  onPlanetSelect: (planet: Planet | null) => void;
  scrollRef: React.MutableRefObject<{ progress: number }>;
  canInteract: boolean;
}
const SolarSystemScene = ({ selectedPlanet, onPlanetSelect, scrollRef, canInteract }: SceneProps) => {
  const { camera, mouse } = useThree();
  const selectedRef = useRef<Planet | null>(null);
  useEffect(() => { selectedRef.current = selectedPlanet; }, [selectedPlanet]);

  useFrame(() => {
    const p   = scrollRef.current.progress;
    const sel = selectedRef.current;

    const baseZ = THREE.MathUtils.lerp(CAM_START_Z, CAM_END_Z, p);
    const baseY = THREE.MathUtils.lerp(CAM_START_Y, CAM_END_Y, p);
    const pStr  = Math.max(0, (p - 0.35) / 0.65);

    const tx = sel ? -6         : mouse.x * 3.5 * pStr;
    const ty = sel ?  4         : baseY + mouse.y * 2 * pStr;
    const tz = sel ? baseZ - 6  : baseZ;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.028);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.028);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.036);

    const rotY = Math.sin(Date.now() * 0.00005) * 0.5 * (1 - p);
    camera.lookAt(sel ? 8 : rotY, 0, 0);
  });

  const planetGroupProps: PlanetGroupProps = { selectedPlanet, onPlanetSelect, scrollRef, canInteract };

  return (
    <>
      <ambientLight intensity={0.25} color="#8899bb" />
      <pointLight position={[-25, 15, 30]} intensity={0.3} color="#5566ee" />

      <Stars radius={150} depth={75} count={7000} factor={4} saturation={0.18} fade />
      <TwinklingStars />
      <CosmicDust />
      <ShootingStarManager />
      <ParallaxLayer scrollRef={scrollRef} />

      <NebulaCloud position={[-65, 22, -85]} color="#8844ff" count={380} spread={22} />
      <NebulaCloud position={[ 72, -8, -90]} color="#ff3366" count={320} spread={18} />
      <NebulaCloud position={[  5, 42,-100]} color="#3366ff" count={300} spread={20} />

      <Sun />

      {PLANETS.map((p: Planet) => (
        <OrbitalRing
          key={`orbit-${p.id}`}
          radius={p.orbitRadius}
          scrollRef={scrollRef}
          isHighlighted={selectedPlanet?.id === p.id}
        />
      ))}

      <Suspense fallback={<PlanetGroupFallback {...planetGroupProps} />}>
        <PlanetGroupWithTextures {...planetGroupProps} />
      </Suspense>
    </>
  );
};

// ── Canvas wrapper ────────────────────────────────────────────────────────────
export interface InteractiveSolarSystemProps {
  selectedPlanet: Planet | null;
  onPlanetSelect: (planet: Planet | null) => void;
  scrollRef: React.MutableRefObject<{ progress: number }>;
  canInteract: boolean;
}
export const InteractiveSolarSystem = ({
  selectedPlanet, onPlanetSelect, scrollRef, canInteract,
}: InteractiveSolarSystemProps) => (
  <Canvas
    camera={{ position: [0, CAM_START_Y, CAM_START_Z], fov: 55 }}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    style={{ width: '100%', height: '100%' }}
  >
    <SolarSystemScene
      selectedPlanet={selectedPlanet}
      onPlanetSelect={onPlanetSelect}
      scrollRef={scrollRef}
      canInteract={canInteract}
    />
  </Canvas>
);
