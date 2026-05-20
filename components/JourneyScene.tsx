"use client";

import React, { useEffect, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * JourneyScene — the continuous 3D world the camera traverses across the
 * page scroll. Replaces the per-moment-procedural-CSS approach: instead of
 * discrete scenes, there is one ocean, one set of islands, one atmosphere,
 * and the moments are camera dwells at chosen world positions.
 *
 * Architecture:
 *   • Single Three.js scene, transparent canvas at z-[1], composited over
 *     AtmosphereLayer's sky gradient (z-0).
 *   • Camera follows a piecewise scroll-driven path. WAYPOINTS map scroll
 *     position (in viewport-height units) to camera position + lookAt.
 *     Smoothstep eases each segment so velocity → 0 at each waypoint,
 *     creating a natural "dwell" feel at each moment.
 *   • Currently covers: hero (FilmHomepage, 0–4vh) + Moment02 (4–6.5vh).
 *     Beyond Moment02 the canvas fades out and AtmosphereLayer takes over
 *     until subsequent moments are extended into this scene.
 *
 * What's NOT here (deferred to follow-up extensions):
 *   • Per-moment lighting / fog tuning (currently global)
 *   • DoF / bokeh / EffectComposer post-processing
 *   • Real texture maps (procedural shaders only)
 *   • Moments 03-11 (CSS-procedural for now)
 */

const VERTEX_WATER = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  varying vec3 vWorldPos;
  varying float vWave;

  float waveHeight(vec2 p) {
    float h = 0.0;
    h += sin(p.x * 0.18 + uTime * 0.30) * 0.45;
    h += sin(p.y * 0.13 - uTime * 0.22) * 0.40;
    h += sin((p.x + p.y) * 0.07 + uTime * 0.18) * 0.30;
    h += sin(p.x * 0.45 - p.y * 0.30 + uTime * 0.55) * 0.12;
    return h;
  }

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float h = waveHeight(wp.xz);
    wp.y += h;
    vWorldPos = wp.xyz;
    vWave = h;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT_WATER = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec3 uCameraPos;
  uniform vec3 uSunDir;
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uHorizonColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vWorldPos;
  varying float vWave;

  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    vec3 normal = normalize(vec3(
      sin(vWorldPos.x * 0.6 + uTime * 0.5) * 0.18,
      1.0,
      sin(vWorldPos.z * 0.5 - uTime * 0.4) * 0.18
    ));
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    vec3 reflectDir = reflect(-uSunDir, normal);
    float spec = pow(max(dot(reflectDir, viewDir), 0.0), 80.0);
    vec3 sunHighlight = vec3(1.0, 0.92, 0.78) * spec * 1.6;

    float distFromCam = length(uCameraPos - vWorldPos);
    float deepMix = smoothstep(10.0, 80.0, distFromCam);
    vec3 baseCol = mix(uShallowColor, uDeepColor, deepMix);
    vec3 col = mix(baseCol, uHorizonColor, fresnel * 0.65);
    col += sunHighlight;

    float crest = smoothstep(0.30, 0.55, vWave) * 0.18;
    col += vec3(0.85, 0.88, 0.92) * crest;

    float alpha = 1.0 - smoothstep(uFogNear, uFogFar, distFromCam);
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

const VERTEX_ISLAND = /* glsl */ `
  precision mediump float;
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT_ISLAND = /* glsl */ `
  precision mediump float;
  uniform vec3 uCameraPos;
  uniform vec3 uIslandColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vWorldPos;

  void main() {
    float d = length(uCameraPos - vWorldPos);
    float alpha = 1.0 - smoothstep(uFogNear * 0.6, uFogFar, d);
    float heightFade = smoothstep(0.0, 4.0, vWorldPos.y);
    vec3 col = mix(uIslandColor, uIslandColor * 0.55, heightFade);
    gl_FragColor = vec4(col, alpha * 0.92);
  }
`;

const VERTEX_PARTICLE = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aSeed;
  varying float vAlpha;
  varying vec3 vWorldPos;

  void main() {
    vec3 p = position;
    p.y += mod(uTime * 0.10 + aSeed * 50.0, 30.0) - 5.0;
    p.x += sin(uTime * 0.12 + aSeed * 6.28) * 0.6;

    vec4 wp = modelMatrix * vec4(p, 1.0);
    vWorldPos = wp.xyz;

    float cycle = mod(uTime * 0.10 + aSeed * 50.0, 30.0);
    vAlpha = smoothstep(0.0, 4.0, cycle) * (1.0 - smoothstep(20.0, 28.0, cycle));

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (200.0 / -mv.z);
  }
`;

const FRAGMENT_PARTICLE = /* glsl */ `
  precision mediump float;
  uniform vec3 uCameraPos;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlpha;
  varying vec3 vWorldPos;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.20, 0.50, d);

    float distFromCam = length(uCameraPos - vWorldPos);
    float fogAlpha = 1.0 - smoothstep(uFogNear, uFogFar * 0.85, distFromCam);

    gl_FragColor = vec4(vec3(0.85, 0.88, 0.95), soft * vAlpha * fogAlpha * 0.45);
  }
`;

// === Scroll-to-camera waypoints =============================================
// Each entry maps a scroll position (in viewport-height units) to a camera
// position + lookAt target. Smoothstep interpolation between waypoints means
// velocity is zero at each anchor — creates the "dwell" feel at each moment.
//
// scrollVH 0–4   → hero (FilmHomepage pins for 400%)
// scrollVH 4–6.5 → Moment02 (sanctuary, pins for 250% on desktop)
// Beyond 6.5 the canvas fades out; subsequent moments revert to
// AtmosphereLayer-only until they're extended into this scene.
interface Waypoint {
  scrollVH: number;
  pos: Vector3;
  look: Vector3;
}

const WAYPOINTS: Waypoint[] = [
  // Hero — pre-Act I, high & far. Island visible as small distant silhouette.
  { scrollVH: 0,   pos: new Vector3(0,    22,   32),  look: new Vector3(0,    6,    -16) },
  // Hero Act I — descending
  { scrollVH: 1,   pos: new Vector3(0,    18,   22),  look: new Vector3(0,    4,    -18) },
  // Hero Act II — horizon focuses, island grows in frame
  { scrollVH: 2,   pos: new Vector3(0,    12,   12),  look: new Vector3(0,    2,    -22) },
  // Hero Act III — low altitude, island fills more of view
  { scrollVH: 3,   pos: new Vector3(0,    7,    2),   look: new Vector3(0,    1,    -25) },
  // Hero Act IV — very close to water, island close ahead
  { scrollVH: 4,   pos: new Vector3(0,    3.5,  -5),  look: new Vector3(0,    1,    -27) },
  // Bridge from hero exit into Moment02
  { scrollVH: 4.5, pos: new Vector3(0,    2.8,  -10), look: new Vector3(-1,   1,    -28) },
  // Moment02 enter — sees jetty + pavilion ahead clearly
  { scrollVH: 5,   pos: new Vector3(0,    2.2,  -13), look: new Vector3(-1,   1,    -28) },
  // Moment02 mid — at the jetty's outer end, looking inland
  { scrollVH: 5.5, pos: new Vector3(0,    1.8,  -16), look: new Vector3(-1,   1.2,  -28) },
  // Moment02 late — moving along the jetty
  { scrollVH: 6,   pos: new Vector3(-0.5, 1.6,  -18), look: new Vector3(-1,   1.3,  -28) },
  // Moment02 end — arrived. Camera dwells at the shore, looking at pavilion.
  { scrollVH: 6.5, pos: new Vector3(-1,   1.5,  -20), look: new Vector3(-1,   1.3,  -28) },
];

const JOURNEY_END_VH = WAYPOINTS[WAYPOINTS.length - 1].scrollVH;
// Canvas fully visible through JOURNEY_END_VH, then fades over the next 1vh
// of scroll before becoming hidden (AtmosphereLayer takes over).
const CANVAS_FADE_DURATION_VH = 1.0;

const smoothstep01 = (t: number) => t * t * (3 - 2 * t);

export default function JourneyScene() {
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
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    camera.position.copy(WAYPOINTS[0].pos);
    camera.lookAt(WAYPOINTS[0].look);

    const sunDir = new Vector3(0.5, 0.45, -0.7).normalize();
    const sharedUniforms = {
      uTime: { value: 0 },
      uCameraPos: { value: camera.position.clone() },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uSunDir: { value: sunDir },
      uFogNear: { value: 30.0 },
      uFogFar: { value: 150.0 },
    };

    // === Water surface ===
    const waterGeo = new PlaneGeometry(400, 400, 96, 96);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new ShaderMaterial({
      vertexShader: VERTEX_WATER,
      fragmentShader: FRAGMENT_WATER,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uCameraPos: sharedUniforms.uCameraPos,
        uSunDir: sharedUniforms.uSunDir,
        uFogNear: sharedUniforms.uFogNear,
        uFogFar: sharedUniforms.uFogFar,
        uDeepColor: { value: new Vector3(0.025, 0.075, 0.135) },
        uShallowColor: { value: new Vector3(0.085, 0.165, 0.235) },
        uHorizonColor: { value: new Vector3(0.40, 0.55, 0.68) },
      },
      transparent: true,
      depthWrite: false,
    });
    const water = new Mesh(waterGeo, waterMat);
    scene.add(water);

    // === Island silhouettes ===
    const makeIsland = (
      width: number,
      height: number,
      depth: number,
      x: number,
      z: number,
      color: Vector3
    ) => {
      const positions: number[] = [];
      const peakY = height;
      const peak = [x, peakY, z];
      const segments = 12;
      const basePoints: number[][] = [];
      for (let i = 0; i < segments; i++) {
        const ang = (i / segments) * Math.PI * 2;
        const rx = Math.cos(ang) * width * 0.5;
        const rz = Math.sin(ang) * depth * 0.5;
        const wobble = Math.sin(ang * 3) * width * 0.05;
        basePoints.push([x + rx + wobble, 0, z + rz]);
      }
      for (let i = 0; i < segments; i++) {
        const a = basePoints[i];
        const b = basePoints[(i + 1) % segments];
        positions.push(...peak, ...a, ...b);
      }
      const geo = new BufferGeometry();
      geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
      geo.computeVertexNormals();

      const mat = new ShaderMaterial({
        vertexShader: VERTEX_ISLAND,
        fragmentShader: FRAGMENT_ISLAND,
        uniforms: {
          uCameraPos: sharedUniforms.uCameraPos,
          uIslandColor: { value: color },
          uFogNear: sharedUniforms.uFogNear,
          uFogFar: sharedUniforms.uFogFar,
        },
        transparent: true,
        depthWrite: false,
      });
      return new Mesh(geo, mat);
    };

    // Hero distant island — soft horizon presence during Acts I-III
    const islandFar = makeIsland(28, 4, 18, -4, -2, new Vector3(0.06, 0.10, 0.16));
    scene.add(islandFar);

    // Hero closer island — approached in Act IV
    const islandNear = makeIsland(16, 3, 11, -7, 8, new Vector3(0.08, 0.12, 0.18));
    scene.add(islandNear);

    // Moment02 sanctuary — small intimate silhouette, camera dwells nearby
    const sanctuary = makeIsland(7, 2.5, 5, -6, -4, new Vector3(0.05, 0.09, 0.14));
    scene.add(sanctuary);

    // === Atmospheric haze particles ===
    const PARTICLE_COUNT = 600;
    const partPositions = new Float32Array(PARTICLE_COUNT * 3);
    const partSizes = new Float32Array(PARTICLE_COUNT);
    const partSeeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3 + 0] = (Math.random() - 0.5) * 80;
      partPositions[i * 3 + 1] = Math.random() * 20 + 0.5;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 + 0;
      partSizes[i] = 1.4 + Math.random() * 2.6;
      partSeeds[i] = Math.random();
    }
    const partGeo = new BufferGeometry();
    partGeo.setAttribute("position", new Float32BufferAttribute(partPositions, 3));
    partGeo.setAttribute("aSize", new Float32BufferAttribute(partSizes, 1));
    partGeo.setAttribute("aSeed", new Float32BufferAttribute(partSeeds, 1));

    const partMat = new ShaderMaterial({
      vertexShader: VERTEX_PARTICLE,
      fragmentShader: FRAGMENT_PARTICLE,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uCameraPos: sharedUniforms.uCameraPos,
        uPixelRatio: sharedUniforms.uPixelRatio,
        uFogNear: sharedUniforms.uFogNear,
        uFogFar: sharedUniforms.uFogFar,
      },
      transparent: true,
      depthWrite: false,
    });
    const particles = new Points(partGeo, partMat);
    scene.add(particles);

    // === Scroll-driven camera + canvas opacity ===
    const tmpPos = new Vector3();
    const tmpLook = new Vector3();

    const sampleWaypoints = (scrollVH: number) => {
      const clamped = Math.max(0, scrollVH);
      // Find segment
      let lower = WAYPOINTS[0];
      let upper = WAYPOINTS[WAYPOINTS.length - 1];
      if (clamped <= WAYPOINTS[0].scrollVH) {
        tmpPos.copy(WAYPOINTS[0].pos);
        tmpLook.copy(WAYPOINTS[0].look);
        return;
      }
      if (clamped >= WAYPOINTS[WAYPOINTS.length - 1].scrollVH) {
        tmpPos.copy(WAYPOINTS[WAYPOINTS.length - 1].pos);
        tmpLook.copy(WAYPOINTS[WAYPOINTS.length - 1].look);
        return;
      }
      for (let i = 0; i < WAYPOINTS.length - 1; i++) {
        if (clamped >= WAYPOINTS[i].scrollVH && clamped <= WAYPOINTS[i + 1].scrollVH) {
          lower = WAYPOINTS[i];
          upper = WAYPOINTS[i + 1];
          break;
        }
      }
      const span = Math.max(upper.scrollVH - lower.scrollVH, 0.001);
      const localT = (clamped - lower.scrollVH) / span;
      const eased = smoothstep01(localT);
      tmpPos.lerpVectors(lower.pos, upper.pos, eased);
      tmpLook.lerpVectors(lower.look, upper.look, eased);
    };

    let rafId = 0;
    let visible = !document.hidden;
    const start = performance.now();

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      sharedUniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    const onVisibility = () => {
      visible = !document.hidden;
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    ScrollTrigger.addEventListener("refresh", onResize);

    const updateCanvasOpacity = (scrollVH: number) => {
      if (scrollVH <= JOURNEY_END_VH) {
        canvas.style.opacity = "1";
        return true;
      }
      const past = scrollVH - JOURNEY_END_VH;
      const fade = Math.max(0, 1 - past / CANVAS_FADE_DURATION_VH);
      canvas.style.opacity = String(fade);
      return fade > 0.01;
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!visible) return;

      const vh = Math.max(window.innerHeight, 1);
      const scrollVH = window.scrollY / vh;

      const stillVisible = updateCanvasOpacity(scrollVH);
      if (!stillVisible) return;

      const now = performance.now();
      const t = (now - start) / 1000;
      sharedUniforms.uTime.value = reducedMotion ? 4.2 : t;

      // Reduced motion: park at a poetic mid-position, no camera motion.
      const camScrollVH = reducedMotion ? 1.4 : scrollVH;
      sampleWaypoints(camScrollVH);

      camera.position.copy(tmpPos);
      camera.lookAt(tmpLook);
      sharedUniforms.uCameraPos.value.copy(camera.position);

      // Fog distance modulates with camera height — higher = more haze.
      const heightT = Math.min(1, Math.max(0, (camera.position.y - 1.5) / 16.5));
      sharedUniforms.uFogNear.value = 28 + heightT * 6;
      sharedUniforms.uFogFar.value = 140 + heightT * 30;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      ScrollTrigger.removeEventListener("refresh", onResize);
      waterGeo.dispose();
      waterMat.dispose();
      [islandFar, islandNear, sanctuary].forEach((m) => {
        m.geometry.dispose();
        (m.material as ShaderMaterial).dispose();
      });
      partGeo.dispose();
      partMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ opacity: 1, transition: "opacity 200ms linear" }}
    />
  );
}
