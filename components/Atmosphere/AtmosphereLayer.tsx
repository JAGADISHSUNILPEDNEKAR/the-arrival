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

// Palette tracks the existing 11-moment narrative arc:
//   0.0 night arrival  -> 0.2 dawn break  -> 0.4 midday lagoon
//   0.6 golden warm    -> 0.8 intimate dining dark  -> 1.0 moonlit ocean
// Mid-page intentionally darkens for the dining acts (Moment06-09) so the
// world below intimate scenes feels warm and close, not bright tropical.
vec3 paletteSky(float t) {
  vec3 c0 = vec3(0.024, 0.055, 0.102); // night arrival
  vec3 c1 = vec3(0.150, 0.220, 0.310); // dawn break
  vec3 c2 = vec3(0.510, 0.760, 0.820); // midday sky
  vec3 c3 = vec3(0.540, 0.380, 0.310); // golden warm
  vec3 c4 = vec3(0.140, 0.090, 0.060); // intimate dining dark
  vec3 c5 = vec3(0.110, 0.140, 0.230); // moonlit
  if (t < 0.2) return mix(c0, c1, t / 0.2);
  if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
  return mix(c4, c5, (t - 0.8) / 0.2);
}
vec3 paletteOcean(float t) {
  vec3 c0 = vec3(0.012, 0.027, 0.055); // night ocean
  vec3 c1 = vec3(0.060, 0.140, 0.240); // pre-dawn ocean
  vec3 c2 = vec3(0.090, 0.460, 0.560); // midday lagoon
  vec3 c3 = vec3(0.360, 0.260, 0.220); // golden ocean
  vec3 c4 = vec3(0.080, 0.050, 0.030); // intimate close
  vec3 c5 = vec3(0.039, 0.063, 0.118); // moonlit
  if (t < 0.2) return mix(c0, c1, t / 0.2);
  if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
  return mix(c4, c5, (t - 0.8) / 0.2);
}
vec3 paletteGlow(float t) {
  vec3 c0 = vec3(0.04, 0.06, 0.10);
  vec3 c1 = vec3(0.55, 0.40, 0.30); // pre-dawn glow
  vec3 c2 = vec3(0.85, 0.65, 0.45); // midday warm horizon
  vec3 c3 = vec3(0.95, 0.55, 0.35); // sunset peak
  vec3 c4 = vec3(0.65, 0.40, 0.25); // ember
  vec3 c5 = vec3(0.20, 0.25, 0.35); // moonlit cool
  if (t < 0.2) return mix(c0, c1, t / 0.2);
  if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
  if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
  if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
  return mix(c4, c5, (t - 0.8) / 0.2);
}

void main() {
  vec2 uv = vUv;

  // Velocity-driven warp — heat-shimmer feel while scrolling, decays fast.
  float vel = clamp(uVelocity * 0.0006, -0.04, 0.04);
  uv.x += vel * (0.5 - uv.y) * sin(uv.y * 12.0 + uTime * 0.3);

  // Sub-pixel mouse parallax.
  vec2 mDelta = uMouse - 0.5;
  uv += mDelta * 0.008;

  float p = clamp(uProgress, 0.0, 1.0);

  // Horizon drifts subtly as we descend through the narrative.
  float horizon = 0.58 - p * 0.06;
  float skyMask = smoothstep(horizon - 0.005, horizon + 0.005, uv.y);

  // Sky: horizon -> top
  float skyT = clamp((uv.y - horizon) / max(1.0 - horizon, 0.001), 0.0, 1.0);
  vec3 skyTop = paletteSky(p);
  vec3 skyHorz = mix(paletteSky(p), paletteGlow(p), 0.65);
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

  // Warm/cool glow band at the horizon.
  float glowMask = exp(-pow((uv.y - horizon) * 12.0, 2.0));
  col += paletteGlow(p) * glowMask * 0.18;

  // Stars at the dark ends of the arc (arrival + moonlit).
  float nightAmt = max(smoothstep(0.18, 0.0, p), smoothstep(0.80, 1.0, p));
  if (uv.y > horizon) {
    vec2 starUv = uv * uResolution * 0.0035;
    float star = step(0.997, hash(floor(starUv)));
    float twinkle = 0.5 + 0.5 * sin(uTime * 1.5 + hash(floor(starUv)) * 20.0);
    col += vec3(0.85, 0.90, 1.0) * star * twinkle * nightAmt * 0.6 * skyT;
  }

  // Film grain — keeps the surface alive, never plastic.
  float grain = (hash(uv * uResolution + uTime * 13.0) - 0.5) * 0.025;
  col += grain;

  // Editorial vignette.
  vec2 vCoord = vUv - 0.5;
  float vig = 1.0 - dot(vCoord, vCoord) * 0.85;
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

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

    let rafId = 0;
    let visible = !document.hidden;
    let lastScrollY = window.scrollY;
    let smoothedVel = 0;
    const mouseTarget = { x: 0.5, y: 0.5 };
    const start = performance.now();

    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = e.clientX / window.innerWidth;
      mouseTarget.y = 1 - e.clientY / window.innerHeight;
    };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    const onVisibility = () => {
      visible = !document.hidden;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!visible) return;

      const now = performance.now();
      const t = (now - start) / 1000;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
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
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
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
