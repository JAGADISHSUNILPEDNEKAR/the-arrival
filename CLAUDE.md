# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

"The Arrival" — a Next.js 16 single-page cinematic scroll experience for a luxury private island restaurant. The entire page is one vertically-pinned scroll journey composed of 11 "moments" plus a preloader and global nav.

## Commands

- `npm run dev` — Next.js dev server (default http://localhost:3000)
- `npm run build` — production build
- `npm start` — start production server
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

No test runner is configured.

## Stack

- Next.js 16.2.3 App Router + React 19.2.4 + TypeScript 5 (strict)
- Tailwind CSS v4 via `@tailwindcss/postcss` — **no `tailwind.config.*`**; Tailwind is loaded by `@import "tailwindcss"` at the top of `app/globals.css`
- GSAP 3.14 with `ScrollTrigger`, `SplitText`, `CustomEase`
- Lenis for smooth scroll, driven by GSAP's ticker
- Path alias: `@/*` → repo root

## Architecture

### Composition (top-down)
1. `app/layout.tsx` loads Cormorant Garamond (exposed as `--font-serif`), mounts the global `<CustomCursor>` **outside** the providers, then wraps children in `<Providers><SmoothScroll>`.
2. `app/page.tsx` renders `<ScrollJourney/>` — the whole site.
3. `components/ScrollJourney.tsx` renders `<AtmosphereLayer>` (bedrock world) + `<Preloader>` + `<GlobalNav>` + a vertical stack of scenes: `FilmHomepage` followed by `Moment02..Moment11`. Each scene self-pins; the page has no shared master timeline (the `ScrollContext.masterTl` slot exists but is currently unused — `setMasterTl` is read but never called).

### Persistent atmosphere (`components/Atmosphere/AtmosphereLayer.tsx`)
A single Three.js fragment shader on a full-screen plane lives at `fixed inset-0 z-0` behind every moment. It is the world; the moments are color-grading overlays on top.

- **Stack:** raw `three` (no `@react-three/fiber`). One `OrthographicCamera`, one `PlaneGeometry(2,2)`, one `ShaderMaterial`. DPR capped at 1.5, `mediump` precision, depth disabled.
- **Uniforms driven on every rAF:** `uTime` (continuous), `uProgress` (= `scrollY / (scrollHeight − innerHeight)`, lerped 0.04), `uVelocity` (scroll-delta, lerped 0.08, decays in ~400ms), `uMouse` (lerped 0.05), `uResolution`.
- **Shader narrative:** 6-stop luxury day-arc palette (night arrival → pre-dawn → dawn → midday lagoon → golden hour → moonlit). Horizon line drifts subtly with progress. Wave shimmer = layered sins on the ocean half. Stars only at the dark ends of the arc. Film grain + vignette ground it editorially.
- **Visibility gates:** skips `requestAnimationFrame` work when `document.hidden`; freezes `uTime`/`uVelocity` under `prefers-reduced-motion`; gracefully no-ops if `WebGLRenderer` construction throws (body `#060e1a` is the fallback).
- **Why the existing moments suddenly work as transitions:** every `Moment0X.tsx` already tweens `sectionRef` opacity 0→1→0 across its own scrub. The body color was masking the world underneath; with `.moment { background: transparent }` stripped in `globals.css`, those existing fades now reveal the atmosphere between scenes. No new transition code was needed — the choreography was already there, just blocked.
- **Per-moment internal gradients** (e.g. Moment02's `linear-gradient(180deg, #0e2038...)`) are still opaque mid-scene by design. Next phase can dial them translucent so the world bleeds through mid-act too.

### Preloader → FilmHomepage shared-element contract
`Preloader.tsx` and `FilmHomepage.tsx` share one visually-persistent element: the **coord micro** ("From the Maldives") at `top-[26%] md:top-[28%] left-[8%] md:left-[10%]`. Same font, size, letter-spacing, color (`rgba(245,240,232,0.6)`). When Preloader unpins, FilmHomepage's Act I coord is already initialised at opacity 0.6 — the coord appears to persist in-place, masking the component handoff. Do not add a fade-in tween to FilmHomepage's coord; do not move the coord in Preloader. If you change one position/style, change the other.

### AssetSlot — procedural → real-footage swap
`components/AssetSlot.tsx` is the swappable-media primitive. Today the site renders 100% procedural visuals (CSS gradients, `clipPath` silhouettes). Tomorrow when you have real Maldives photography or video, drop a `src` into the existing slot and it fades in over the procedural fallback — no layout, animation, or composition changes.

Pattern:
```tsx
<div ref={islandRef} className="..." style={{ width: '...', height: '...' }}>
  <AssetSlot id="moment-02-island" alt="..." className="w-full h-full">
    {/* procedural fallback — renders verbatim when no src */}
    <div style={{ clipPath: 'polygon(...)' }} />
  </AssetSlot>
</div>
```

To populate a slot:
```tsx
<AssetSlot
  id="moment-02-island"
  alt="..."
  src={{ image: '/assets/moment-02/island.webp' }}
  className="w-full h-full"
>
  {/* fallback still here; only renders if src is removed */}
</AssetSlot>
```

Key behaviour:
- No `src` → wrapper div renders with `data-asset-state="fallback"` and children verbatim
- `src.image` only → `<img loading="lazy" decoding="async">` with 700ms fade-in on load
- `src.video` provided → SSR still renders the poster image; client swaps to autoplaying `<video muted loop playsInline>` *only if* `prefers-reduced-motion` is not set (accessibility + hydration safety)
- Wrapper carries `data-asset-slot={id}` for inspection — `document.querySelectorAll('[data-asset-slot]')` enumerates all slots
- GSAP refs stay on the **outer positioning ancestor**, not on AssetSlot itself, so animations are unaffected by the procedural↔real swap

Asset path convention (documented, not enforced): `public/assets/{moment-id}/{slot-id}.{ext}`. Currently wired into Moment02 (`moment-02-island`) and Moment03 (`moment-03-island`) as proof; the same pattern extends to every visible procedural element.

### GSAP — always import from `@/lib/gsap`
`lib/gsap.ts` is the single place that registers `ScrollTrigger`/`SplitText`/`CustomEase` (browser-guarded) and pre-creates the `"cinematic"` CustomEase (`cubic-bezier(0.16, 1, 0.3, 1)`). Importing GSAP directly from `gsap` will skip plugin registration and break the `"cinematic"` ease used everywhere.

### Smooth scroll
`SmoothScroll.tsx` instantiates Lenis, wires `lenis.on("scroll", ScrollTrigger.update)`, advances Lenis from `gsap.ticker` with `lagSmoothing(0)`, and forces `scroll-behavior: auto`. Lenis settings (duration, lerp, multipliers) branch on `useScroll().isMobile` — keep that branch when tuning scroll feel.

### `ScrollContext` / `useScroll`
`lib/context/ScrollContext.tsx` exposes `{ masterTl, setMasterTl, isMobile }`. `isMobile` = `innerWidth < 768 || touch device`. Animations (timelines, particle counts, durations) branch on this — preserve the desktop/mobile split when editing moments.

### "Moment" scene pattern (`components/moments/Moment*.tsx`)
Every moment is a `"use client"` component with the same shape:
- Local refs for section, background, midground, text, etc.
- A `useEffect` that builds a `gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "+=Xx%" (mobile: shorter), pin: true, scrub, onToggle } })`.
- Uses `SplitText` on the heading + paragraph for staggered char/word reveals (`y: "100%"` + `blur(4px)` → `0%` + `blur(0)`, `ease: "cinematic"`).
- The `onToggle` toggles a `.active` class on `sectionRef.current` — this is **load-bearing**. The `.moment` class in `globals.css` is `opacity: 0; visibility: hidden; pointer-events: none;` until `.active` is added (`.moment.active` flips visibility, pointer-events, and `z-index: 10`). A new moment that omits `onToggle` will render invisible and non-interactive.
- Cleanup must: `tl.kill()`, `splitTitle?.revert()`, `splitBody?.revert()`, and kill any `ScrollTrigger.getAll()` whose `vars.trigger === sectionRef.current`. Skipping this leaks pinned scenes across HMR/route changes.

When adding a new moment, copy the structure of an existing one (e.g. `Moment02.tsx`) and wire it into `ScrollJourney.tsx`'s vertical stack — order in JSX = order in the scroll.

### Custom cursor
`CustomCursor.tsx` sets `body.style.cursor = 'none'` and runs its own RAF lerp loop with a `0.16` multiplier (≈6 frames of lag) writing via `gsap.set({ x, y, force3D: true })`. It is mounted in `RootLayout` so it persists across the whole app — do not duplicate it inside scenes.

### Styling
`app/globals.css` defines the `--font-serif` / `--font-sans` variables, the base body color `#060e1a`, Lenis recommended styles, and the `.moment` / `.moment.active` rules. There is no Tailwind config file — Tailwind v4 picks up the directive from globals.css; add new design tokens as CSS variables there rather than expecting a `tailwind.config.*`.
