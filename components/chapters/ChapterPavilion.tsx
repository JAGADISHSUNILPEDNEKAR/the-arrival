"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useScroll } from "@/lib/context/ScrollContext";
import { useWebGLContent } from "@/components/WebGL/WebGLContentLayer";

/**
 * Chapter IV — The Pavilion. The destination. Editorial column anchors
 * top-right against the aerial bungalows below it.
 */
export default function ChapterPavilion({}: { index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const { isMobile } = useScroll();

  useWebGLContent({
    id: "chapter-04-pavilion",
    src: "/assets/chapter-04-pavilion/photo.webp",
    poster: "/assets/chapter-04-pavilion/photo.poster.jpg",
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
        y: "110%",
        filter: "blur(6px)",
        opacity: 0,
      });
    }

    if (reducedMotion) {
      sectionEl.classList.add("active");
      gsap.set(sectionEl, { opacity: 1 });
      gsap.set(indexRef.current, { opacity: 0.4, y: 0 });
      gsap.set(subRef.current, { opacity: 0.85, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: "0%", filter: "none", opacity: 1 });
      }
      return () => splitTitle?.revert();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: "top top",
        end: isMobile ? "+=150%" : "+=240%",
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.8 : 1.2,
        onToggle: (self) =>
          sectionEl.classList.toggle("active", self.isActive),
      },
    });

    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: "cinematic", duration: 0.08 },
      0
    );
    tl.to(
      indexRef.current,
      { opacity: 0.4, y: 0, duration: 0.08, ease: "cinematic" },
      0.12
    );
    if (splitTitle?.words) {
      tl.to(
        splitTitle.words,
        {
          y: "0%",
          filter: "blur(0px)",
          opacity: 1,
          stagger: 0.04,
          duration: 0.16,
          ease: "cinematic",
        },
        0.15
      );
    }
    tl.to(
      subRef.current,
      { opacity: 0.85, y: 0, duration: 0.10, ease: "cinematic" },
      0.45
    );
    tl.to(
      textRef.current,
      {
        opacity: 0,
        y: -50,
        filter: "blur(2px)",
        force3D: true,
        duration: 0.12,
        ease: "cinematic",
      },
      0.88
    );
    tl.to(
      sectionEl,
      { opacity: 0, duration: 0.08, ease: "cinematic" },
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
      id="chapter-04-pavilion"
      aria-label="Chapter IV — The Pavilion"
    >
      {/* Soft dark radial scrim anchored behind the top-right editorial
          column. Same rationale as ChapterShore — the WebGL vignette
          darkens corners but doesn't reach this position over the bright
          aerial lagoon. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 78% 30%, rgba(6,8,16,0.55), transparent 70%)',
        }}
      />

      <div
        ref={textRef}
        className="absolute top-[18%] md:top-[22%] right-[8%] md:right-[10%] left-[8%] md:left-auto z-10 max-w-[34em] md:text-right pointer-events-none"
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
          IV.
        </span>
        <h2
          ref={titleRef}
          className="italic font-light mb-6 md:mb-8"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 4vw, 3.75rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "rgba(255,250,240,0.97)",
            textShadow: "0 4px 50px rgba(6,14,26,0.65)",
          }}
        >
          Out of the sun. Into the shade.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em] md:ml-auto"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1rem, 1.4vw, 1.4rem)",
            lineHeight: 1.5,
            color: "rgba(245,240,232,0.85)",
            textShadow: "0 2px 20px rgba(6,14,26,0.55)",
          }}
        >
          The pavilion at dusk — lanterns lit, tides easing in.
        </p>
      </div>
    </section>
  );
}
