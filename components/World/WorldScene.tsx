"use client";

import { useEffect, useRef } from "react";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "@/lib/gsap";
import { createCinematicPass } from "./cinematicPass";

import { createSky } from "./scene/sky";
import { createOcean } from "./scene/ocean";
import { createAtoll } from "./scene/atoll";
import { createPalms } from "./scene/palms";
import { createPavilion } from "./scene/pavilion";
import { createSceneText } from "./scene/sceneText";
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
    // Shadow casting is the cheapest big-impact depth cue. PCFSoft gives
    // a perceptually-soft penumbra at modest GPU cost.
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    // ============== Post-processing chain ================================
    // RenderPass → UnrealBloomPass → OutputPass. Bloom lifts the sun
    // glitter, horizon halo, and the pavilion lantern into a soft glow
    // that reads as cinematic film stock. OutputPass handles tone mapping
    // and color space conversion (the standard final pass).
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    composer.setSize(window.innerWidth, window.innerHeight);

    // (RenderPass + UnrealBloomPass + OutputPass added once the scene
    // and camera are constructed below.)

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

    // Wire the post-processing chain now that scene + camera exist.
    composer.addPass(new RenderPass(scene, camera));
    // UnrealBloom: threshold = brightness above which bloom kicks in;
    // strength = overall bloom intensity; radius = soft falloff.
    // Threshold 0.85 keeps everyday lit terrain out of the bloom —
    // only highlights (sun glitter, horizon halo, emissive lantern)
    // contribute. Strength 0.55 is restrained — bloom should feel like
    // anamorphic flare, not VHS smear.
    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      0.55, // strength
      0.7,  // radius
      0.85  // threshold
    );
    composer.addPass(bloomPass);
    // Cinematic pass: chromatic aberration + vignette. Runs after bloom so
    // the bloom's bright halos get the fringe at the edges too — sells the
    // anamorphic captured-frame feel.
    composer.addPass(createCinematicPass());
    composer.addPass(new OutputPass());

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
    const palms = createPalms(scene, {
      count: 36,
      ringRadius: 235,
      ringJitter: 24,
      inletAngle: 0.8,
      inletWidth: 0.7,
    });
    const pavilion = createPavilion(scene, {
      // Sits on the inner ring of the atoll at the Table waypoint anchor,
      // facing across the lagoon toward the warm horizon (the sunset).
      position: { x: 222, y: 14, z: 200 },
      rotationY: -Math.PI * 0.6,
      scale: 1,
    });
    const sceneText = createSceneText(scene);

    // ============== Lighting =============================================
    // Sun in +X+Y+Z octant so chapter 1's camera (which arrives from a
    // similar quadrant) sees the atoll's camera-facing side lit. The ocean
    // shader's uSunDir uniform matches, so the sun-streak runs along the
    // same azimuth as the lit terrain.
    const sun = new DirectionalLight(0xffd7a8, 1.7);
    sun.position.set(560, 280, 720);
    sun.target.position.set(0, 0, 0);
    // Shadow camera frustum sized to cover the atoll + a margin so palm
    // and pavilion shadows reach the lagoon floor and outer reef. Bigger
    // frustum = softer shadow per texel; the 2048 map is the trade-off.
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -500;
    sun.shadow.camera.right = 500;
    sun.shadow.camera.top = 500;
    sun.shadow.camera.bottom = -500;
    sun.shadow.camera.near = 100;
    sun.shadow.camera.far = 2000;
    // Bias to fight self-shadowing acne on the procedurally-displaced atoll
    // (its faces vary in angle, so a constant bias is the simplest fix).
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.05;
    scene.add(sun);
    scene.add(sun.target);

    // Cool ambient fill — keeps shadowed faces from going to absolute black.
    // Slightly warmer + brighter than Phase 1 so the atoll's lit form reads
    // against the deep ocean.
    const ambient = new AmbientLight(0x7d92ab, 0.6);
    scene.add(ambient);

    // ============== Camera path ==========================================
    const cameraPath = createCameraPath(camera);

    // ============== Cursor raycaster =====================================
    // One raycaster shared between two interactions:
    //   - Lantern hover-to-light: hits the pavilion's emissive lantern mesh
    //     and ramps its emissive intensity. Becomes the named "verb" at
    //     chapter 5 but is live throughout — hovering the lantern at any
    //     scroll position glows it.
    //   - Tide cursor ripples: hits the ocean plane, projects the world XZ
    //     coordinate of the hit, and feeds it into the ocean shader so a
    //     ripple displaces at that point. Becomes the named "verb" at
    //     chapter 3 (Tide).
    const raycaster = new Raycaster();
    const mouseNdc = new Vector2(-2, -2); // off-screen at startup
    let lanternGlow = 0;
    let oceanCursorX = 0;
    let oceanCursorZ = 0;
    let oceanCursorStrength = 0;
    const onPointerMove = (e: PointerEvent) => {
      mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdc.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onPointerLeave = () => {
      mouseNdc.set(-2, -2); // out of NDC range — no intersections
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

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
      composer.setSize(window.innerWidth, window.innerHeight);
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

    // ============== Night-mood crossfade ================================
    // Chapter 5 (Lantern) shifts the whole world toward moonlit cool. The
    // crossfade is driven by smoothstep(0.78, 0.95, progress) — it starts
    // gently before chapter 5 arrives and completes by the time the user
    // is fully there. Each affected color/intensity has a "day" baseline
    // and a "night" target.
    const SUN_DAY_COLOR = new Color(0xffd7a8);
    const SUN_NIGHT_COLOR = new Color(0x6d7a90);
    const AMBIENT_DAY_COLOR = new Color(0x7d92ab);
    const AMBIENT_NIGHT_COLOR = new Color(0x4d5d75);
    const SKY_TOP_DAY = new Color(0.045, 0.075, 0.105);
    const SKY_TOP_NIGHT = new Color(0.012, 0.020, 0.038);
    const SKY_HORIZON_DAY = new Color(0.34, 0.22, 0.14);
    const SKY_HORIZON_NIGHT = new Color(0.075, 0.085, 0.120);
    const SKY_BOTTOM_DAY = new Color(0.022, 0.038, 0.055);
    const SKY_BOTTOM_NIGHT = new Color(0.008, 0.015, 0.028);
    const OCEAN_DEEP_DAY = new Color(0.040, 0.105, 0.135);
    const OCEAN_DEEP_NIGHT = new Color(0.020, 0.038, 0.068);
    const OCEAN_SUN_DAY = new Color(0.95, 0.62, 0.32);
    const OCEAN_SUN_NIGHT = new Color(0.55, 0.62, 0.78);
    const SUN_DAY_INTENSITY = 1.7;
    const SUN_NIGHT_INTENSITY = 0.45;
    const AMBIENT_DAY_INTENSITY = 0.6;
    const AMBIENT_NIGHT_INTENSITY = 0.42;

    const tmpColor = new Color();

    const applyNightMood = (progress: number) => {
      // smoothstep(0.78, 0.95) — pre-night warmth dim begins at 0.78,
      // full moonlit by 0.95.
      const tRaw = Math.max(0, Math.min(1, (progress - 0.78) / (0.95 - 0.78)));
      const night = tRaw * tRaw * (3 - 2 * tRaw);

      sun.color.copy(tmpColor.copy(SUN_DAY_COLOR).lerp(SUN_NIGHT_COLOR, night));
      sun.intensity = SUN_DAY_INTENSITY * (1 - night) + SUN_NIGHT_INTENSITY * night;
      ambient.color.copy(
        tmpColor.copy(AMBIENT_DAY_COLOR).lerp(AMBIENT_NIGHT_COLOR, night)
      );
      ambient.intensity =
        AMBIENT_DAY_INTENSITY * (1 - night) + AMBIENT_NIGHT_INTENSITY * night;

      // Drive the sky shader's star field — only visible as uNight > 0.
      sky.setNight(night);

      // Sky uniforms — directly mutate the Color references that the
      // ShaderMaterial holds. Lerp values are written back to the same
      // Color objects to avoid re-uploading uniform structure each frame.
      // The `unknown` cast is because Mesh.material is Material | Material[]
      // — we know these meshes have a single ShaderMaterial.
      const skyMat = sky.mesh.material as unknown as {
        uniforms: Record<string, { value: Color }>;
      };
      skyMat.uniforms.uTopColor.value.copy(
        tmpColor.copy(SKY_TOP_DAY).lerp(SKY_TOP_NIGHT, night)
      );
      skyMat.uniforms.uHorizonColor.value.copy(
        tmpColor.copy(SKY_HORIZON_DAY).lerp(SKY_HORIZON_NIGHT, night)
      );
      skyMat.uniforms.uBottomColor.value.copy(
        tmpColor.copy(SKY_BOTTOM_DAY).lerp(SKY_BOTTOM_NIGHT, night)
      );

      // Ocean uniforms — same pattern.
      const oceanMat = ocean.mesh.material as unknown as {
        uniforms: Record<string, { value: Color }>;
      };
      oceanMat.uniforms.uDeepColor.value.copy(
        tmpColor.copy(OCEAN_DEEP_DAY).lerp(OCEAN_DEEP_NIGHT, night)
      );
      oceanMat.uniforms.uSunColor.value.copy(
        tmpColor.copy(OCEAN_SUN_DAY).lerp(OCEAN_SUN_NIGHT, night)
      );
    };

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

      const progress = reducedMotion ? rawProgress : smoothedProgress;
      cameraPath.update(progress);
      ocean.tick(reducedMotion ? 0 : t);
      sky.tick(reducedMotion ? 0 : t);
      sceneText.tick(progress, camera.position);
      applyNightMood(progress);

      // ============== Cursor interactions =================================
      // Run the raycaster only when the mouse is within NDC bounds — we
      // set it off-screen on pointerleave so this skips work cleanly.
      if (mouseNdc.x > -1.5) {
        raycaster.setFromCamera(mouseNdc, camera);

        // Lantern hover — single-mesh intersect, recursive=false.
        const lanternHits = raycaster.intersectObject(pavilion.lantern, false);
        const lanternTarget = lanternHits.length > 0 ? 1 : 0;
        lanternGlow += (lanternTarget - lanternGlow) * 0.12;
        pavilion.setGlow(lanternGlow);

        // Tide cursor — intersect the ocean plane. If hit, lerp the world
        // XZ toward the hit point and ramp strength up.
        const oceanHits = raycaster.intersectObject(ocean.mesh, false);
        if (oceanHits.length > 0) {
          const p = oceanHits[0].point;
          oceanCursorX += (p.x - oceanCursorX) * 0.18;
          oceanCursorZ += (p.z - oceanCursorZ) * 0.18;
          oceanCursorStrength += (1 - oceanCursorStrength) * 0.08;
        } else {
          oceanCursorStrength += (0 - oceanCursorStrength) * 0.06;
        }
        ocean.setMouseWorld(oceanCursorX, oceanCursorZ);
        ocean.setMouseStrength(oceanCursorStrength);
      } else {
        // No cursor — ramp both effects down.
        lanternGlow += (0 - lanternGlow) * 0.06;
        pavilion.setGlow(lanternGlow);
        oceanCursorStrength += (0 - oceanCursorStrength) * 0.06;
        ocean.setMouseStrength(oceanCursorStrength);
      }

      // Tiny breathing camera idle drift — barely perceptible, so the frame
      // feels alive even when scroll is paused. Disabled under reduced
      // motion.
      if (!reducedMotion) {
        camera.position.x += Math.sin(t * 0.18) * 0.04;
        camera.position.y += Math.cos(t * 0.13) * 0.03;
      }

      // HUD counter only — the chapter NAME now lives in the 3D scene via
      // troika-three-text in sceneText.ts. The counter is a frame-mark
      // showing scroll position through the 5-chapter journey.
      const chapterIdx = cameraPath.currentChapterIndex();
      if (chapterLabelRef.current) {
        const counter = String(chapterIdx + 1).padStart(2, "0");
        const total = String(WAYPOINTS.length).padStart(2, "0");
        chapterLabelRef.current.textContent = `${counter} — ${total}`;
      }
      if (progressLabelRef.current) {
        progressLabelRef.current.textContent = `${Math.round(smoothedProgress * 100)
          .toString()
          .padStart(3, "0")}%`;
      }

      composer.render();
    };
    gsap.ticker.add(tick);

    // ============== Cleanup =============================================
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", refreshMax);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      sky.dispose();
      ocean.dispose();
      atoll.dispose();
      palms.dispose();
      pavilion.dispose();
      sceneText.dispose();
      // Lights don't need explicit disposal but removing them from the
      // scene is good hygiene against HMR leaks.
      scene.remove(sun);
      scene.remove(sun.target);
      scene.remove(ambient);
      composer.dispose();
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
      {/* Phase 2 HUD — restrained, but more present than Phase 1. The
          chapter counter sits as a corner frame-mark; the chapter NAME
          appears mid-frame as italic serif. Phase 3 moves the name into
          the 3D scene as troika-three-text. */}
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
          01 — 05
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
      {/* Scroll cue — only meaningful at the start; fades out as the user
          begins to scroll. Phase 1 just kept it always visible. */}
      <div className="fixed bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none">
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.625rem, 0.7vw, 0.75rem)",
            letterSpacing: "0.5em",
            color: "rgba(245,240,232,0.45)",
          }}
        >
          Scroll
        </span>
        <span
          aria-hidden
          className="scroll-hint-chevron"
          style={{ color: "rgba(245,240,232,0.7)", lineHeight: 0 }}
        >
          <svg
            width="12"
            height="18"
            viewBox="0 0 14 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 8 L7 14 L11 8" />
          </svg>
        </span>
      </div>
    </>
  );
}
