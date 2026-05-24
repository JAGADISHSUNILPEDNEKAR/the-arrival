"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useScroll } from "@/lib/context/ScrollContext";
import { useWebGLContent } from "@/components/WebGL/WebGLContentLayer";

/**
 * Chapter V — The Table. The testimonial beat. Editorial column centers,
 * isolated, in the deepest moment of the journey. Pin runs longer for a
 * 0.12 silence at entry + 0.30 dwell after the line lands.
 */
export default function ChapterTable({}: { index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);
  const { isMobile } = useScroll();

  useWebGLContent({
    id: "chapter-05-table",
    src: "/assets/chapter-05-table/photo.webp",
    poster: "/assets/chapter-05-table/photo.poster.jpg",
    triggerRef: sectionRef,
  });

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Line-only split. The testimonial line wraps to two lines at most
    // widths; the line stagger reads as a quiet pulse — line 1, breath,
    // line 2 — rather than a per-word reveal that would compete with the
    // intimacy of the moment.
    const splitTitle = titleRef.current
      ? new SplitText(titleRef.current, {
          type: "lines",
          linesClass: "chapter-line",
        })
      : null;

    gsap.set([indexRef.current, subRef.current], { opacity: 0 });
    if (splitTitle?.lines) {
      gsap.set(splitTitle.lines, { opacity: 0 });
    }
    if (titleRef.current) {
      // Wider tracking start than the standard chapters (0.06em vs 0.04em)
      // — the testimonial line gets a slightly more pronounced focus-pull
      // because it's the narrative's emotional center.
      gsap.set(titleRef.current, { letterSpacing: "0.06em" });
    }
    gsap.set(blackoutRef.current, { opacity: 0 });

    if (reducedMotion) {
      sectionEl.classList.add("active");
      gsap.set(sectionEl, { opacity: 1 });
      gsap.set(blackoutRef.current, { opacity: 0.72 });
      gsap.set(indexRef.current, { opacity: 0.45 });
      gsap.set(subRef.current, { opacity: 0.7 });
      if (splitTitle?.lines) {
        gsap.set(splitTitle.lines, { opacity: 1 });
      }
      if (titleRef.current) {
        gsap.set(titleRef.current, { letterSpacing: "-0.01em" });
      }
      return () => splitTitle?.revert();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: "top top",
        end: isMobile ? "+=200%" : "+=320%",
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.9 : 1.4,
        onToggle: (self) =>
          sectionEl.classList.toggle("active", self.isActive),
      },
    });

    // Section opacity reveal — slower than the standard chapters so the
    // entry into the testimonial feels like a stillness, not an arrival.
    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: "cinematic", duration: 0.10 },
      0
    );

    // Blackout overlay rises slowly. Peak 0.72 — the room is muted, the
    // line will be the only thing in it. Slightly slower onset (0.12 → 0.16
    // duration) to extend the silence.
    tl.to(
      blackoutRef.current,
      { opacity: 0.72, ease: "cinematic", duration: 0.16 },
      0.10
    );

    // Long silence beat — 0.26 → 0.42 (0.16 of pure dark) — before the
    // line lands. The brief asked for "intentional silence between moments";
    // this is the literal silence beat.
    tl.to(
      indexRef.current,
      { opacity: 0.45, duration: 0.18, ease: "cinematic" },
      0.42
    );

    // Headline reveals line-by-line with a slow tracking settle.
    if (splitTitle?.lines) {
      tl.to(
        splitTitle.lines,
        {
          opacity: 1,
          stagger: 0.18,
          duration: 0.36,
          ease: "cinematic",
        },
        0.46
      );
    }
    tl.to(
      titleRef.current,
      { letterSpacing: "-0.01em", duration: 0.80, ease: "cinematic" },
      0.46
    );

    // Source attribution lands after the line has fully settled.
    tl.to(
      subRef.current,
      { opacity: 0.7, duration: 0.20, ease: "cinematic" },
      0.74
    );

    // Long dwell 0.78 → 0.94 — the testimonial sits in its own silence
    // longer than any other chapter. This is the climax of the scroll.

    // Exit: opacity only, slow. The blackout itself stays — the next
    // chapter has its own atmosphere; we just fade the words.
    tl.to(
      textRef.current,
      { opacity: 0, duration: 0.20, ease: "cinematic" },
      0.94
    );

    return () => {
      tl.kill();
      splitTitle?.revert();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === sectionEl)
        .forEach((st) => st.kill());
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full h-screen h-dvh overflow-hidden"
      id="chapter-05-table"
      aria-label="Chapter V — The Table"
    >
      {/* Blackout overlay — mutes the photo so the testimonial line
          becomes the only thing in the room. */}
      <div
        ref={blackoutRef}
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "rgba(6,8,16,1)" }}
      />

      <div
        ref={textRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-[8%] pointer-events-none"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-4 md:mb-6"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 2.4vw, 2.25rem)",
            lineHeight: 1,
            color: "rgba(240,232,210,0.45)",
          }}
        >
          V.
        </span>
        <h2
          ref={titleRef}
          className="italic font-light max-w-[18em]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.25rem, 5.5vw, 5.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "rgba(255,250,240,0.98)",
            textShadow: "0 4px 60px rgba(6,8,16,0.7)",
          }}
        >
          Some tables are remembered longer than others.
        </h2>
        <span
          ref={subRef}
          className="block uppercase mt-8 md:mt-10"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.625rem, 0.75vw, 0.8rem)",
            letterSpacing: "0.45em",
            color: "rgba(245,240,232,0.55)",
          }}
        >
          — a guest, on returning
        </span>
      </div>
    </section>
  );
}
