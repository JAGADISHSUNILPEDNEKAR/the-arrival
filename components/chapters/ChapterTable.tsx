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

    const splitTitle = titleRef.current
      ? new SplitText(titleRef.current, {
          type: "lines,words",
          linesClass: "overflow-hidden inline-flex",
          wordsClass: "word",
        })
      : null;

    gsap.set([indexRef.current, subRef.current], { opacity: 0, y: 24 });
    if (splitTitle?.words) {
      gsap.set(splitTitle.words, {
        y: "120%",
        filter: "blur(8px)",
        opacity: 0,
      });
    }
    gsap.set(blackoutRef.current, { opacity: 0 });

    if (reducedMotion) {
      sectionEl.classList.add("active");
      gsap.set(sectionEl, { opacity: 1 });
      gsap.set(blackoutRef.current, { opacity: 0.72 });
      gsap.set(indexRef.current, { opacity: 0.45, y: 0 });
      gsap.set(subRef.current, { opacity: 0.7, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: "0%", filter: "none", opacity: 1 });
      }
      return () => splitTitle?.revert();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: "top top",
        end: isMobile ? "+=180%" : "+=300%",
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.8 : 1.2,
        onToggle: (self) =>
          sectionEl.classList.toggle("active", self.isActive),
      },
    });

    // Section opacity reveal
    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: "cinematic", duration: 0.06 },
      0
    );

    // Blackout overlay rises slowly — the photo is intentionally muted
    // so the line lands without the room competing. Peak 0.72 (deeper
    // than the corner-vignette already in the WebGL layer) because the
    // testimonial is centered and the vignette doesn't reach the middle.
    tl.to(
      blackoutRef.current,
      { opacity: 0.72, ease: "cinematic", duration: 0.12 },
      0.08
    );

    // 0.18 → 0.30 — silence beat before the words arrive.
    tl.to(
      indexRef.current,
      { opacity: 0.45, y: 0, duration: 0.06, ease: "cinematic" },
      0.32
    );
    if (splitTitle?.words) {
      tl.to(
        splitTitle.words,
        {
          y: "0%",
          filter: "blur(0px)",
          opacity: 1,
          stagger: 0.05,
          duration: 0.22,
          ease: "cinematic",
        },
        0.36
      );
    }
    tl.to(
      subRef.current,
      { opacity: 0.7, y: 0, duration: 0.10, ease: "cinematic" },
      0.65
    );

    // Dwell 0.65 → 0.92 — the line lingers.

    tl.to(
      textRef.current,
      {
        opacity: 0,
        y: -50,
        filter: "blur(3px)",
        force3D: true,
        duration: 0.10,
        ease: "cinematic",
      },
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
