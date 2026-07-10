import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import {
  Color,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
} from 'three';
import { createStarField } from './sceneUtils';

// The tallest ridge peak sits at world y ~0.9 (group y -1.7 + cone base 1.3 +
// half-height 1.3). Start the text below that so it's hidden behind the
// silhouette, then rise it above the peak like a sunrise.
const RISE_START_Y = -0.6;
const RISE_END_Y = 1.85;

// Everything in this scene is driven off ONE normalized progress value
// (0 = full night, 1 = day has arrived / Forest is about to take over).
// This must match CameraRig's STAGE_DURATION so the text finishing its
// transformation lines up with the sky finishing its own color tween.
const SUNRISE_DURATION = 3.6;

// Where the glow (point light + halo) peaks, as a fraction of `progress` —
// "the middle of the rise": the text is still on its way up, not yet at the
// top. Glow ramps in before this point and back out after it.
const GLOW_PEAK = 0.35;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

// The text's own color IS the sunrise: cool moonlight white, through warm
// white and soft yellow (peaking in warmth as the glow peaks), to golden,
// settling into a dark, readable title color once day has fully arrived.
const TEXT_COLOR_STOPS: { t: number; color: Color }[] = [
  { t: 0, color: new Color('#ffffff') },
  { t: 0.2, color: new Color('#fff7dd') },
  { t: GLOW_PEAK, color: new Color('#ffe58a') },
  { t: 0.55, color: new Color('#ffc94d') },
  { t: 1, color: new Color('#3a2f22') },
];

const sampleColorStops = (stops: typeof TEXT_COLOR_STOPS, t: number, target: Color) => {
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t <= b.t) {
      const localT = (t - a.t) / (b.t - a.t || 1);
      return target.copy(a.color).lerp(b.color, MathUtils.clamp(localT, 0, 1));
    }
  }
  return target.copy(stops[stops.length - 1].color);
};

// What the stars/moon blend toward as day breaks — matches Forest's daytime
// sky color so they read as "washed out by the brightening sky" rather than
// simply turning transparent (which would fight SceneLayer's own opacity
// crossfade on the same materials).
const DAY_BLEND_COLOR = new Color(0.75, 0.86, 0.96);
const NIGHT_STAR_COLOR = new Color('#fafafa');
const NIGHT_MOON_COLOR = new Color('#dfe9f8');

// A warm band that grows upward from behind the ridge, anchored at its
// bottom edge (see the position compensation in useFrame) so it reads as
// light spreading up from the horizon rather than the whole sky flashing
// bright at once.
const HORIZON_GLOW_BOTTOM_Y = -0.9;
const HORIZON_GLOW_MIN_SCALE = 0.12;
const HORIZON_GLOW_MAX_SCALE = 7;

const NightScene = () => {
  const stars = useMemo(() => createStarField(), []);
  const moonRef = useRef<Mesh>(null);
  const starGroup = useRef<InstancedMesh>(null);
  const sunGroupRef = useRef<Group>(null);
  const textRef = useRef<any>(null);
  const glowInnerRef = useRef<Mesh>(null);
  const glowOuterRef = useRef<Mesh>(null);
  const glowLightRef = useRef<PointLight>(null);
  const horizonGlowRef = useRef<Mesh>(null);
  const horizonGlowSoftRef = useRef<Mesh>(null);
  const scratchColor = useMemo(() => new Color(), []);
  // Imperatively mutating troika's Text.color via ref proved unreliable
  // (buffered/async sync), so the fill color is driven through the normal,
  // proven-working JSX prop instead — throttled so it isn't a setState on
  // every single frame.
  const [textColorHex, setTextColorHex] = useState('#ffffff');
  const lastColorUpdateRef = useRef(0);

  const starMatrices = useMemo(
    () =>
      stars.map((position) => {
        const matrix = new Matrix4();
        matrix.makeTranslation(position[0], position[1], position[2]);
        return matrix;
      }),
    [stars]
  );

  useLayoutEffect(() => {
    if (!starGroup.current) {
      return;
    }

    starMatrices.forEach((matrix, index) => {
      starGroup.current!.setMatrixAt(index, matrix);
    });
    starGroup.current.instanceMatrix.needsUpdate = true;
  }, [starMatrices]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (starGroup.current) {
      starGroup.current.rotation.y = Math.sin(time * 0.04) * 0.02;
    }

    // The single source of truth for the whole sequence: 0 = full night,
    // 1 = day has arrived. Smoothstep so it eases in and settles, not linear.
    const progress = smoothstep(0, SUNRISE_DURATION, time);

    // Asymmetric bell curve peaking at GLOW_PEAK ("the middle of the rise"):
    // ramps in on the way up to the peak, ramps back out on the way to day.
    const glowRise = smoothstep(0, GLOW_PEAK, progress);
    const glowFall = 1 - smoothstep(GLOW_PEAK, 1, progress);
    const glowT = glowRise * glowFall;

    if (sunGroupRef.current) {
      sunGroupRef.current.position.y = MathUtils.lerp(RISE_START_Y, RISE_END_Y, progress);
    }

    // Throttled to ~15fps — smooth enough for a color fade, far cheaper
    // than a setState (and the React re-render it triggers) every frame.
    if (time - lastColorUpdateRef.current > 0.065) {
      lastColorUpdateRef.current = time;
      sampleColorStops(TEXT_COLOR_STOPS, progress, scratchColor);
      setTextColorHex(`#${scratchColor.getHexString()}`);
    }

    if (glowInnerRef.current) {
      glowInnerRef.current.scale.setScalar(MathUtils.lerp(0.02, 0.95, glowT));
    }
    if (glowOuterRef.current) {
      glowOuterRef.current.scale.setScalar(MathUtils.lerp(0.03, 1.7, glowT));
    }
    if (glowLightRef.current) {
      // Almost no glow initially, ramps to its max at GLOW_PEAK, then eases
      // back down (not to zero — a soft residual warmth carries into day).
      glowLightRef.current.intensity = MathUtils.lerp(0, 3.4, glowT) + glowFall * 0.3;
    }

    if (horizonGlowRef.current) {
      // Uses `progress` (not the bell-curve glowT) — this represents the
      // sky itself lightening, which should hold once day arrives, not fade
      // back out like the sun-flare discs do.
      const s = MathUtils.lerp(HORIZON_GLOW_MIN_SCALE, HORIZON_GLOW_MAX_SCALE, progress);
      horizonGlowRef.current.scale.y = s;
      horizonGlowRef.current.position.y = HORIZON_GLOW_BOTTOM_Y + 0.5 * s;
    }
    if (horizonGlowSoftRef.current) {
      // A taller, fainter band grown a bit further than the main one, so the
      // top edge fades rather than cutting off hard against the night sky.
      const s = MathUtils.lerp(HORIZON_GLOW_MIN_SCALE, HORIZON_GLOW_MAX_SCALE * 1.6, progress);
      horizonGlowSoftRef.current.scale.y = s;
      horizonGlowSoftRef.current.position.y = HORIZON_GLOW_BOTTOM_Y + 0.5 * s;
    }

    if (moonRef.current) {
      moonRef.current.position.y = 2.4 + Math.sin(time * 0.25) * 0.08;
      const material = moonRef.current.material as MeshStandardMaterial;
      material.color.lerpColors(NIGHT_MOON_COLOR, DAY_BLEND_COLOR, progress);
      material.emissiveIntensity = MathUtils.lerp(0.8, 0, progress);
    }
    if (starGroup.current) {
      const material = starGroup.current.material as MeshBasicMaterial;
      material.color.lerpColors(NIGHT_STAR_COLOR, DAY_BLEND_COLOR, progress);
    }
  });

  return (
    <group>
      <instancedMesh ref={starGroup} args={[undefined, undefined, stars.length]} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#fafafa" toneMapped={false} />
      </instancedMesh>
      <group ref={sunGroupRef} position={[0, RISE_START_Y, -5]}>
        <pointLight ref={glowLightRef} color="#ffb454" intensity={0} distance={16} decay={2} />

        {/* <mesh ref={glowOuterRef} position={[0, 0, -0.5]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#ff9d4d" transparent opacity={0.22} />
        </mesh>
        <mesh ref={glowInnerRef} position={[0, 0, -0.25]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#ffe29a" transparent opacity={0.4} />
        </mesh> */}

        <Text
          ref={textRef}
          fontSize={0.42}
          maxWidth={7}
          lineHeight={1.2}
          letterSpacing={0.02}
          textAlign="center"
          color={textColorHex}
          outlineWidth={0.012}
          outlineColor="#8fb0e6"
          outlineOpacity={0.6}
        >
          Happy Birthday Shivani
        </Text>
      </group>
      {/* Horizon glow: grows upward from behind the ridge as day breaks.
          Two stacked bands — a warmer near one and a fainter, taller one
          behind it — approximate a soft gradient without a texture. */}
      <mesh ref={horizonGlowSoftRef} position={[0, HORIZON_GLOW_BOTTOM_Y, -7.4]}>
        <planeGeometry args={[34, 1, 1, 1]} />
        <meshBasicMaterial color="#ffc98a" transparent opacity={0.16} />
      </mesh>
      <mesh ref={horizonGlowRef} position={[0, HORIZON_GLOW_BOTTOM_Y, -7.2]}>
        <planeGeometry args={[32, 1, 1, 1]} />
        <meshBasicMaterial color="#ffab5c" transparent opacity={0.3} />
      </mesh>

      <mesh ref={moonRef} position={[2.8, 2.5, -6]}>
        <sphereGeometry args={[1.1, 20, 20]} />
        <meshStandardMaterial color="#dfe9f8" emissive="#a9c6ff" emissiveIntensity={0.8} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* The text IS the rising sun: its own color carries the sunrise (see
          TEXT_COLOR_STOPS), lit by a point light + halo that peaks partway
          up and fades as day takes over. */}


      <group position={[0, -1.7, -2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[24, 10, 1, 1]} />
          <meshBasicMaterial color="#0d1420" />
        </mesh>
        <mesh position={[-3.6, 0.95, -1.2]} rotation={[0, 0.35, 0]}>
          <coneGeometry args={[2.6, 1.9, 4]} />
          <meshStandardMaterial color="#141d2e" />
        </mesh>
        <mesh position={[0.1, 1.3, -2.6]} rotation={[0, 0.7, 0]}>
          <coneGeometry args={[3.2, 2.6, 4]} />
          <meshStandardMaterial color="#101a2a" />
        </mesh>
        <mesh position={[3.8, 0.85, -1.4]} rotation={[0, -0.45, 0]}>
          <coneGeometry args={[2.4, 1.7, 4]} />
          <meshStandardMaterial color="#141d2e" />
        </mesh>
      </group>
    </group>
  );
};

export default NightScene;
