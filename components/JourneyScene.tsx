"use client";

import React, { useEffect, useRef } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
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

// Emissive lantern — warm golden glow with subtle candle flicker. Reuses
// VERTEX_ISLAND (just passes world position). Distance-fog still applies
// so the lantern fades correctly into atmospheric depth.
const FRAGMENT_LANTERN = /* glsl */ `
  precision mediump float;
  uniform vec3 uCameraPos;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uTime;
  varying vec3 vWorldPos;

  void main() {
    float d = length(uCameraPos - vWorldPos);
    float alpha = 1.0 - smoothstep(uFogNear, uFogFar, d);
    float flicker = 0.90 + sin(uTime * 4.0) * 0.045 + sin(uTime * 11.0) * 0.035;
    vec3 col = vec3(0.98, 0.72, 0.38) * flicker;
    gl_FragColor = vec4(col, alpha);
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
// Narrative arc:
//   scrollVH 0–4    → hero, descending from sky toward the island
//   scrollVH 4–6.5  → Moment02 (I), approach and arrive at the island shore
//   scrollVH 6.5–9  → Moment03 (II), aerial reveal of the full island
//                     (the "twenty-eight acres" scale moment)
//   scrollVH 9–11.5  → Moment04 (III), descent from aerial onto the jetty,
//                      then walk down the jetty toward the island — the
//                      "cross by barefoot, the tides keep time" beat
//   scrollVH 11.5–14  → Moment05 (IV), step off the jetty onto the island
//                       and into the palm shade — the "out of the sun, into
//                       the shade" beat. Camera ends close to a nearby palm
//                       which frames the left side of the view.
//   scrollVH 14–16.5  → Moment06 (V), camera moves toward the pavilion
//                       through palm framing — the "pavilion at dusk, lit
//                       by lantern, veiled by palm" beat. Sun direction in
//                       the shader transitions to dusk during this range.
//   scrollVH 16.5–19  → Moment07 (VI), camera moves INTO the open pavilion
//                       and settles close to a table with a lit lantern at
//                       its center — the "a table waiting" beat.
//
// Main island is centered at world position (0, 0, -28). The camera
// approaches it from positive Z, lands at the shore (Moment02), then rises
// vertically for the aerial reveal (Moment03).
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
  // Moment03 enter — begin rising vertically from the shore
  { scrollVH: 7.0, pos: new Vector3(-1,   6,    -19), look: new Vector3(-1,   0.8,  -28) },
  // Moment03 mid-rise — full island starting to fit in frame
  { scrollVH: 7.4, pos: new Vector3(-1,   13,   -20), look: new Vector3(-1,   0.3,  -28) },
  // Moment03 — high aerial, looking down at the layout
  { scrollVH: 7.8, pos: new Vector3(0,    21,   -20), look: new Vector3(0,    0,    -28) },
  // Moment03 peak — full aerial reveal, slight tilt for cinematic frame
  { scrollVH: 8.2, pos: new Vector3(1,    26,   -19), look: new Vector3(0,    0,    -28) },
  // Moment03 hold — slow orbit at peak altitude
  { scrollVH: 8.6, pos: new Vector3(0,    27,   -21), look: new Vector3(0,    0,    -28) },
  // Moment03 end — aerial peak, positioned over the island
  { scrollVH: 9.0, pos: new Vector3(-4,   24,   -23), look: new Vector3(-4,   0,    -28) },
  // Moment04 enter — beginning the descent from aerial toward the jetty
  { scrollVH: 9.4, pos: new Vector3(-2,   14,   -21), look: new Vector3(0,    1,    -25) },
  // Moment04 — descending fast over open water beside the jetty
  { scrollVH: 9.8, pos: new Vector3(0,    7,    -16), look: new Vector3(0,    1.3,  -22) },
  // Moment04 — touching down onto the jetty's outer end
  { scrollVH: 10.2, pos: new Vector3(0.5,  2.8, -14), look: new Vector3(0,    1.4,  -22) },
  // Moment04 — walking the jetty, tides on either side, looking inland
  { scrollVH: 10.6, pos: new Vector3(0.3,  1.8, -16), look: new Vector3(-1,   1.5,  -25) },
  // Moment04 — mid-jetty, palms ahead, pavilion behind them in the haze
  { scrollVH: 11.0, pos: new Vector3(0,    1.7, -18), look: new Vector3(-1.5, 1.5,  -27) },
  // Moment04 end — at the island-side end of the jetty, palms framing view
  { scrollVH: 11.5, pos: new Vector3(-0.5, 1.7, -20), look: new Vector3(-2,   1.5,  -28) },
  // Moment05 enter — stepping off the jetty onto the island
  { scrollVH: 12.0, pos: new Vector3(-1.5, 1.7, -22), look: new Vector3(-2.5, 1.5,  -28) },
  // Moment05 — moving toward the palm zone, light dimming
  { scrollVH: 12.5, pos: new Vector3(-2.5, 1.7, -24), look: new Vector3(-2.5, 1.5,  -28) },
  // Moment05 — entering the palm canopy area
  { scrollVH: 13.0, pos: new Vector3(-3,   1.7, -25.5), look: new Vector3(-2,  1.6,  -28) },
  // Moment05 — under the canopy, close to the nearest palm trunk
  { scrollVH: 13.5, pos: new Vector3(-3,   1.7, -26),   look: new Vector3(-1.5, 1.6, -29) },
  // Moment05 end — dwell in palm shade, looking toward pavilion
  { scrollVH: 14.0, pos: new Vector3(-2.8, 1.7, -26.5), look: new Vector3(-1,  1.6,  -29) },
  // Moment06 enter — moving toward the pavilion through palm framing
  { scrollVH: 14.4, pos: new Vector3(-2.3, 1.7, -26),   look: new Vector3(-1,  1.6,  -28.5) },
  // Moment06 — palms framing the view on either side
  { scrollVH: 14.8, pos: new Vector3(-1.8, 1.7, -25),   look: new Vector3(-1,  1.6,  -28) },
  // Moment06 — pavilion centering as camera moves to its axis
  { scrollVH: 15.2, pos: new Vector3(-1.3, 1.7, -24),   look: new Vector3(-1,  1.7,  -28) },
  // Moment06 — straight-on view, pavilion fills frame, palm canopies edge the top
  { scrollVH: 15.6, pos: new Vector3(-1,   1.7, -23.2), look: new Vector3(-1,  1.7,  -28) },
  // Moment06 — closer, dusk lighting peak
  { scrollVH: 16.0, pos: new Vector3(-1,   1.75, -22.7), look: new Vector3(-1, 1.75, -28) },
  // Moment06 end — intimate dwell on the pavilion
  { scrollVH: 16.5, pos: new Vector3(-1,   1.8,  -22.4), look: new Vector3(-1, 1.7,  -28) },
  // Moment07 enter — moving toward the pavilion entrance
  { scrollVH: 17.0, pos: new Vector3(-1,  1.6,  -24),    look: new Vector3(-1, 1.0,  -28) },
  // Moment07 — at the pavilion's open front, table coming into view
  { scrollVH: 17.5, pos: new Vector3(-1,  1.5,  -25.4),  look: new Vector3(-1, 0.95, -28) },
  // Moment07 — passing under the roof, between front columns
  { scrollVH: 18.0, pos: new Vector3(-1,  1.4,  -26.5),  look: new Vector3(-1, 0.95, -28) },
  // Moment07 — over the table, lantern glow filling the frame
  { scrollVH: 18.5, pos: new Vector3(-1,  1.3,  -27.1),  look: new Vector3(-1, 0.9,  -28) },
  // Moment07 end — intimate close on the lantern, leaning over the table
  { scrollVH: 19.0, pos: new Vector3(-1,  1.2,  -27.3),  look: new Vector3(-1, 0.88, -28) },
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

    // Sun direction transitions from day → dusk during the scroll range
    // approaching the pavilion-at-dusk moment. The water shader's fresnel
    // and sun-glint respond to this, giving a real lighting shift, not a
    // CSS overlay tint.
    const SUN_DAY = new Vector3(0.5, 0.45, -0.7).normalize();
    const SUN_DUSK = new Vector3(0.75, 0.12, -0.35).normalize();
    const sunDir = SUN_DAY.clone();
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

    // Shared material factory for the silhouette layer (island, palms,
    // pavilion, jetty). Same shader, different base colors per element.
    const makeSilhouetteMaterial = (color: Vector3) =>
      new ShaderMaterial({
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

    // === Palm tree — hexagonal trunk + flattened canopy ===
    const makePalm = (
      px: number,
      pz: number,
      height: number,
      color: Vector3
    ): Mesh[] => {
      const trunkH = height * 0.75;
      const trunkGeo = new CylinderGeometry(0.10, 0.22, trunkH, 6);
      trunkGeo.translate(px, trunkH / 2, pz);
      const canopyGeo = new SphereGeometry(height * 0.20, 6, 4);
      canopyGeo.scale(1.6, 0.55, 1.6);
      canopyGeo.translate(px, trunkH + height * 0.05, pz);
      const mat = makeSilhouetteMaterial(color);
      return [new Mesh(trunkGeo, mat), new Mesh(canopyGeo, mat)];
    };

    // === Open pavilion — floor platform + 4 corner columns + roof slab ===
    // Architecturally open (no walls) so the camera can move INTO it during
    // Moment07 without clipping through geometry, and so palm silhouettes
    // read through it from earlier moments.
    const makePavilion = (
      px: number,
      pz: number,
      width: number,
      height: number,
      depth: number,
      color: Vector3
    ): Mesh[] => {
      const meshes: Mesh[] = [];
      const mat = makeSilhouetteMaterial(color);

      // Floor platform — slightly raised
      const platformH = 0.4;
      const platformGeo = new BoxGeometry(width, platformH, depth);
      platformGeo.translate(px, platformH / 2, pz);
      meshes.push(new Mesh(platformGeo, mat));

      // Four corner columns — set in slightly from each corner
      const columnH = height * 0.92;
      const columnInset = 0.45;
      const cornerOffsets: [number, number][] = [
        [-width / 2 + columnInset, -depth / 2 + columnInset],
        [ width / 2 - columnInset, -depth / 2 + columnInset],
        [-width / 2 + columnInset,  depth / 2 - columnInset],
        [ width / 2 - columnInset,  depth / 2 - columnInset],
      ];
      cornerOffsets.forEach(([ox, oz]) => {
        const geo = new CylinderGeometry(0.13, 0.18, columnH, 6);
        geo.translate(px + ox, platformH + columnH / 2, pz + oz);
        meshes.push(new Mesh(geo, mat));
      });

      // Roof slab — overhanging, suspended on the columns
      const roofH = 0.18;
      const roofGeo = new BoxGeometry(width * 1.18, roofH, depth * 1.18);
      roofGeo.translate(px, platformH + columnH + roofH / 2, pz);
      meshes.push(new Mesh(roofGeo, mat));

      return meshes;
    };

    // === Dining table — long thin plank at table height ===
    const makeTable = (
      px: number,
      pz: number,
      length: number,
      tableHeight: number,
      color: Vector3
    ): Mesh => {
      const topGeo = new BoxGeometry(length, 0.08, 0.85);
      topGeo.translate(px, tableHeight, pz);
      return new Mesh(topGeo, makeSilhouetteMaterial(color));
    };

    // === Lantern — small emissive sphere on the table ===
    const makeLantern = (px: number, py: number, pz: number): Mesh => {
      const geo = new SphereGeometry(0.13, 10, 10);
      geo.translate(px, py, pz);
      const mat = new ShaderMaterial({
        vertexShader: VERTEX_ISLAND,
        fragmentShader: FRAGMENT_LANTERN,
        uniforms: {
          uCameraPos: sharedUniforms.uCameraPos,
          uFogNear: sharedUniforms.uFogNear,
          uFogFar: sharedUniforms.uFogFar,
          uTime: sharedUniforms.uTime,
        },
        transparent: true,
        depthWrite: false,
      });
      return new Mesh(geo, mat);
    };

    // === Jetty — thin elongated plank just above water ===
    const makeJetty = (
      px: number,
      pz: number,
      length: number,
      width: number,
      color: Vector3
    ): Mesh => {
      const geo = new BoxGeometry(width, 0.25, length);
      geo.translate(px, 0.12, pz);
      return new Mesh(geo, makeSilhouetteMaterial(color));
    };

    // === Context islands — distant atmospheric silhouettes on the horizon ===
    const contextLeft = makeIsland(20, 2.5, 12, -28, -55, new Vector3(0.04, 0.07, 0.12));
    scene.add(contextLeft);
    const contextRight = makeIsland(15, 2.0, 9, 24, -62, new Vector3(0.04, 0.07, 0.12));
    scene.add(contextRight);

    // === Main island — the destination ===
    // Wider, lower profile than a single peak; broad shoreline silhouette.
    const mainIsland = makeIsland(20, 1.8, 14, 0, -28, new Vector3(0.08, 0.13, 0.18));
    scene.add(mainIsland);

    // Palms — scattered across the main island
    const palmColor = new Vector3(0.04, 0.07, 0.10);
    const palmSpec = [
      { x: -4,  z: -25, h: 6.8 },
      { x: 3,   z: -26, h: 7.4 },
      { x: -2,  z: -30, h: 7.0 },
      { x: 4,   z: -31, h: 6.3 },
      { x: -5,  z: -33, h: 6.5 },
      { x: 1,   z: -34, h: 7.2 },
    ];
    const palmMeshes: Mesh[] = [];
    palmSpec.forEach(({ x, z, h }) => {
      const parts = makePalm(x, z, h, palmColor);
      parts.forEach((m) => {
        scene.add(m);
        palmMeshes.push(m);
      });
    });

    // Pavilion — open architecture, camera can move into it in Moment07.
    const pavilionMeshes = makePavilion(
      -1, -28, 6, 2.7, 5,
      new Vector3(0.06, 0.10, 0.13)
    );
    pavilionMeshes.forEach((m) => scene.add(m));

    // Table — centered inside the pavilion. Slightly off-axis toward the
    // back so camera entering from front gets an approach-to-table beat.
    const table = makeTable(-1, -28.2, 2.2, 0.88, new Vector3(0.08, 0.06, 0.04));
    scene.add(table);

    // Lantern — on the table center. Emissive, flickers; the visual focal
    // point at the end of Moment07's interior approach.
    const lantern = makeLantern(-1, 1.05, -28.2);
    scene.add(lantern);

    // Jetty — extends from the island near-edge toward the camera's
    // approach path. Visible cue that "this is where you arrive."
    const jetty = makeJetty(0, -17, 8, 1.4, new Vector3(0.07, 0.10, 0.14));
    scene.add(jetty);

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

      // Sun direction: day → dusk transition during the lead-up to and
      // through Moment06. Eased so the change is gradual, not stepped.
      const sunT = Math.min(1, Math.max(0, (scrollVH - 11) / 5));
      const sunEased = sunT * sunT * (3 - 2 * sunT);
      sharedUniforms.uSunDir.value.lerpVectors(SUN_DAY, SUN_DUSK, sunEased);

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
      const silhouetteMeshes: Mesh[] = [
        contextLeft,
        contextRight,
        mainIsland,
        ...palmMeshes,
        ...pavilionMeshes,
        table,
        jetty,
      ];
      const disposedMaterials = new Set<ShaderMaterial>();
      silhouetteMeshes.forEach((m) => {
        m.geometry.dispose();
        const mat = m.material as ShaderMaterial;
        if (!disposedMaterials.has(mat)) {
          mat.dispose();
          disposedMaterials.add(mat);
        }
      });
      // Lantern uses its own emissive shader — not shared.
      lantern.geometry.dispose();
      (lantern.material as ShaderMaterial).dispose();
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
