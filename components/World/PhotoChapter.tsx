"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * PhotoChapter — a full-bleed hero photograph with editorial caption
 * stack, pinned to the viewport for the duration of its scroll segment.
 *
 * Behaviour:
 *   - The chapter section is `height: 220vh` so it occupies ~2.2 screens
 *     of scroll runway
 *   - Inside, a position:sticky child holds the image + caption full-
 *     viewport while the section scrolls past
 *   - GSAP scrub-tweens drive image opacity (0 → 1 → 1 → 0) and a subtle
 *     scale parallax (1.06 → 1.0 over the entry, 1.0 → 0.96 over exit)
 *   - Caption stack: numeric chapter counter (top-left, small uppercase
 *     sans), title (italic serif, line-level reveal), sub (italic serif
 *     small)
 *   - Cinematic CSS filter on the image: matches the mineral palette of
 *     the 3D world — saturation pulled, slight teal-green shift on
 *     midtones, gentle vignette via inset shadow
 *
 * z-index lives at z-10 so the photo sits OVER the WorldScene canvas
 * (z-0). The WorldScene continues rendering behind every photo chapter;
 * by the time the photo chapters fade out and the night sequence is
 * scroll-active, the world is already at chapter-5 pose and night-mood
 * has crossfaded behind the photos.
 */

export interface PhotoChapterProps {
  /** Path to the hero image under /public. */
  src: string;
  /** Numeric chapter counter, e.g. "02". */
  index: string;
  /** Total chapter count for the counter, e.g. "06". */
  total: string;
  /** Italic-serif chapter title. */
  title: string;
  /** Short italic-serif sub copy beneath the title. */
  sub: string;
  /** Optional caption position — "left" (default) or "right". Alternates
   *  between chapters to break the visual rhythm. */
  align?: "left" | "right";
  /** alt text for the image (a11y). Defaults to title + sub. */
  alt?: string;
}

export default function PhotoChapter({
  src,
  index,
  total,
  title,
  sub,
  align = "left",
  alt,
}: PhotoChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const imgEl = imageRef.current;
    const capEl = captionRef.current;
    const counterEl = counterRef.current;
    if (!sectionEl || !imgEl || !capEl || !counterEl) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: settle visible, skip scrub.
    if (reducedMotion) {
      gsap.set(imgEl, { opacity: 1, scale: 1 });
      gsap.set(capEl, { opacity: 1, y: 0 });
      gsap.set(counterEl, { opacity: 0.55 });
      return;
    }

    // Initial state — invisible.
    gsap.set(imgEl, { opacity: 0, scale: 1.06 });
    gsap.set(capEl, { opacity: 0, y: 28 });
    gsap.set(counterEl, { opacity: 0 });

    // One pinned ScrollTrigger per chapter. The scrub timeline drives:
    //   0.00 → 0.20  image fades in + scales 1.06 → 1.0 (parallax-in)
    //   0.10 → 0.25  counter fades in
    //   0.15 → 0.40  caption fades + lifts up to settle
    //   0.40 → 0.75  HOLD — image at rest, caption at rest
    //   0.75 → 1.00  caption fades out, image scales 1.0 → 0.96
    //                + image opacity holds until 0.92, then fades to 0
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
      },
    });

    tl.to(imgEl, { opacity: 1, scale: 1.0, duration: 0.2, ease: "cinematic" }, 0);
    tl.to(counterEl, { opacity: 0.55, duration: 0.15, ease: "cinematic" }, 0.10);
    tl.to(capEl, { opacity: 1, y: 0, duration: 0.25, ease: "cinematic" }, 0.15);
    // Long HOLD between 0.40 and 0.75 — nothing animates.
    tl.to(capEl, { opacity: 0, y: -20, duration: 0.18, ease: "cinematic" }, 0.75);
    tl.to(counterEl, { opacity: 0, duration: 0.12, ease: "cinematic" }, 0.78);
    tl.to(imgEl, { scale: 0.96, duration: 0.25, ease: "cinematic" }, 0.75);
    tl.to(imgEl, { opacity: 0, duration: 0.10, ease: "cinematic" }, 0.92);

    return () => {
      tl.kill();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === sectionEl)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "220vh", zIndex: 10 }}
      aria-label={`${title} — ${sub}`}
    >
      {/* Sticky pin — holds the photo + caption full-viewport while the
          parent section scrolls past, giving GSAP the runway it needs
          for the scrub timeline. */}
      <div
        className="sticky top-0 w-full h-screen overflow-hidden"
        style={{
          // Black behind the image so any transient gap between fades
          // doesn't flash the 3D world below. The grading filter on the
          // image itself pulls saturation toward the mineral palette.
          backgroundColor: "#060e1a",
        }}
      >
        {/* Plain <img> is the right primitive here: the photos are already
            pre-optimised webp at 2400px wide, the chapter is full-bleed
            with object-cover + scale transforms (which next/image's layout
            wrappers complicate), and the GSAP scrub-tween writes opacity
            and scale directly on the element. Lazy-loaded via the loading
            attribute so only the active chapter's image is in flight. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={src}
          alt={alt ?? `${title} — ${sub}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            // Cinematic grade applied as CSS filter. Keeps the photograph
            // a photograph but pulls it into the same palette as the
            // mineral atmosphere shader. Brightness slightly lifted,
            // saturation pulled, gentle contrast bump.
            filter:
              "saturate(0.78) contrast(1.08) brightness(0.94)",
            willChange: "transform, opacity",
          }}
          loading="lazy"
          decoding="async"
        />

        {/* Vignette + tint overlay — deepens corners + tints the whole
            image toward the mineral palette. The radial gradient mimics
            the cinematic-pass vignette in the 3D world for visual
            continuity between the photo chapters and the 3D bookends. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6,8,16,0) 35%, rgba(6,8,16,0.55) 100%)",
            mixBlendMode: "multiply",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            // Faint teal-green tint over the whole frame — locks the
            // photo's tonal floor to the mineral palette.
            background: "rgba(18, 38, 42, 0.10)",
          }}
        />

        {/* Counter — small uppercase frame mark, top-left corner. */}
        <div
          ref={counterRef}
          className="absolute top-0 left-0 w-full p-6 md:p-10 z-10 pointer-events-none flex justify-between items-start"
          style={{ opacity: 0 }}
        >
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.625rem, 0.75vw, 0.8rem)",
              letterSpacing: "0.45em",
              color: "rgba(245,240,232,0.85)",
            }}
          >
            {index} — {total}
          </span>
        </div>

        {/* Caption — italic serif title + small italic serif sub,
            positioned bottom-left or bottom-right per alignment. */}
        <div
          ref={captionRef}
          className={`absolute bottom-[12%] md:bottom-[14%] z-10 pointer-events-none max-w-[34em] ${
            align === "right"
              ? "right-[8%] md:right-[10%] text-right"
              : "left-[8%] md:left-[10%]"
          }`}
        >
          <h2
            className="italic font-light"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4.5vw, 4.25rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.005em",
              color: "rgba(255,250,240,0.97)",
              textShadow: "0 4px 50px rgba(6,8,16,0.7)",
              marginBottom: "1rem",
            }}
          >
            {title}
          </h2>
          <p
            className="italic font-light max-w-[26em]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1rem, 1.4vw, 1.4rem)",
              lineHeight: 1.55,
              color: "rgba(245,240,232,0.85)",
              textShadow: "0 2px 24px rgba(6,8,16,0.65)",
              marginLeft: align === "right" ? "auto" : 0,
            }}
          >
            {sub}
          </p>
        </div>
      </div>
    </section>
  );
}
