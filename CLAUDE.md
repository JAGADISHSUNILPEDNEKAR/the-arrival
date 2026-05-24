# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

"The Arrival" — a Next.js 16 single-page cinematic scroll experience for a luxury private island restaurant. The entire page is one vertically-pinned scroll journey composed of 7 chapters (FilmHomepage entry + Chapters II–VII) plus a preloader and global nav. The visual direction is cinematic restraint: a mineral-toned palette (no tropical-fresh signal), line-level typography reveals (no per-word SplitText choreography), inertial Lenis scroll, one dominant motion idea per chapter.

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
1. `app/layout.tsx` loads Cormorant Garamond (exposed as `--font-serif`), mounts the global `<CustomCursor>` **outside** the providers, then wraps children in `<Providers><SmoothScroll>`. Restaurant JSON-LD (with geo coords matching the Preloader count-up) is injected via a `<script type="application/ld+json">` at the top of `<body>`.
2. `app/page.tsx` renders `<ScrollJourney/>` — the whole site.
3. `components/ScrollJourney.tsx` renders the persistent layers — `<AtmosphereLayer>` (bedrock world, dynamically imported via `next/dynamic({ ssr: false })` to keep three.js off the critical path) + `<Preloader>` (autoplay entry overlay) + `<GlobalNav>` + `<AudioToggle>` + `<WebGLContentLayer>` (cinematic-graded photography surface) — alongside a vertical stack of scenes: `FilmHomepage` followed by `ChapterShore`, `ChapterPath`, `ChapterPavilion`, `ChapterTable`, `ChapterEvening`, `ChapterInvitation`. Each chapter self-pins; the page has no shared master timeline (the `ScrollContext.masterTl` slot exists but is currently unused — `setMasterTl` is read but never called).

### Persistent atmosphere (`components/Atmosphere/AtmosphereLayer.tsx`)
A single Three.js fragment shader on a full-screen plane lives at `fixed inset-0 z-0` behind every chapter. It is the world; the chapters are editorial overlays on top.

- **Stack:** raw `three` (no `@react-three/fiber`). One `OrthographicCamera`, one `PlaneGeometry(2,2)`, one `ShaderMaterial`. DPR capped at 1.5, `mediump` precision, depth disabled. Loaded via `next/dynamic({ ssr: false })` from `ScrollJourney`, so the three.js bundle stays out of the critical path; the Preloader veil masks the brief frame-zero gap before the shader paints.
- **Uniforms driven on every rAF:** `uTime` (continuous), `uProgress` (raw `scrollY/maxScroll` passed through `shapeProgress()` — see Chapter-anchor settle below — then lerped 0.04), `uVelocity` (scroll-delta, lerped 0.08, decays in ~400ms), `uMouse` (lerped 0.05), `uResolution`.
- **Mineral palette:** 6-stop day-arc tuned to a cinematic film stock — night arrival → grey-slate dawn → mineral lagoon (wet-stone green, not tropical turquoise) → restrained gold → intimate close → cool moonlit. Three palette tables (`paletteSky`, `paletteOcean`, `paletteGlow`) interpolate through the same 6 stops. Every stop is desaturated; cyan is pulled out of dawn/lagoon so nothing reads "fresh." The haze (not color) does the emotional work.
- **Material depth (atop the base sky/ocean composite):**
  - **Volumetric haze body:** two-octave value-noise field, drifting on scroll velocity, biased to the top of the frame, mixed toward a cool grey-ivory tint. Mix amount peaks at ~8.5% so the underlying scene is never veiled.
  - **Horizon glow band:** wider falloff than a hard band (`exp(-((y-h)*9.5)^2)`) so it reads as soft volumetric bloom.
  - **Sub-pixel chromatic aberration at frame edges:** R/B fringe scaled by `pow(length(uv-.5)*1.4, 2.5)`. Reads as captured-frame, never as legible RGB split.
  - **Glow-tinted vignette:** corner falloff is mixed with the current palette's sky tone (rather than flat black darken) so edges feel like environmental light, not mask.
  - **Film grain:** dense enough for tactile celluloid weight (~3.2% amplitude).
- **Chapter-anchor settle (top of `AtmosphereLayer.tsx`):** raw scroll progress is piecewise-shaped through `shapeProgress()` *before* it enters the lerp into `uProgress`. With `SHAPE_SEGMENTS=5`, the input is held at one of the 6 palette stops (0.0, 0.2, 0.4, 0.6, 0.8, 1.0) for ~55% of each segment, then smoothstep-rises across 40%. The user feels 5 atmospheric "rooms" — arrival → lagoon → golden → intimate → moonlit — with quick transitions between, rather than a continuously sliding palette. Tune via the three constants at the top of the file (`SHAPE_SEGMENTS`, `SHAPE_HOLD_END`, `SHAPE_RISE_END`).
- **Visibility gates:** skips `requestAnimationFrame` work when `document.hidden`; freezes `uTime`/`uVelocity` under `prefers-reduced-motion`; gracefully no-ops if `WebGLRenderer` construction throws (body `#060e1a` is the fallback). The progress shaping still applies under reduced motion (it's deterministic, not animated).
- **Per-chapter compositing:** chapters are transparent to the shader by default; cross-fades through the atmosphere are the transition language. **ChapterTable is the deliberate exception** — it has a `blackoutRef` overlay that scrubs to `opacity: 0.72` to mute the world during the testimonial isolation. The other 5 chapters use only a faint radial scrim (or none at all — Pavilion has no scrim).

### Photography surface (`components/WebGL/WebGLContentLayer.tsx`)
A second Three.js fragment shader on a full-screen plane at `z-1`, between the atmosphere shader and the active chapter sections. Each chapter registers a hero photograph via the `useWebGLContent` hook; an IntersectionObserver tracks each section's visibility ratio, the render loop picks the most-visible section as "primary" and the next-most-visible adjacent as "secondary," then blends them with a noise-edged dissolve (the organimo-style signature) so chapter-to-chapter handoffs feel like one scene blooming through the next.

- **In-shader cinematic grade:** 18% desaturation toward luminance, gentle shadow lift biased cool, midtone push toward mineral (cyan pulled out), warm highlight bloom. Total grade reads as printed film stock — photographs still feel like photographs, just graded into the same palette as the atmosphere.
- **Underwater-resistance displacement:** scroll-velocity-driven UV warp at amplitude 0.85, plus a slow constant idle drift so the frame breathes when still.
- **Deeper editorial vignette:** corner falloff to 0.46 (was 0.62 in earlier iterations) — type set against bright tropical photography reads with more weight.
- **Reduced motion / no-WebGL:** the entire pipeline is skipped. (There is no DOM `<img>` fallback for the hero photography in the current build; the atmosphere shader carries the scene visually.)

### Preloader entry ritual + FilmHomepage handoff contract

`Preloader.tsx` is a `fixed inset-0 z-[10000] pointer-events-none` autoplay overlay that plays a ~4.8s entry ceremony on first visit and then unmounts via `setMounted(false)`. It is **not** scroll-pinned and consumes no document height — so `FilmHomepage`'s hero starts at scroll 0 directly underneath it.

Full ritual phases (first visit only):
1. 0.0 – 0.4s — GPS coord value fades in (`00°00'N · 00°00'E`)
2. 0.4 – 1.6s — latitude climbs to `03°15'N` via `power3.out` (Maldives center, deliberately rounded — feels deliberate, not precise)
3. 1.6 – 2.6s — longitude climbs to `73°00'E`
4. 2.6 – 3.0s — silence at target (the navigation has locked on)
5. 3.0 – 4.2s — veil lifts; the Preloader's "FROM THE MALDIVES" coord label fades **synchronously** with the veil (so FilmHomepage's identical-position coord, initialised at opacity 0.6 from frame zero, takes over invisibly); scroll hint fades in at the bottom
6. 4.2 – 4.8s — lat/lon fades out; `onComplete` writes `sessionStorage.setItem('arrival.entry.seen', '1')` and unmounts the component

**Returning visits and `prefers-reduced-motion`**: skip the ritual entirely; ~1s fade-out only.

**Shared-element handoff (unchanged from the original architecture):** `Preloader.tsx` and `FilmHomepage.tsx` share one visually-persistent element — the **coord micro** ("From the Maldives") at `top-[26%] md:top-[28%] left-[8%] md:left-[10%]`. Same font, size, letter-spacing, color (`rgba(245,240,232,0.6)`). FilmHomepage's Act I coord is initialised at opacity 0.6 from frame zero, so when Preloader's label fades during Phase 5 above, the identical coord is already in place underneath. **Do not add a fade-in tween to FilmHomepage's coord; do not move the coord in Preloader. If you change one position/style, change the other.** The numerical lat/lon below the label is Preloader-only — a transient locating marker, no FilmHomepage equivalent.

**FilmHomepage hero — scale-tension typography (deliberate brand choice):** the `<h1>The Arrival</h1>` is set at `clamp(4rem, 19vw, 19rem)` (wraps to two lines on most desktop widths — intentional editorial confidence). The strapline ("A private island restaurant") drops to a small-uppercase-sans voice at `clamp(0.7rem, 0.95vw, 1rem)` with `letter-spacing: 0.35em`. The contrast between voices — enormous serif italic vs. tiny sans uppercase — is the luxury-hierarchy move (Tom Ford, The Row, Aesop). Harmonizing them back to a similar voice and scale would collapse the brand voice. The hero's reveal pattern matches the chapter language: line-level opacity stagger + parent letter-spacing settle (`0.04em → -0.015em`), no per-word SplitText choreography. The single exception is the one-shot kinetic-breath that fires on "Arrival" — the brand signature at the door.

### Asset path convention
Chapter photographs live at `public/assets/{chapter-id}/photo.webp` with `photo.poster.jpg` (LCP-stage poster) and `photo-mobile.webp` (mobile variant) siblings. They're loaded as `Image()` objects programmatically by `WebGLContentLayer` and uploaded to Three.js textures — never rendered as DOM `<img>`. To swap a chapter's photograph, drop a new file at the canonical path; no code change required.

### Mobile audit notes
Audit is still code-review based; the experience has not been opened on a real touch device under the current restraint pass.

**In place**
- `.moment { height: 100vh; height: 100dvh; }` in `globals.css` — and matching `h-screen h-dvh` on FilmHomepage and Preloader. iOS Safari's address-bar transitions previously caused pinned sections to jump when 100vh recomputed; `dvh` adjusts smoothly. The `100vh` line stays as a fallback for browsers without dvh support.
- Headline minimums bumped on mobile: chapter clamps now `2.25rem` floor (was `2rem`), ChapterInvitation `2rem` floor (was `1.75rem`) — stronger editorial weight on phones.

**Not addressed (deliberate)**
- Mobile pin behaviour under iOS Safari's address-bar toggle is a known GSAP limitation. The `dvh` fix mitigates the size change but pinned ScrollTriggers can still drift on toggle. Real-device testing + potentially `ScrollTrigger.config({ ignoreMobileResize: true })` is the next intervention.
- Mobile real-device validation of the new haze + chromatic aberration cost on low-end GPUs. Both effects are bounded (~4 hash calls per pixel for haze, single `pow()` for aberration) but unverified.

**Per-component mobile contract**
- Custom cursor: gated on `(pointer: fine)` — invisible on touch
- Lenis: branches duration/wheelMultiplier/lerp/touchMultiplier on `isMobile`
- AtmosphereLayer: DPR capped at 1.5; renders fine on mobile, mouse-parallax becomes static (no mouse events). Lazy-loaded via `next/dynamic` so initial JS doesn't carry three.js
- Chapter timelines: scrub `0.9` mobile / `1.4` desktop; pin durations branch isMobile too (~`+=170%` mobile / `+=240%` desktop for most chapters)
- FilmHomepage: `+=320%` pin / `1.0` scrub on mobile; `+=470%` / `1.6` on desktop
- **ChapterTable is the exception** — pinned `+=200%` mobile / `+=320%` desktop to enforce the testimonial silence beat and post-reveal dwell

### Performance audit

**Bundle shape (post-restraint pass)**
- Three.js + AtmosphereLayer: dynamically imported via `next/dynamic({ ssr: false })` in `ScrollJourney` — no longer in the critical bundle. `WebGLContentLayer` still imports three.js statically; both share the same chunk in practice.
- GSAP + plugins: critical (used by every chapter timeline)
- Total above-fold JS post-lazy-load: meaningfully smaller than the previous ~340 KB gz baseline; re-measure with `npm run build` if you need exact numbers

**Hot-path fixes in place**
- `AtmosphereLayer.tsx` no longer reads `document.documentElement.scrollHeight` every animation frame. Cached in a closure variable, invalidated only on `resize` and on `ScrollTrigger.addEventListener('refresh', ...)`.
- `.moment` CSS applies `will-change: opacity, transform` only to `.moment.active`, so just the currently-animating section claims a GPU compositing layer.
- Restraint pass removed all per-word blur reveals across chapters. Previous `filter: blur(6px → 0px)` on every SplitText word was scrub-driven and GPU-heavy on text; line-level opacity reveals + parent letter-spacing settle do the editorial work without the blur cost.

**Hot-path inspected, not changed**
- CustomCursor's `gsap.set` per rAF frame: kept as-is because direct `style.transform =` would conflict with the CTA-scale tween. Trivial GSAP overhead.
- Three rAF loops (AtmosphereLayer, WebGLContentLayer, CustomCursor) plus Lenis-via-`gsap.ticker`: independent but cheap. Atmosphere and content layer both already run under `gsap.ticker` for frame coherence.
- ScrollTrigger pin behaviour under iOS Safari address-bar toggle: not addressed; needs real-device testing before applying `ScrollTrigger.config({ ignoreMobileResize: true })`.

### AudioToggle — opt-in ambient loop
`components/AudioToggle.tsx` is the audio analogue to AssetSlot. Loads `/audio/ambient.mp3`. If the file is present and `canplaythrough` fires, a small editorial micro-button appears bottom-right with the same scroll fade-in as GlobalNav. If the file is absent, the toggle UI never renders — no 404 in the visible UI; same procedural-fallback contract.

Defaults:
- OFF on first visit (respects browser autoplay restrictions and user expectation)
- Click toggles. Volume fades up over 2s via GSAP, down over 0.8s
- State persists via `localStorage` key `arrival.audio.enabled`
- Returning user who had it ON gets it resumed silently when the browser permits; otherwise falls back to OFF without error UI
- `data-cursor="cta"` so the custom cursor responds on hover, matching Begin/Reserve

The audio file is the user's to supply. `public/audio/README.md` documents recommended properties: MP3, 30s–2min seamlessly loopable, mastered quiet (player caps volume at 0.35), no sharp transients. Drop a real ocean recording at `public/audio/ambient.mp3` and the toggle appears automatically — no code change.

### ChapterInvitation — invitation ritual (form → ceremony)

The reservation form in `components/chapters/ChapterInvitation.tsx` is structurally two states:

1. **Form state**: name + email + Send. The reassurance line ("Your message reaches our director directly…") is **gated behind name-field engagement** — not auto-revealed by scroll. The reveal lives in a separate `useEffect` that watches `[nameBlurred, name, sent]` and fires a standalone `gsap.to` when the user has filled in their name and blurred the field. The system reads as if it's acknowledging the user, not advertising itself.

2. **Ceremony state**: on submit, the entire editorial column (headline + sub + form + reassurance) fades out via blur + drift. A `ceremonyBlackoutRef` overlay rises to `opacity: 0.94` (deeper than ChapterTable's 0.72 — finality), and a centered thank-you reveals in two staggered beats:
   - **Beat A** (delay 0.85s): serif-italic personal acknowledgment ("Thank you, [name].") at hero scale `clamp(2rem, 5vw, 4.5rem)`, emerging from `blur(8px)`. (The ceremony submission flow retains its blur — the restraint pass removed scroll-driven blurs from chapter reveals, but this is a discrete one-shot, not a continuous effect.)
   - **Beat B** (delay 1.5s): small-uppercase-sans confirmation ("We will write within the hour.") in the strapline voice — institutional response against personal address.

The persistent bottom signature ("The Arrival · A Maldives Experience") sits at `z-40` and stays on top of the ceremony blackout. The page's closing line survives the ceremony as the page-level denouement.

Reduced motion: submit hard-sets the ceremony visible without animation.

### GSAP — always import from `@/lib/gsap`
`lib/gsap.ts` is the single place that registers `ScrollTrigger`/`SplitText`/`CustomEase` (browser-guarded) and pre-creates the `"cinematic"` CustomEase (`cubic-bezier(0.16, 1, 0.3, 1)`). Importing GSAP directly from `gsap` will skip plugin registration and break the `"cinematic"` ease used everywhere.

### Smooth scroll
`SmoothScroll.tsx` instantiates Lenis, wires `lenis.on("scroll", ScrollTrigger.update)`, advances Lenis from `gsap.ticker` with `lagSmoothing(0)`, and forces `scroll-behavior: auto`. Lenis settings (duration, lerp, multipliers) branch on `useScroll().isMobile` — keep that branch when tuning scroll feel.

### `ScrollContext` / `useScroll`
`lib/context/ScrollContext.tsx` exposes `{ masterTl, setMasterTl, isMobile, setLenis, scrollToElement, stopScroll, startScroll }`. `isMobile` = `innerWidth < 768 || touch device`. Chapter timelines branch scrub/pin duration on `isMobile` — preserve the desktop/mobile split when editing chapters.

### Kinetic-typography helper (`lib/kineticWord.ts`)

The library still recognises six emotional anchor words (`arrival`, `lagoon`, `equator`, `invisible`, `coordinates`, `lantern`) — but per the restraint direction, **only `arrival` is wired as a consumer**. The breath fires exactly once on the FilmHomepage entry as the brand signature. Nothing else on the site uses kinetic typography.

The font (Cormorant Garamond from `next/font/google` at `weight: ["300","400"]`, `style: ["normal","italic"]`) has **no variable axes** — so the effect is synthesized from the levers the font does give us: per-char letter-spacing breath (`0.05em → 0em`), alternating baseline-shift (±3px → 0), opacity micro-flutter (0.82 → 1.0), and a brief italic→roman→italic stutter on every third char. Total per-word duration ~0.7s with `expo.out` settle.

Current consumer:
- `FilmHomepage` — `arrival` only (titleSplit). The other anchor words still exist in `KINETIC_TARGETS` for symmetry, but `kineticSentence` and `kineticFragment` consumers were removed in the restraint pass so the brand signature survives at the door without typographic noise inside.

If you ever want to wire a new consumer, the pattern is:
```tsx
import { buildKineticWordsFor, KineticWord } from '@/lib/kineticWord';

// Past the reduced-motion gate (don't build under reduced motion):
const kinetic: KineticWord[] = buildKineticWordsFor(
  splitTitle?.words as Element[] | undefined
);
// In the timeline, after the parent reveal settles:
tl.call(() => kinetic.forEach((kw) => kw.play()), [], 0.34);
// In cleanup, BEFORE the parent split revert:
kinetic.forEach((kw) => kw.revert());
splitTitle?.revert();
```

The `play()` guard is one-shot — repeat calls (from scrub timelines crossing the cue multiple times) collapse to no-ops. The breath should **not** re-fire on scroll-reverse; it's an arrival cue, not a continuous animation.

### Chapter scene pattern (`components/chapters/Chapter*.tsx`)
Every chapter is a `"use client"` component with the same shape:
- Local refs for section, text wrapper, index (Roman numeral), title, sub.
- A `useEffect` that builds a `gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "+=Xx%" (mobile shorter), pin: true, scrub, onToggle } })`.
- Uses `SplitText` with `type: "lines"` only (not `lines,words`). The reveal animates each line's opacity in a slow stagger, paired with a parallel `letterSpacing` tween on the parent (`0.04em → -0.005em` — a focus-pull on the type itself). **No per-word reveal, no blur, no y-translate on enter, no exit blur.** Exit is opacity-only.
- The `onToggle` toggles a `.active` class on `sectionRef.current` — this is **load-bearing**. The `.moment` class in `globals.css` is `opacity: 0; visibility: hidden; pointer-events: none;` until `.active` is added (`.moment.active` flips visibility, pointer-events, and `z-index: 10`). A new chapter that omits `onToggle` will render invisible and non-interactive.
- Cleanup must: `tl.kill()`, `splitTitle?.revert()`, and kill any `ScrollTrigger.getAll()` whose `vars.trigger === sectionRef.current`. Skipping this leaks pinned scenes across HMR/route changes.
- Standard pacing: `end: "+=170%" mobile / "+=240%" desktop`, `scrub: 0.9 mobile / 1.4 desktop`. Pin durations are deliberately consistent across chapters so the user feels a uniform pulse; only ChapterTable diverges (see below).

When adding a new chapter, copy the structure of `ChapterShore.tsx` and wire it into `ScrollJourney.tsx`'s vertical stack — order in JSX = order in the scroll. Register a hero photograph via `useWebGLContent({ id, src, poster, triggerRef })` so the photography layer picks the chapter up.

**ChapterTable is a deliberate exception** to the standard composition. The testimonial has no editorial column position — the headline centers in the frame against a `blackoutRef` overlay that scrubs to `opacity: 0.72`, muting both the atmosphere and the WebGL photography. Its pin runs `+=320%` desktop / `+=200%` mobile (vs the standard `+=240%`/`+=170%`) to enforce a long silence beat before the words arrive (~0.16 progress units of pure dark) and a generous dwell after the source attribution lands. The chapter is the climax of the scroll; everything else is supporting column.

### Custom cursor
`CustomCursor.tsx` sets `body.style.cursor = 'none'` and runs its own RAF lerp loop with a `0.16` multiplier (≈6 frames of lag) writing via `gsap.set({ x, y, force3D: true })`. It is mounted in `RootLayout` so it persists across the whole app — do not duplicate it inside scenes. State transitions all use the `cinematic` ease (unified motion language with the chapters). CTA hover scale is `1.8` (restraint pass pulled it down from `2.4` — the ring still registers the hover signal without shouting). Disabled entirely on coarse pointers via `(pointer: fine)` gate.

### Styling
`app/globals.css` defines the `--font-serif` / `--font-sans` variables, the base body color `#060e1a`, Lenis recommended styles, and the `.moment` / `.moment.active` rules. There is no Tailwind config file — Tailwind v4 picks up the directive from globals.css; add new design tokens as CSS variables there rather than expecting a `tailwind.config.*`.
