"use client";

import React, { useEffect, useRef } from "react";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;

uniform float uTime;
uniform float uProgress;
uniform float uVelocity;
uniform vec2  uMouse;
uniform vec2  uResolution;
varying vec2  vUv;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

// Mineral film-stock palette. The day-arc still maps arrival → lagoon →
// golden → intimate → moonlit, but the lagoon stop is now wet-stone green
// rather than tropical turquoise — cyan is pulled out of every midtone so
// nothing reads "fresh." Every stop sits closer to grey-mineral so the
// haze (not color) carries the emotion.
//   0.0 night arrival  -> 0.2 grey-slate dawn  -> 0.4 mineral lagoon
//   0.6 restrained gold -> 0.8 intimate close -> 1.0 cool moonlit
vec3 paletteSky(float t) {
  vec3 c0 = vec3(0.024, 0.055, 0.102); // night arrival — deep navy
  vec3 c1 = vec3(0.080, 0.130, 0.140); // grey-slate dawn (less cyan)
  vec3 c2 = vec3(0.150, 0.250, 0.220); // mineral lagoon (wet stone)
  vec3 c3 = vec3(0.340, 0.270, 0.205); // restrained gold
  vec3 c4 = vec3(0.080, 0.055, 0.040); // intimate close — warm dark
  vec3 c5 = vec3(0.075, 0.105, 0.130); // moonlit — cool grey
  if (t < 0.2) return mix(c0, c1, t / 0.2);
  if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
  return mix(c4, c5, (t - 0.8) / 0.2);
}
vec3 paletteOcean(float t) {
  vec3 c0 = vec3(0.012, 0.027, 0.055); // night ocean — kept
  vec3 c1 = vec3(0.035, 0.070, 0.080); // grey-slate dawn ocean
  vec3 c2 = vec3(0.075, 0.155, 0.130); // mineral lagoon ocean
  vec3 c3 = vec3(0.195, 0.165, 0.130); // restrained golden ocean
  vec3 c4 = vec3(0.045, 0.030, 0.020); // intimate close — deeper
  vec3 c5 = vec3(0.035, 0.045, 0.065); // moonlit ocean — cool
  if (t < 0.2) return mix(c0, c1, t / 0.2);
  if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
  return mix(c4, c5, (t - 0.8) / 0.2);
}
vec3 paletteGlow(float t) {
  vec3 c0 = vec3(0.035, 0.045, 0.060); // pale night glow
  vec3 c1 = vec3(0.320, 0.265, 0.205); // pre-dawn warmth (pulled)
  vec3 c2 = vec3(0.430, 0.415, 0.330); // cool ivory haze (was warmer)
  vec3 c3 = vec3(0.560, 0.395, 0.290); // restrained sunset (pulled)
  vec3 c4 = vec3(0.360, 0.220, 0.145); // restrained ember
  vec3 c5 = vec3(0.155, 0.180, 0.220); // moonlit cool
  if (t < 0.2) return mix(c0, c1, t / 0.2);
  if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
  return mix(c4, c5, (t - 0.8) / 0.2);
}

// Two-octave value noise for the atmospheric haze. Stays cheap (4 hash
// calls); the layered scale gives the fog body more "drift" than a single
// sin/cos band without the cost of a true FBM.
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),               hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

void main() {
  vec2 uv = vUv;

  // Velocity-driven warp — heat-shimmer feel while scrolling, decays fast.
  // Slightly stronger amplitude than before (0.0006 → 0.0008) so the world
  // visibly "breathes" under inertial scroll without ever crossing into
  // distortion.
  float vel = clamp(uVelocity * 0.0008, -0.05, 0.05);
  uv.x += vel * (0.5 - uv.y) * sin(uv.y * 12.0 + uTime * 0.3);

  // Sub-pixel mouse parallax — keeps the world feeling spatial without
  // ever drawing attention to the input.
  vec2 mDelta = uMouse - 0.5;
  uv += mDelta * 0.008;

  float p = clamp(uProgress, 0.0, 1.0);

  // Horizon drifts subtly as we descend through the narrative.
  float horizon = 0.58 - p * 0.06;
  float skyMask = smoothstep(horizon - 0.005, horizon + 0.005, uv.y);

  // Sky: horizon -> top
  float skyT = clamp((uv.y - horizon) / max(1.0 - horizon, 0.001), 0.0, 1.0);
  vec3 skyTop = paletteSky(p);
  vec3 skyHorz = mix(paletteSky(p), paletteGlow(p), 0.55);
  vec3 sky = mix(skyHorz, skyTop, pow(skyT, 1.3));

  // Ocean: bottom -> horizon, with layered shimmer.
  float oceanT = clamp(uv.y / max(horizon, 0.001), 0.0, 1.0);
  vec3 oceanFar  = mix(paletteOcean(p), paletteGlow(p), 0.20);
  vec3 oceanNear = paletteOcean(p) * 0.65;
  float w1 = sin(uv.x * 28.0 + uTime * 0.45) * 0.5 + 0.5;
  float w2 = sin(uv.x * 11.0 - uTime * 0.35 + uv.y * 4.0) * 0.5 + 0.5;
  float waves = mix(0.85, 1.05, w1 * w2);
  vec3 ocean = mix(oceanNear, oceanFar, pow(oceanT, 1.8)) * waves;

  // Composite sky + ocean across the horizon line.
  vec3 col = mix(ocean, sky, skyMask);

  // Warm/cool glow band at the horizon — slightly wider falloff than before
  // (12.0 → 9.5) so the band reads as soft volumetric bloom rather than a
  // hard band. Intensity unchanged.
  float glowMask = exp(-pow((uv.y - horizon) * 9.5, 2.0));
  col += paletteGlow(p) * glowMask * 0.18;

  // === Volumetric atmospheric haze ============================================
  // A drifting fog body biased toward the top of the frame. Pulls everything
  // toward an ivory-tinted glow color (so it reads as light-in-air, not flat
  // grey wash). Scroll velocity nudges the drift — the world "breathes" with
  // momentum. Amount peaks at ~6% so the underlying scene is never veiled.
  vec2 hazeUv = uv * vec2(2.4, 1.6) + vec2(uTime * 0.012, uTime * 0.008 + vel * 1.8);
  float hazeBody = vnoise(hazeUv) * 0.65 + vnoise(hazeUv * 2.3 + 17.0) * 0.35;
  float hazeBand = smoothstep(0.28, 0.95, uv.y);
  // Glow-tinted haze, lifted toward a cool grey-ivory (was warm ivory) so
  // the air reads as humid rather than golden. Amount nudged up slightly
  // (0.075 → 0.085) — the haze does more emotional work in this revision.
  vec3 hazeTint = mix(paletteGlow(p), vec3(0.78, 0.78, 0.76), 0.55);
  float hazeAmt = hazeBody * hazeBand * 0.085;
  col = mix(col, hazeTint, hazeAmt);

  // Stars at the dark ends of the arc (arrival + moonlit).
  float nightAmt = max(smoothstep(0.18, 0.0, p), smoothstep(0.80, 1.0, p));
  if (uv.y > horizon) {
    vec2 starUv = uv * uResolution * 0.0035;
    float star = step(0.997, hash(floor(starUv)));
    float twinkle = 0.5 + 0.5 * sin(uTime * 1.5 + hash(floor(starUv)) * 20.0);
    col += vec3(0.85, 0.90, 1.0) * star * twinkle * nightAmt * 0.6 * skyT;
  }

  // === Subtle chromatic aberration at the frame edges =========================
  // Real anamorphic lenses fringe near the edges. The shift is fixed at one
  // sub-pixel max so the effect reads as "this is a captured frame, not a
  // computer image" without ever being legible as RGB split.
  vec2 caCoord = vUv - 0.5;
  float caStrength = pow(length(caCoord) * 1.4, 2.5) * 0.012;
  float fringeR = paletteGlow(p).r * caStrength;
  float fringeB = paletteSky(p).b * caStrength;
  col.r += fringeR;
  col.b += fringeB;

  // Film grain — slightly denser than before (0.025 → 0.032) for tactile
  // celluloid weight. Keeps the surface alive, never plastic.
  float grain = (hash(uv * uResolution + uTime * 13.0) - 0.5) * 0.032;
  col += grain;

  // === Glow-tinted editorial vignette =========================================
  // Instead of flat darkening, the corner falloff is tinted toward the
  // current palette's complementary cool/warm so the frame edges read as
  // environmental light rather than mask. Slight overall darken (0.85 → 0.88)
  // because the haze already mutes the top half.
  vec2 vCoord = vUv - 0.5;
  float vigDist = dot(vCoord, vCoord);
  float vig = 1.0 - vigDist * 0.88;
  vec3 vigTint = mix(paletteSky(p), vec3(0.0), 0.35);
  col = mix(vigTint, col, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

// === Chapter-anchor progress shaping ===
// The shader interpolates a 6-stop palette across uProgress ∈ [0,1]. If we
// pipe in raw scroll progress, the palette is in constant motion — fine for
// a continuous descent, wrong for an 11-chapter narrative where each scene
// should feel like an inhabited room rather than a stop on a moving belt.
//
// SHAPE_SEGMENTS = 5 produces five atmospheric "rooms" (arrival, lagoon,
// golden, intimate, moonlit). Within each room: held at the lower palette
// stop for the first ~55%, smoothstep-rises across 40%, lands at the upper.
// The existing 0.04 chase lerp on uProgress smooths the rapid-rise window
// further, so transitions read as "passing through a doorway" rather than
// a step. Plateau values (0.0, 0.2, 0.4, 0.6, 0.8, 1.0) align exactly with
// the shader's palette stops in paletteSky/Ocean/Glow.
const SHAPE_SEGMENTS = 5;
const SHAPE_HOLD_END = 0.55;
const SHAPE_RISE_END = 0.95;

const shapeProgress = (raw: number): number => {
  const clamped = Math.min(1, Math.max(0, raw));
  if (clamped >= 1) return 1;
  const scaled = clamped * SHAPE_SEGMENTS;
  const idx = Math.floor(scaled);
  const local = scaled - idx;
  // Smoothstep in [SHAPE_HOLD_END, SHAPE_RISE_END]
  const span = SHAPE_RISE_END - SHAPE_HOLD_END;
  const tNorm = Math.min(1, Math.max(0, (local - SHAPE_HOLD_END) / span));
  const eased = tNorm * tNorm * (3 - 2 * tNorm);
  return Math.min(1, (idx + eased) / SHAPE_SEGMENTS);
};

export default function AtmosphereLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
      });
    } catch {
      // WebGL unavailable — body bg #060e1a is the graceful fallback.
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uVelocity: { value: 0 },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uResolution: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
    };

    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    let visible = !document.hidden;
    let lastScrollY = window.scrollY;
    let smoothedVel = 0;
    const mouseTarget = { x: 0.5, y: 0.5 };
    const start = performance.now();

    // Cache the scrollable height. Reading documentElement.scrollHeight inside
    // the rAF loop forces a synchronous layout every frame on an animated page.
    // Invalidate on resize and on every ScrollTrigger refresh (which recomputes
    // pin offsets and can change scrollHeight).
    let cachedMaxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const refreshMaxScroll = () => {
      cachedMaxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = e.clientX / window.innerWidth;
      mouseTarget.y = 1 - e.clientY / window.innerHeight;
    };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      refreshMaxScroll();
    };
    const onVisibility = () => {
      visible = !document.hidden;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    ScrollTrigger.addEventListener("refresh", refreshMaxScroll);

    // Runs via gsap.ticker so AtmosphereLayer shares the single frame budget
    // with Lenis (SmoothScroll), ScrollTrigger.update, and any tweens in
    // flight. gsap.ticker fires *after* ScrollTrigger.update each frame, so
    // any scroll-derived values read here are already coherent with the
    // current frame's pin/snap state.
    const tick = () => {
      if (!visible) return;

      const now = performance.now();
      const t = (now - start) / 1000;

      const rawProgress = cachedMaxScroll > 0 ? window.scrollY / cachedMaxScroll : 0;
      const progress = shapeProgress(rawProgress);
      const rawVel = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      smoothedVel += (rawVel - smoothedVel) * 0.12;

      uniforms.uTime.value = reducedMotion ? 0 : t;
      uniforms.uProgress.value +=
        (Math.min(1, Math.max(0, progress)) - uniforms.uProgress.value) * 0.04;
      uniforms.uVelocity.value +=
        ((reducedMotion ? 0 : smoothedVel) - uniforms.uVelocity.value) * 0.08;
      uniforms.uMouse.value.x +=
        (mouseTarget.x - uniforms.uMouse.value.x) * 0.05;
      uniforms.uMouse.value.y +=
        (mouseTarget.y - uniforms.uMouse.value.y) * 0.05;

      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      ScrollTrigger.removeEventListener("refresh", refreshMaxScroll);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
