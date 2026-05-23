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
  VideoTexture,
  WebGLRenderer,
} from "three";
import { gsap } from "@/lib/gsap";

/**
 * WebGLContentLayer — fullscreen Three.js plane that renders looping
 * video clips as a single morphing surface across every moment of the
 * scroll. The video content here was generated as reference footage and
 * carries the source's watermarks — this PR demonstrates the
 * architecture; production deployments should swap in licensed footage
 * via the same `useWebGLContent` hook.
 *
 * Each `<section>` that wants a clip registers itself via the hook.
 * The layer creates a paused <video> + a VideoTexture per entry; an
 * IntersectionObserver tracks how much of each section is on screen and
 * writes its ratio into a shared registry; the render loop picks the
 * most-visible section as "primary" and the next-most-visible adjacent
 * as "secondary," then blends them with a noise-edged dissolve.
 *
 * Plays only the primary + secondary videos at any given moment; pauses
 * everything else (Safari ~4-video simultaneous-decode limit).
 *
 * z-index: lives at z-1, between AtmosphereLayer (z-0) and active
 * moments (z-10 via .moment.active). Reduced-motion or no-WebGL: skips
 * the entire pipeline; AssetSlot's HTML poster carries the content.
 */

export type WebGLContentEntry = {
  id: string;
  src: string;
  poster?: string;
  trigger: HTMLElement;
};

type RegisteredEntry = WebGLContentEntry & {
  video: HTMLVideoElement;
  texture: VideoTexture | null;
  posterTexture: Texture | null;
  ratio: number;
  loaded: boolean;
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

  // Scroll-velocity-driven liquid drift, clamped against touchpad spikes.
  float vel = clamp(uVelocity * 0.0008, -0.05, 0.05);
  float n = vnoise(uv * 4.0 + vec2(uTime * 0.08, uTime * 0.06));
  vec2 dispDir = vec2(cos(n * 6.2831), sin(n * 6.2831));
  vec2 dispOffset = dispDir * vel * 0.6;

  vec2 uvA = coverUv(uv + dispOffset, uResA, uResolution);
  vec2 uvB = coverUv(uv + dispOffset * 1.15, uResB, uResolution);

  vec4 colA = texture2D(uTexA, clamp(uvA, vec2(0.001), vec2(0.999)));
  vec4 colB = texture2D(uTexB, clamp(uvB, vec2(0.001), vec2(0.999)));

  // Noise-edge dissolve — the organimo signature.
  float dissolveNoise = vnoise(uv * 6.0 + uTime * 0.03);
  float edge = smoothstep(uMorphT - 0.18, uMorphT + 0.18, dissolveNoise);
  vec4 col = mix(colB, colA, edge);

  vec2 vc = uv - 0.5;
  float vig = smoothstep(0.95, 0.30, length(vc));
  col.rgb *= mix(0.78, 1.0, vig);

  float grain = (hash(uv * uResolution + uTime * 17.0) - 0.5) * 0.035;
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
      const video = document.createElement("video");
      video.src = entry.src;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("webkit-playsinline", "true");

      const registered: RegisteredEntry = {
        ...entry,
        video,
        texture: null,
        posterTexture: null,
        ratio: 0,
        loaded: false,
      };
      entriesRef.current.set(entry.id, registered);
      reorderByDOM();
      observerRef.current?.observe(entry.trigger);

      return () => {
        observerRef.current?.unobserve(entry.trigger);
        registered.video.pause();
        registered.video.removeAttribute("src");
        registered.video.load();
        registered.texture?.dispose();
        registered.posterTexture?.dispose();
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
    // bound, even before any registered video has produced a frame.
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
      uResA: { value: new Vector2(1280, 720) },
      uResB: { value: new Vector2(1280, 720) },
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
      if (!visible) {
        for (const reg of entries.values()) reg.video.pause();
      }
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    const ensureTexture = (reg: RegisteredEntry): Texture => {
      if (reg.texture) return reg.texture;
      if (reg.video.readyState >= 2) {
        const tex = new VideoTexture(reg.video);
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.format = RGBAFormat;
        reg.texture = tex;
        reg.loaded = true;
        return tex;
      }
      if (!reg.posterTexture && reg.poster) {
        const tex = new Texture();
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          tex.image = img;
          tex.needsUpdate = true;
        };
        img.src = reg.poster;
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.format = RGBAFormat;
        reg.posterTexture = tex;
      }
      return reg.posterTexture || emptyTex;
    };

    const playIfNeeded = (reg: RegisteredEntry) => {
      if (reg.video.paused && reg.video.readyState >= 2) {
        const p = reg.video.play();
        if (p && typeof p.catch === "function") p.catch(() => undefined);
      }
    };

    const sizeOf = (reg: RegisteredEntry): [number, number] => {
      if (reg.video.videoWidth > 0 && reg.video.videoHeight > 0) {
        return [reg.video.videoWidth, reg.video.videoHeight];
      }
      return [1280, 720];
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

      const [aw, ah] = sizeOf(primary);
      uniforms.uResA.value.set(aw, ah);
      if (secondary) {
        const [bw, bh] = sizeOf(secondary);
        uniforms.uResB.value.set(bw, bh);
      } else {
        uniforms.uResB.value.set(aw, ah);
      }

      const secondaryRatio = secondary?.ratio || 0;
      const totalRatio = primaryRatio + secondaryRatio;
      const morphTarget =
        totalRatio > 0.001 ? secondaryRatio / totalRatio : 0;
      uniforms.uMorphT.value +=
        (morphTarget - uniforms.uMorphT.value) * 0.12;

      const presenceTarget = Math.min(1, primaryRatio * 1.5);
      uniforms.uPresence.value +=
        (presenceTarget - uniforms.uPresence.value) * 0.10;

      // Playback gating — only primary + secondary play.
      for (const reg of entries.values()) {
        if (reg === primary || reg === secondary) {
          playIfNeeded(reg);
        } else if (!reg.video.paused) {
          reg.video.pause();
        }
      }

      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      observerRef.current = null;
      for (const reg of entries.values()) {
        reg.video.pause();
        reg.video.removeAttribute("src");
        reg.video.load();
        reg.texture?.dispose();
        reg.posterTexture?.dispose();
      }
      entries.clear();
      orderRef.current = [];
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
