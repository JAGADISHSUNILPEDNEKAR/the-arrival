"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useScroll } from "@/lib/context/ScrollContext";
import { useWebGLContent } from "@/components/WebGL/WebGLContentLayer";

/**
 * Chapter III — The Path. The boardwalk from villa to pavilion. Editorial
 * column anchors bottom-right; the eye sweeps from the lagoon up into the
 * copy, mirroring the actual walk the guest is about to take.
 */
export default function ChapterPath({}: { index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const { isMobile } = useScroll();

  useWebGLContent({
    id: "chapter-03-path",
    src: "/assets/chapter-03-path/photo.webp",
    poster: "/assets/chapter-03-path/photo.poster.jpg",
    triggerRef: sectionRef,
  });

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Line-only split — no per-word animation. Editorial restraint.
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

    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: "cinematic", duration: 0.16 },
      0
    );
    tl.to(
      indexRef.current,
      { opacity: 0.4, duration: 0.18, ease: "cinematic" },
      0.18
    );
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
    tl.to(
      subRef.current,
      { opacity: 0.85, duration: 0.22, ease: "cinematic" },
      0.66
    );
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
      id="chapter-03-path"
      aria-label="Chapter III — The Path"
    >
      <div
        ref={textRef}
        className="absolute bottom-[12%] md:bottom-[14%] right-[8%] md:right-[10%] left-[8%] md:left-auto z-10 max-w-[34em] md:text-right pointer-events-none"
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
          III.
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
          No address. Only coordinates.
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
          Leave the noise behind. Follow the boardwalk in.
        </p>
      </div>
    </section>
  );
}
