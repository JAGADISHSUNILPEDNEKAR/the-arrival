"use client";

import React, { useEffect, useRef } from "react";
import {
  BufferGeometry,
  CatmullRomCurve3,
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
 * HeroScene — real 3D foreground for the FilmHomepage hero.
 *
 * Architecturally a sibling of AtmosphereLayer (transparent canvas at z-[1]
 * composited over AtmosphereLayer's sky at z-0). AtmosphereLayer still owns
 * the sky/atmosphere arc; this layer adds the 3D foreground the user moves
 * through during the hero's 400vh pin range:
 *
 *   • Water surface — large displaced plane with sun-glint shader, blends
 *     toward transparent at distance so AtmosphereLayer bleeds through
 *   • Two distant island silhouettes at different depths
 *   • Atmospheric haze particles that drift vertically with parallax
 *   • PerspectiveCamera that descends along a CatmullRomCurve3 as the user
 *     scrolls through Acts I → IV — the user is *traveling* through the
 *     scene, not watching components fade in
 *
 * Canvas opacity fades to 0 once the hero scroll range is exited, and rAF
 * skips render work while invisible. No post-processing (DoF/bokeh) in this
 * proof — those are nice-to-have layered on once the foundation reads right.
 */

const VERTEX_WATER = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  varying vec3 vWorldPos;
  varying float vWave;

  // Layered sin waves for surface displacement. Three frequencies = enough
  // visual complexity without breaking the meditative pace.
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

    // Approximate surface normal from wave height — perturbed upward.
    vec3 normal = normalize(vec3(
      sin(vWorldPos.x * 0.6 + uTime * 0.5) * 0.18,
      1.0,
      sin(vWorldPos.z * 0.5 - uTime * 0.4) * 0.18
    ));

    // Fresnel — water becomes more reflective at grazing angles.
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    // Sun glint — specular highlight along sun-reflection vector.
    vec3 reflectDir = reflect(-uSunDir, normal);
    float spec = pow(max(dot(reflectDir, viewDir), 0.0), 80.0);
    vec3 sunHighlight = vec3(1.0, 0.92, 0.78) * spec * 1.6;

    // Base color: lerp from shallow (near camera) to deep (further out)
    // using camera distance as a proxy for "how much water is between you
    // and that point."
    float distFromCam = length(uCameraPos - vWorldPos);
    float deepMix = smoothstep(10.0, 80.0, distFromCam);
    vec3 baseCol = mix(uShallowColor, uDeepColor, deepMix);

    // Fresnel pushes color toward horizon tint at glancing angles.
    vec3 col = mix(baseCol, uHorizonColor, fresnel * 0.65);
    col += sunHighlight;

    // Wave-crest highlight — bright thin line on rising waves.
    float crest = smoothstep(0.30, 0.55, vWave) * 0.18;
    col += vec3(0.85, 0.88, 0.92) * crest;

    // Distance-based alpha — far water fades to fully transparent so the
    // AtmosphereLayer sky behind reads through the horizon line.
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
    // Atmospheric haze — islands fade toward transparent at distance,
    // letting the sky behind bleed through and giving spatial depth.
    float alpha = 1.0 - smoothstep(uFogNear * 0.6, uFogFar, d);

    // Slight upward darker tint (silhouette feel).
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
    // Slow vertical drift + subtle horizontal sway. Each particle has its
    // own seed so the field doesn't move in lockstep.
    vec3 p = position;
    p.y += mod(uTime * 0.10 + aSeed * 50.0, 30.0) - 5.0;
    p.x += sin(uTime * 0.12 + aSeed * 6.28) * 0.6;

    vec4 wp = modelMatrix * vec4(p, 1.0);
    vWorldPos = wp.xyz;

    // Fade in/out within the particle's vertical drift cycle.
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
    // Circular sprite with soft edge.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.20, 0.50, d);

    // Distance haze on particles too — keeps them composited with the
    // atmospheric depth of the rest of the scene.
    float distFromCam = length(uCameraPos - vWorldPos);
    float fogAlpha = 1.0 - smoothstep(uFogNear, uFogFar * 0.85, distFromCam);

    gl_FragColor = vec4(vec3(0.85, 0.88, 0.95), soft * vAlpha * fogAlpha * 0.45);
  }
`;

// === Camera path keyframes — one per hero act + entry/exit anchors ===
const CAMERA_POSITIONS = [
  new Vector3(0, 18, 65), // Pre-Act I — entry anchor for smooth curve start
  new Vector3(0, 16, 58), // Act I — high, vast emptiness
  new Vector3(0, 11, 44), // Act II — horizon focuses
  new Vector3(1.5, 7, 30), // Act III — descending toward an island
  new Vector3(3.5, 4, 18), // Act IV — low approach, slight directional pan
  new Vector3(5, 2.5, 11), // Exit anchor for smooth curve end
];

const LOOKAT_POSITIONS = [
  new Vector3(0, 9, 0),
  new Vector3(0, 6, 0),
  new Vector3(0, 2, 0),
  new Vector3(-1.5, 0.5, 0),
  new Vector3(-3, 0, 0),
  new Vector3(-5, -0.2, 0),
];

const cameraCurve = new CatmullRomCurve3(CAMERA_POSITIONS, false, "catmullrom", 0.5);
const lookAtCurve = new CatmullRomCurve3(LOOKAT_POSITIONS, false, "catmullrom", 0.5);

// Hero pin is 400% of viewport. The camera moves through the full curve
// across that scroll range. After that, the scene fades out.
const HERO_PIN_VH_MULTIPLIER = 4;

export default function HeroScene() {
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
        alpha: true, // transparent clear so AtmosphereLayer reads through
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
    camera.position.copy(CAMERA_POSITIONS[1]);
    camera.lookAt(LOOKAT_POSITIONS[1]);

    // === Shared uniforms ===
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
    water.position.y = 0;
    scene.add(water);

    // === Island silhouettes — procedural low-poly meshes at two depths ===
    const makeIsland = (
      width: number,
      height: number,
      depth: number,
      x: number,
      z: number,
      color: Vector3
    ) => {
      const positions: number[] = [];
      // Triangle fan: peak + 8 base points around an ellipse, palm-tree
      // hint via two thin "trunks" extruding above the silhouette.
      const peakY = height;
      const peak = [x, peakY, z];
      const baseY = 0;
      const segments = 12;
      const basePoints: number[][] = [];
      for (let i = 0; i < segments; i++) {
        const ang = (i / segments) * Math.PI * 2;
        const rx = Math.cos(ang) * width * 0.5;
        const rz = Math.sin(ang) * depth * 0.5;
        // Wobble base profile a touch so it doesn't read as pure cone.
        const wobble = Math.sin(ang * 3) * width * 0.05;
        basePoints.push([x + rx + wobble, baseY, z + rz]);
      }
      for (let i = 0; i < segments; i++) {
        const a = basePoints[i];
        const b = basePoints[(i + 1) % segments];
        positions.push(...peak, ...a, ...b);
      }
      const geo = new BufferGeometry();
      geo.setAttribute(
        "position",
        new Float32BufferAttribute(positions, 3)
      );
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

    // Distant island — large, soft horizon presence
    const islandFar = makeIsland(
      28,
      4,
      18,
      -4,
      -2,
      new Vector3(0.06, 0.10, 0.16)
    );
    scene.add(islandFar);

    // Closer island — sharper silhouette, approached by camera in Act IV
    const islandNear = makeIsland(
      16,
      3,
      11,
      -7,
      8,
      new Vector3(0.08, 0.12, 0.18)
    );
    scene.add(islandNear);

    // === Atmospheric haze particles ===
    const PARTICLE_COUNT = 600;
    const partPositions = new Float32Array(PARTICLE_COUNT * 3);
    const partSizes = new Float32Array(PARTICLE_COUNT);
    const partSeeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      partPositions[i * 3 + 0] = (Math.random() - 0.5) * 70;
      partPositions[i * 3 + 1] = Math.random() * 20 + 0.5;
      partPositions[i * 3 + 2] = (Math.random() - 0.5) * 70 + 10;
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

    // === Scroll-driven camera ===
    let cachedHeroEnd =
      window.innerHeight * HERO_PIN_VH_MULTIPLIER; // approx end of hero pin
    const refreshHeroEnd = () => {
      cachedHeroEnd = window.innerHeight * HERO_PIN_VH_MULTIPLIER;
    };

    let rafId = 0;
    let visible = !document.hidden;
    const start = performance.now();
    const tmpLook = new Vector3();
    const tmpPos = new Vector3();

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      sharedUniforms.uPixelRatio.value = renderer.getPixelRatio();
      refreshHeroEnd();
    };
    const onVisibility = () => {
      visible = !document.hidden;
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    ScrollTrigger.addEventListener("refresh", refreshHeroEnd);

    // Fade canvas opacity in lockstep with scroll exiting the hero range.
    // Below the hero: full opacity. Past the hero: smoothstep to 0 across
    // the next 100vh so the handoff to AtmosphereLayer is gradual.
    const updateCanvasOpacity = () => {
      const past = window.scrollY - cachedHeroEnd;
      if (past <= 0) {
        canvas.style.opacity = "1";
        return true;
      }
      const fade = Math.max(
        0,
        1 - Math.min(1, past / Math.max(window.innerHeight, 1))
      );
      canvas.style.opacity = String(fade);
      return fade > 0.01;
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!visible) return;

      const stillVisible = updateCanvasOpacity();
      if (!stillVisible) return; // skip render work when fully transparent

      const now = performance.now();
      const t = (now - start) / 1000;
      sharedUniforms.uTime.value = reducedMotion ? 4.2 : t;

      // Hero progress 0–1 across the pin range.
      const raw =
        cachedHeroEnd > 0
          ? Math.min(1, Math.max(0, window.scrollY / cachedHeroEnd))
          : 0;

      // Reduced motion: park camera at a poetic mid-position, no motion.
      const camT = reducedMotion ? 0.35 : raw;
      cameraCurve.getPoint(camT, tmpPos);
      lookAtCurve.getPoint(camT, tmpLook);
      camera.position.copy(tmpPos);
      camera.lookAt(tmpLook);
      sharedUniforms.uCameraPos.value.copy(camera.position);

      // Fog distance modulates with camera height — higher up = more haze,
      // lower = more clarity. Reinforces the descent.
      const heightT = Math.min(1, Math.max(0, (camera.position.y - 2) / 16));
      sharedUniforms.uFogNear.value = 28 + heightT * 6;
      sharedUniforms.uFogFar.value = 140 + heightT * 30;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      ScrollTrigger.removeEventListener("refresh", refreshHeroEnd);
      waterGeo.dispose();
      waterMat.dispose();
      islandFar.geometry.dispose();
      (islandFar.material as ShaderMaterial).dispose();
      islandNear.geometry.dispose();
      (islandNear.material as ShaderMaterial).dispose();
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
