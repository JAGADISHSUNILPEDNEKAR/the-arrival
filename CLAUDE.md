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

Asset path convention (documented, not enforced): `public/assets/{moment-id}/{slot-id}.{ext}`. Currently wired into Moment02 (`moment-02-island`) and Moment03 (`moment-03-island`) as proof, plus four slots in MomentGallery (`gallery-morning-swim`, `gallery-walk`, `gallery-bath`, `gallery-bonfire`); the same pattern extends to every visible procedural element.

### Mobile audit notes (Phase 10.2 — code review only)
Audit was code-review based; the experience has not been opened on a real touch device.

**Fixed**
- `.moment { height: 100vh; height: 100dvh; }` in `globals.css` — and matching `h-screen h-dvh` on FilmHomepage, Preloader, MomentGallery. iOS Safari's address bar transitions previously caused pinned sections to jump when 100vh recomputed; `dvh` adjusts smoothly. The `100vh` line stays as a fallback for browsers without dvh support.
- MomentGallery now stacks **image on top, caption below** under the `md` breakpoint. Above `md`, original asymmetric image-side + caption-opposite composition is preserved.
- Moment05's text column now anchors right with `max-w-[60vw]` on mobile so it stays inside the shade region throughout the split-widen animation (was previously spilling into the sun region with `left-[8%] right-[8%]`).

**Not addressed (deliberate)**
- Mobile pin behaviour under iOS Safari's address-bar toggle is a known GSAP limitation. The `dvh` fix mitigates the size change but pinned ScrollTriggers can still drift on toggle. Real-device testing + potentially `ScrollTrigger.config({ ignoreMobileResize: true })` is the next intervention.
- Type sizes use `clamp(min, vw-scaled, max)`. Mobile minimums (~28px for moment headlines) are readable but could be bumped for stronger editorial weight on phones. Per-moment tuning recommended after pixel-level review.

**Per-component mobile contract**
- Custom cursor: gated on `(pointer: fine)` — invisible on touch
- Lenis: branches duration/wheelMultiplier/lerp/touchMultiplier on `isMobile`
- AtmosphereLayer: DPR capped at 1.5; renders fine on mobile, mouse-parallax becomes static (no mouse events)
- Moment2-10 timelines: scrub set to 0.8 on mobile (1.2 desktop), pin end set to `+=150%` (mobile) vs `+=250%` (desktop)

### Performance audit (Phase 10.3)

**Bundle metrics from production build** (gzipped sizes, what browser actually downloads)
- Three.js + GSAP combined: 131.6 KB gz / 552 KB raw
- GSAP plugins (separate chunk): 48.9 KB gz / 124 KB raw
- react-dom: 69.4 KB gz / 222 KB raw
- Next runtime: 49 KB gz / 195 KB raw
- Total above-fold JS: ~340 KB gzipped

Three.js dominates because it tree-shakes poorly. The 131 KB chunk is acceptable for a single-page cinematic experience but is the obvious lever if you want to lazy-load AtmosphereLayer (the only Three.js consumer) — would move ~131 KB out of the critical path. Trade-off: brief moment without atmosphere shader on first paint.

**Hot-path fixes shipped**
- `AtmosphereLayer.tsx` no longer reads `document.documentElement.scrollHeight` every animation frame. Previously caused a synchronous layout each frame on an animated page. Now cached in a closure variable, invalidated only on `resize` and on `ScrollTrigger.addEventListener('refresh', ...)`.
- `.moment` CSS no longer applies `will-change: opacity, transform, visibility` to every section all the time. With 11+ sections, that forced 11+ persistent GPU compositing layers in VRAM. Now scoped to `.moment.active` only — promotion happens just for the currently-animating section.

**Hot-path inspected, not changed**
- CustomCursor's `gsap.set` per rAF frame: kept as-is because direct `style.transform =` would conflict with the CTA-scale tween. Trivial GSAP overhead.
- Three rAF loops (Atmosphere, CustomCursor, Lenis-via-gsap.ticker): independent but cheap. Could be consolidated under `gsap.ticker.add` for AtmosphereLayer if perf needs further squeezing.
- `filter: blur(6px → 0px)` on SplitText word reveals: scrub-driven, GPU-heavy on text. Could be gated `isMobile && skip blur` if mid-range Android stutters. Not changed without device data.
- ScrollTrigger pin behaviour under iOS Safari address-bar toggle: not addressed; needs real-device testing before applying `ScrollTrigger.config({ ignoreMobileResize: true })`.

**Open optimization (deferred)**
- Dynamic-import `AtmosphereLayer` via `next/dynamic` with `ssr: false`. Removes ~131 KB from the critical bundle, defers Three.js until JS hydrates. Preloader's veil at 0.88 opacity already obscures the shader at frame 0 — acceptable visual trade-off. Skipped here because the win is real but the visual nuance is best decided after pixel review.

### AudioToggle — opt-in ambient loop
`components/AudioToggle.tsx` is the audio analogue to AssetSlot. Loads `/audio/ambient.mp3`. If the file is present and `canplaythrough` fires, a small editorial micro-button appears bottom-right with the same scroll fade-in as GlobalNav. If the file is absent, the toggle UI never renders — no 404 in the visible UI; same procedural-fallback contract.

Defaults:
- OFF on first visit (respects browser autoplay restrictions and user expectation)
- Click toggles. Volume fades up over 2s via GSAP, down over 0.8s
- State persists via `localStorage` key `arrival.audio.enabled`
- Returning user who had it ON gets it resumed silently when the browser permits; otherwise falls back to OFF without error UI
- `data-cursor="cta"` so the custom cursor responds on hover, matching Begin/Reserve

The audio file is the user's to supply. `public/audio/README.md` documents recommended properties: MP3, 30s–2min seamlessly loopable, mastered quiet (player caps volume at 0.35), no sharp transients. Drop a real ocean recording at `public/audio/ambient.mp3` and the toggle appears automatically — no code change.

### MomentGallery — horizontal-pan-on-vertical-scroll
`components/moments/MomentGallery.tsx` is a new moment slotted between Moment09 (the plate close-up) and Moment10 (the night silhouette) in ScrollJourney. It's the missing third emotional act — after the intimate dining close, the camera zooms *out* to show the other arrivals on the island.

- **Structure:** one pinned section, internal track of 5 panels (1 title + 4 content), `width: 500vw`. GSAP scrubs `translateX(0 → -400vw)` over a 400% pin duration. Each panel is `w-screen h-full`.
- **Content panels:** `01 The Morning Swim`, `02 The Walk`, `03 The Bath`, `04 The Bonfire`. Image side alternates left/right for asymmetric editorial composition. Each image is an `AssetSlot` with an evocative procedural-gradient fallback (mood-coded — pre-dawn lagoon blue, golden sand with palm shadows, sunset amber, bonfire embers).
- **Caption choreography:** per-panel captions fade in at scroll progress `0.2 × (i + 1) + 0.02` and out at `0.2 × (i + 2) − 0.04`; the last caption stays visible until unpin.
- **Reduced motion:** the pin + horizontal track are skipped entirely. The section renders as the title card only and the user scrolls past at normal pace (alternative would force horizontal scroll on users who opted out of motion).
- **Atmosphere interaction:** at this scroll position (~0.85 of total page), the WebGL shader is in its "intimate-dark → moonlit" transition. The translucent gallery panels let the shader through as a color grade — daytime scenes seen through a moonlit lens.

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
