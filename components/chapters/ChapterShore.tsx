"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useScroll } from "@/lib/context/ScrollContext";
import { useWebGLContent } from "@/components/WebGL/WebGLContentLayer";

/**
 * Chapter II — The Shore. The first earthbound beat: the boat is moored,
 * the shoreline received you. Editorial column anchors top-left so the
 * eye reads from the headline down into the lagoon below it.
 */
export default function ChapterShore({}: { index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const { isMobile } = useScroll();

  useWebGLContent({
    id: "chapter-02-shore",
    src: "/assets/chapter-02-shore/photo.webp",
    poster: "/assets/chapter-02-shore/photo.poster.jpg",
    triggerRef: sectionRef,
  });

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // SplitText('lines') only — no per-word animation. Each visual line is a
    // single element we fade in as one body. For single-line headlines this
    // is one node; for headlines that wrap to two lines on smaller widths,
    // the stagger between lines reads as a gentle editorial pulse.
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
    // Tracking starts wide — settles tight. A "focus pull" on the type.
    if (titleRef.current) {
      gsap.set(titleRef.current, { letterSpacing: "0.04em" });
    }

    if (reducedMotion) {
      sectionEl.classList.add("active");
      gsap.set(sectionEl, { opacity: 1 });
      gsap.set(indexRef.current, { opacity: 0.4 });
      gsap.set(subRef.current, { opacity: 0.85 });
      if (splitTitle?.lines) {
        gsap.set(splitTitle.lines, { opacity: 1 });
      }
      if (titleRef.current) {
        gsap.set(titleRef.current, { letterSpacing: "-0.005em" });
      }
      return () => splitTitle?.revert();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: "top top",
        end: isMobile ? "+=170%" : "+=240%",
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.9 : 1.4,
        onToggle: (self) =>
          sectionEl.classList.toggle("active", self.isActive),
      },
    });

    // Section breathes in — single slow opacity reveal, no kinetic noise.
    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: "cinematic", duration: 0.16 },
      0
    );
    // Roman numeral — restrained marker. Opacity only.
    tl.to(
      indexRef.current,
      { opacity: 0.4, duration: 0.18, ease: "cinematic" },
      0.18
    );
    // Headline reveals line-by-line, paired with a slow tracking settle on
    // the parent — the eye reads a focus-pull on the type rather than a
    // letter-by-letter SplitText reveal. Two moves, one direction.
    if (splitTitle?.lines) {
      tl.to(
        splitTitle.lines,
        {
          opacity: 1,
          stagger: 0.10,
          duration: 0.30,
          ease: "cinematic",
        },
        0.28
      );
    }
    tl.to(
      titleRef.current,
      { letterSpacing: "-0.005em", duration: 0.55, ease: "cinematic" },
      0.28
    );
    // Sub line — opacity only, lands after the headline has settled.
    tl.to(
      subRef.current,
      { opacity: 0.85, duration: 0.22, ease: "cinematic" },
      0.66
    );

    // Long dwell 0.88 → 0.92 — the chapter sits in stillness before exit.

    // Exit: opacity only. No blur, no y. The atmosphere shader carries the
    // continuity to the next chapter; the editorial column simply hands off.
    tl.to(
      textRef.current,
      { opacity: 0, duration: 0.18, ease: "cinematic" },
      0.92
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
      id="chapter-02-shore"
      aria-label="Chapter II — The Shore"
    >
      {/* Whisper-light radial scrim under the top-left editorial column.
          The WebGL grade + deeper vignette + atmospheric haze do most of
          the readability work now; this is photographic falloff at 0.20
          opacity, not a mask. If it ever reads as a darkened patch under
          the type, remove it — Pavilion already runs without one. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 22% 30%, rgba(6,8,16,0.20), transparent 75%)',
        }}
      />

      <div
        ref={textRef}
        className="absolute top-[18%] md:top-[22%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-10 max-w-[34em] pointer-events-none"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-3 md:mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.75rem, 2.8vw, 2.5rem)",
            lineHeight: 1,
            color: "rgba(240,232,210,0.45)",
            textShadow: "0 2px 16px rgba(6,14,26,0.6)",
          }}
        >
          II.
        </span>
        <h2
          ref={titleRef}
          className="italic font-light mb-6 md:mb-8"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.005em",
            color: "rgba(255,250,240,0.97)",
            textShadow: "0 4px 50px rgba(6,14,26,0.65)",
          }}
        >
          A sanctuary, woven into the shoreline.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1rem, 1.4vw, 1.4rem)",
            lineHeight: 1.5,
            color: "rgba(245,240,232,0.85)",
            textShadow: "0 2px 20px rgba(6,14,26,0.55)",
          }}
        >
          Far from the noise. Suspended above the turquoise sea.
        </p>
      </div>
    </section>
  );
}
