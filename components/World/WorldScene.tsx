"use client";

import { useEffect, useRef } from "react";
import {
  AmbientLight,
  DirectionalLight,
  Fog,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { gsap } from "@/lib/gsap";

import { createSky } from "./scene/sky";
import { createOcean } from "./scene/ocean";
import { createAtoll } from "./scene/atoll";
import { createCameraPath, WAYPOINTS } from "./cameraPath";

/**
 * WorldScene — the Unseen-style 3D atoll. Phase 1 deliverable.
 *
 * What's here in Phase 1:
 *   - Three.js renderer + perspective camera + scene graph
 *   - Sky dome (two-tone gradient shader)
 *   - Ocean (vertex-displaced waves, sunset streak, glitter)
 *   - Atoll (procedurally displaced plane forming a ring + lagoon)
 *   - Soft directional sun + cool ambient
 *   - Scroll-driven camera path through the 5 waypoints (Approach → Lantern)
 *
 * What's NOT here yet (later phases):
 *   - In-scene typography (Phase 3 — troika-three-text)
 *   - Per-chapter interactive verbs (Phase 4)
 *   - Reservation-as-world-moment (Phase 5)
 *   - Post-processing chain — bloom, vignette, fade transitions (Phase 6)
 *
 * The page needs document height for scroll runway — the route provides
 * a 600vh spacer below this fixed canvas so wheel/touch scroll has somewhere
 * to go.
 */

export default function WorldScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressLabelRef = useRef<HTMLSpanElement>(null);
  const chapterLabelRef = useRef<HTMLSpanElement>(null);

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
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x060e1a, 1);

    const scene = new Scene();
    // Distance fog — the body of the atmosphere does its emotional work in
    // the shaders, but a small linear fog pulls far geometry toward the
    // horizon tone so the atoll dissolves into haze rather than reading
    // sharp at far distance.
    scene.fog = new Fog(0x1a2030, 600, 1700);

    const camera = new PerspectiveCamera(
      35, // narrow FOV — cinematic anamorphic feel
      window.innerWidth / window.innerHeight,
      0.5,
      2000
    );

    // ============== Scene composition ====================================
    const sky = createSky(scene);
    const ocean = createOcean(scene);
    const atoll = createAtoll(scene, {
      ringRadius: 280,
      ringHeight: 14,
      ringWidth: 90,
      lagoonDepth: -6,
      segments: 220,
    });

    // ============== Lighting =============================================
    // Warm directional sun — angle matches the ocean shader's uSunDir so the
    // ocean's sun-streak lines up with where the atoll's lit face is.
    const sun = new DirectionalLight(0xffc89a, 1.1);
    sun.position.set(450, 150, 880);
    sun.target.position.set(0, 0, 0);
    scene.add(sun);
    scene.add(sun.target);

    // Cool ambient fill — keeps shadowed faces from going to absolute black.
    const ambient = new AmbientLight(0x6a82a0, 0.45);
    scene.add(ambient);

    // ============== Camera path ==========================================
    const cameraPath = createCameraPath(camera);

    // ============== Scroll driver ========================================
    // Phase 1 uses raw window.scrollY against the document's max-scroll.
    // The route's spacer below this canvas provides the runway. In a later
    // phase we'll wire this into the existing Lenis context so smoothing is
    // unified with the rest of the app — for now, native scroll + a 0.06
    // lerp gives a perfectly usable feel.
    let cachedMaxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const refreshMax = () => {
      cachedMaxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    let smoothedProgress = 0;

    // ============== Resize ==============================================
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      refreshMax();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", refreshMax, { passive: true });

    // ============== Visibility gate =====================================
    let visible = !document.hidden;
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ============== Render loop ==========================================
    const start = performance.now();

    const tick = () => {
      if (!visible) return;

      const now = performance.now();
      const t = (now - start) / 1000;

      // Scroll-tied progress with a gentle lerp so wheel ticks don't
      // translate to twitchy camera jumps.
      const rawProgress =
        cachedMaxScroll > 0 ? window.scrollY / cachedMaxScroll : 0;
      smoothedProgress += (rawProgress - smoothedProgress) * 0.06;

      cameraPath.update(reducedMotion ? rawProgress : smoothedProgress);
      ocean.tick(reducedMotion ? 0 : t);

      // Tiny breathing camera idle drift — barely perceptible, so the frame
      // feels alive even when scroll is paused. Disabled under reduced
      // motion.
      if (!reducedMotion) {
        camera.position.x += Math.sin(t * 0.18) * 0.04;
        camera.position.y += Math.cos(t * 0.13) * 0.03;
      }

      // Phase-aware HUD labels — placeholder. In Phase 3 these become
      // in-scene typography rendered via troika-three-text.
      const chapterIdx = cameraPath.currentChapterIndex();
      const wp = WAYPOINTS[chapterIdx];
      if (chapterLabelRef.current && wp) {
        const counter = String(chapterIdx + 1).padStart(2, "0");
        const total = String(WAYPOINTS.length).padStart(2, "0");
        chapterLabelRef.current.textContent = `${counter} — ${total} · ${wp.title}`;
      }
      if (progressLabelRef.current) {
        progressLabelRef.current.textContent = `${Math.round(smoothedProgress * 100)
          .toString()
          .padStart(3, "0")}%`;
      }

      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    // ============== Cleanup =============================================
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", refreshMax);
      document.removeEventListener("visibilitychange", onVisibility);
      sky.dispose();
      ocean.dispose();
      atoll.dispose();
      // Lights don't need explicit disposal but removing them from the
      // scene is good hygiene against HMR leaks.
      scene.remove(sun);
      scene.remove(sun.target);
      scene.remove(ambient);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="fixed inset-0 w-full h-full z-0"
      />
      {/* Phase 1 HUD — temporary. Phase 3 replaces this with in-scene
          troika-three-text typography. */}
      <div className="fixed top-0 left-0 w-full p-6 md:p-10 z-10 pointer-events-none flex justify-between items-start">
        <span
          ref={chapterLabelRef}
          className="uppercase"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.625rem, 0.75vw, 0.8rem)",
            letterSpacing: "0.45em",
            color: "rgba(245,240,232,0.65)",
          }}
        >
          01 — 05 · Approach
        </span>
        <span
          ref={progressLabelRef}
          className="uppercase"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.625rem, 0.75vw, 0.8rem)",
            letterSpacing: "0.45em",
            color: "rgba(245,240,232,0.5)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          000%
        </span>
      </div>
      <div className="fixed bottom-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.625rem, 0.7vw, 0.75rem)",
            letterSpacing: "0.5em",
            color: "rgba(245,240,232,0.4)",
          }}
        >
          Scroll
        </span>
      </div>
    </>
  );
}
