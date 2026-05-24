"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  WebGLRenderer,
} from "three";
import { gsap } from "@/lib/gsap";

/**
 * WebGLContentLayer — fullscreen Three.js plane that renders the curated
 * resort photography as a single morphing surface across every chapter.
 *
 * Each `<section>` that wants a hero photo registers itself via the
 * `useWebGLContent` hook. The layer lazy-loads an `Image()` per entry,
 * uploads it to a `Texture`; an IntersectionObserver tracks each section's
 * visibility ratio and writes it into a shared registry; the render loop
 * picks the most-visible section as "primary" and the next-most-visible
 * adjacent as "secondary," then blends them with a noise-edged dissolve
 * (the organimo-style signature).
 *
 * The shader also applies subtle scroll-velocity displacement (liquid drift
 * on flick scroll, decays to still on rest), a cinematic vignette, and
 * light film grain — so even a static photo never reads as flat stock.
 *
 * z-index: lives at z-1, between AtmosphereLayer (z-0, sky shader) and
 * active chapter sections (z-10 via .moment.active). Reduced-motion or
 * no-WebGL: skips the entire pipeline; each chapter's AssetSlot poster
 * carries the content as a static `<img>`.
 */

export type WebGLContentEntry = {
  id: string;
  src: string;
  poster?: string;
  trigger: HTMLElement;
};

type RegisteredEntry = WebGLContentEntry & {
  texture: Texture | null;
  image: HTMLImageElement | null;
  ratio: number;
  loaded: boolean;
  width: number;
  height: number;
};

interface WebGLContentContextValue {
  register: (entry: WebGLContentEntry) => () => void;
}

const WebGLContentContext = createContext<WebGLContentContextValue | null>(
  null
);

export function useWebGLContent(opts: {
  id: string;
  src: string;
  poster?: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const ctx = useContext(WebGLContentContext);
  const { id, src, poster, triggerRef } = opts;
  useEffect(() => {
    if (!ctx) return;
    const el = triggerRef.current;
    if (!el) return;
    return ctx.register({ id, src, poster, trigger: el });
  }, [ctx, id, src, poster, triggerRef]);
}

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform vec2  uResA;
uniform vec2  uResB;
uniform vec2  uResolution;
uniform float uMorphT;
uniform float uVelocity;
uniform float uTime;
uniform float uPresence;
varying vec2  vUv;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

// Cover-fit: map [0,1] viewport UV onto the texture so it covers the
// viewport without distortion (crops the shorter axis).
vec2 coverUv(vec2 uv, vec2 texRes, vec2 viewRes) {
  if (texRes.x < 1.0 || texRes.y < 1.0) return uv;
  float texA = texRes.x / texRes.y;
  float viewA = viewRes.x / viewRes.y;
  if (viewA > texA) {
    float scale = viewA / texA;
    uv.y = (uv.y - 0.5) / scale + 0.5;
  } else {
    float scale = texA / viewA;
    uv.x = (uv.x - 0.5) / scale + 0.5;
  }
  return uv;
}

void main() {
  vec2 uv = vUv;

  // Velocity-driven liquid drift. Stronger amplitude (0.5 → 0.85) so the
  // photography feels submerged in resistance under inertial scroll — the
  // brief asks for "underwater resistance" and "drifting smoke" as motion
  // language. Clamp still prevents touchpad-fling jitter.
  float vel = clamp(uVelocity * 0.0008, -0.05, 0.05);
  float n = vnoise(uv * 4.0 + vec2(uTime * 0.08, uTime * 0.06));
  vec2 dispDir = vec2(cos(n * 6.2831), sin(n * 6.2831));
  vec2 dispOffset = dispDir * vel * 0.85;

  // Slow constant micro-drift on idle — keeps the frame breathing even when
  // the user pauses. Amplitude is well below perceptual threshold; only
  // visible as a faint living surface, never as motion.
  vec2 idleDrift = vec2(
    sin(uTime * 0.08) * 0.0015,
    cos(uTime * 0.05) * 0.0012
  );

  vec2 uvA = coverUv(uv + dispOffset + idleDrift, uResA, uResolution);
  vec2 uvB = coverUv(uv + dispOffset * 1.10 + idleDrift, uResB, uResolution);

  vec4 colA = texture2D(uTexA, clamp(uvA, vec2(0.001), vec2(0.999)));
  vec4 colB = texture2D(uTexB, clamp(uvB, vec2(0.001), vec2(0.999)));

  // Noise-edge dissolve — the organimo signature. Threshold a noise field
  // against the morph progress so the transition reads as one scene
  // "blooming through" the other. Wider band (0.18 → 0.24) so the dissolve
  // is slower and the seam between two chapters reads as atmospheric
  // continuity, not a wipe.
  float dissolveNoise = vnoise(uv * 6.0 + uTime * 0.03);
  float edge = smoothstep(uMorphT - 0.24, uMorphT + 0.24, dissolveNoise);
  vec4 col = mix(colB, colA, edge);

  // === Cinematic film-stock grading ==========================================
  // The Maldives photography is pulled into the same mineral palette as the
  // atmosphere shader. Heavier desaturation than the first pass (14% → 18%),
  // and the midtone cast now pulls cyan OUT (negative blue push) so nothing
  // reads tropical-fresh — only humid-mineral. Shadow lift biased slightly
  // cooler. Highlight bloom kept warm to preserve golden-hour memory.
  float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  col.rgb = mix(col.rgb, vec3(lum), 0.18);                // desaturate 18%
  col.rgb = mix(vec3(0.028, 0.032, 0.040), col.rgb, 0.96); // shadow lift (cooler)
  float midMask = smoothstep(0.18, 0.55, lum) * (1.0 - smoothstep(0.55, 0.92, lum));
  col.rgb += vec3(-0.010, 0.010, -0.006) * midMask;       // mineral midtones (cyan removed)
  float hiMask = smoothstep(0.78, 0.98, lum);
  col.rgb += vec3(0.024, 0.018, 0.010) * hiMask;          // warm highlight bloom

  // === Deeper cinematic vignette =============================================
  // The corner falloff was 0.62; pull it to 0.46 so editorial type set
  // against bright tropical photography reads with more weight. Curve also
  // widened (0.95 → 1.05 outer) for a softer-edged falloff.
  vec2 vc = uv - 0.5;
  float vig = smoothstep(1.05, 0.28, length(vc));
  col.rgb *= mix(0.46, 1.0, vig);

  // Film grain — slightly denser than before (0.035 → 0.042) to match the
  // tactile celluloid feel of the AtmosphereLayer underneath.
  float grain = (hash(uv * uResolution + uTime * 17.0) - 0.5) * 0.042;
  col.rgb += grain;

  gl_FragColor = vec4(col.rgb, col.a * uPresence);
}
`;

export default function WebGLContentLayer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entriesRef = useRef<Map<string, RegisteredEntry>>(new Map());
  const orderRef = useRef<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const reorderByDOM = useCallback(() => {
    const ids = Array.from(entriesRef.current.keys());
    ids.sort((a, b) => {
      const ea = entriesRef.current.get(a)!;
      const eb = entriesRef.current.get(b)!;
      const pos = ea.trigger.compareDocumentPosition(eb.trigger);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    orderRef.current = ids;
  }, []);

  const register = useCallback(
    (entry: WebGLContentEntry) => {
      const registered: RegisteredEntry = {
        ...entry,
        texture: null,
        image: null,
        ratio: 0,
        loaded: false,
        width: 0,
        height: 0,
      };
      entriesRef.current.set(entry.id, registered);
      reorderByDOM();
      observerRef.current?.observe(entry.trigger);

      // Eagerly start loading the image. Even if the chapter is far
      // off-screen, the file is only a few hundred KB and bandwidth is
      // cheap compared to the user noticing a missing photo on first
      // approach.
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        registered.image = img;
        registered.width = img.naturalWidth;
        registered.height = img.naturalHeight;
        registered.loaded = true;
        // Texture is created lazily in the tick the first time this
        // entry becomes primary/secondary — keeps initial GPU memory
        // bounded if most chapters never enter view.
      };
      img.src = entry.src;

      return () => {
        observerRef.current?.unobserve(entry.trigger);
        registered.texture?.dispose();
        entriesRef.current.delete(entry.id);
        reorderByDOM();
      };
    },
    [reorderByDOM]
  );

  const ctxValue = useMemo<WebGLContentContextValue>(
    () => ({ register }),
    [register]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture the entries Map locally so the cleanup function reads the
    // same instance the effect was originally bound to (satisfies the
    // react-hooks/exhaustive-deps cleanup warning).
    const entries = entriesRef.current;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);

    // Sentinel 2x2 dark texture so the shader always has valid samplers
    // bound, even before any registered image has loaded.
    const emptyTex = new Texture();
    const sentinelCanvas = document.createElement("canvas");
    sentinelCanvas.width = 2;
    sentinelCanvas.height = 2;
    const sctx = sentinelCanvas.getContext("2d");
    if (sctx) {
      sctx.fillStyle = "rgba(6,14,26,1)";
      sctx.fillRect(0, 0, 2, 2);
    }
    emptyTex.image = sentinelCanvas;
    emptyTex.needsUpdate = true;
    emptyTex.minFilter = LinearFilter;
    emptyTex.magFilter = LinearFilter;
    emptyTex.format = RGBAFormat;

    const uniforms = {
      uTexA: { value: emptyTex as Texture },
      uTexB: { value: emptyTex as Texture },
      uResA: { value: new Vector2(1920, 1080) },
      uResB: { value: new Vector2(1920, 1080) },
      uResolution: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
      uMorphT: { value: 0 },
      uVelocity: { value: 0 },
      uTime: { value: 0 },
      uPresence: { value: 0 },
    };

    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    // 21 thresholds (0.0..1.0 by 0.05) gives a smooth-enough ratio signal.
    const observer = new IntersectionObserver(
      (ioEntries) => {
        for (const ioEntry of ioEntries) {
          const target = ioEntry.target as HTMLElement;
          for (const reg of entries.values()) {
            if (reg.trigger === target) {
              reg.ratio = ioEntry.intersectionRatio;
              break;
            }
          }
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    observerRef.current = observer;
    for (const reg of entries.values()) observer.observe(reg.trigger);

    let visible = !document.hidden;
    let lastScrollY = window.scrollY;
    let smoothedVel = 0;
    const start = performance.now();

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    const onVisibility = () => {
      visible = !document.hidden;
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    const ensureTexture = (reg: RegisteredEntry): Texture => {
      if (reg.texture) return reg.texture;
      if (reg.loaded && reg.image) {
        const tex = new Texture(reg.image);
        tex.needsUpdate = true;
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.format = RGBAFormat;
        reg.texture = tex;
        return tex;
      }
      return emptyTex;
    };

    const tick = () => {
      if (!visible) return;

      const now = performance.now();
      uniforms.uTime.value = (now - start) / 1000;

      const rawVel = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      smoothedVel += (rawVel - smoothedVel) * 0.12;
      uniforms.uVelocity.value +=
        (smoothedVel - uniforms.uVelocity.value) * 0.08;

      const order = orderRef.current;
      let primaryIdx = -1;
      let primaryRatio = -1;
      for (let i = 0; i < order.length; i++) {
        const reg = entries.get(order[i]);
        if (!reg) continue;
        if (reg.ratio > primaryRatio) {
          primaryRatio = reg.ratio;
          primaryIdx = i;
        }
      }

      if (primaryIdx === -1 || primaryRatio < 0.02) {
        uniforms.uPresence.value += (0 - uniforms.uPresence.value) * 0.08;
        renderer.render(scene, camera);
        return;
      }

      const primary = entries.get(order[primaryIdx])!;
      let secondary: RegisteredEntry | null = null;
      const before =
        primaryIdx > 0 ? entries.get(order[primaryIdx - 1]) || null : null;
      const after =
        primaryIdx < order.length - 1
          ? entries.get(order[primaryIdx + 1]) || null
          : null;
      if (before && after) {
        secondary = before.ratio > after.ratio ? before : after;
      } else {
        secondary = before || after;
      }

      const texA = ensureTexture(primary);
      const texB = secondary ? ensureTexture(secondary) : emptyTex;
      uniforms.uTexA.value = texA;
      uniforms.uTexB.value = texB;

      uniforms.uResA.value.set(
        primary.width || 1920,
        primary.height || 1080
      );
      uniforms.uResB.value.set(
        secondary?.width || primary.width || 1920,
        secondary?.height || primary.height || 1080
      );

      const secondaryRatio = secondary?.ratio || 0;
      const totalRatio = primaryRatio + secondaryRatio;
      const morphTarget =
        totalRatio > 0.001 ? secondaryRatio / totalRatio : 0;
      uniforms.uMorphT.value +=
        (morphTarget - uniforms.uMorphT.value) * 0.12;

      const presenceTarget = Math.min(1, primaryRatio * 1.5);
      uniforms.uPresence.value +=
        (presenceTarget - uniforms.uPresence.value) * 0.10;

      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      observerRef.current = null;
      for (const reg of entries.values()) reg.texture?.dispose();
      emptyTex.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <WebGLContentContext.Provider value={ctxValue}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
      />
      {children}
    </WebGLContentContext.Provider>
  );
}
