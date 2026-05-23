"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useWebGLContent } from '@/components/WebGL/WebGLContentLayer';
import { useScroll } from '@/lib/context/ScrollContext';

/**
 * Chapter VI — "A table waiting. Sourced from this island. Served by lantern."
 *
 * The interior moment. Camera moves into the open pavilion (now a real
 * 3D structure with columns + open architecture), passing under the roof,
 * settling close to a table with a lit lantern at its center. The lantern's
 * emissive shader provides actual flicker — first time the JourneyScene
 * has a non-camera light source.
 *
 * The procedural CSS dining tableau (ceiling/floor/candles/tables) that
 * used to render here is gone — the table and lantern are real 3D elements
 * in the world.
 */
const Moment07 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useWebGLContent({ id: 'moment-07', src: '/assets/moment-07/dining.mp4', poster: '/assets/moment-07/dining.poster.jpg', triggerRef: sectionRef });
  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const { isMobile } = useScroll();

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const splitTitle = titleRef.current
      ? new SplitText(titleRef.current, {
          type: 'lines,words',
          linesClass: 'overflow-hidden inline-flex',
          wordsClass: 'word',
        })
      : null;

    gsap.set([indexRef.current, subRef.current], { opacity: 0, y: 24 });
    if (splitTitle?.words) {
      gsap.set(splitTitle.words, {
        y: '110%',
        filter: 'blur(6px)',
        opacity: 0,
      });
    }

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1, filter: 'none' });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.7, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      return () => {
        splitTitle?.revert();
      };
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top top',
        end: isMobile ? '+=150%' : '+=250%',
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.8 : 1.2,
        onToggle: (self) => {
          sectionEl.classList.toggle('active', self.isActive);
        },
      },
    });

    // === Beat 1 (0.02 – 0.12) — Section enters with camera settle ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.015, filter: 'blur(1px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        ease: 'cinematic',
        duration: 0.10,
      },
      0.02
    );

    // === Beat 2 (0.12 – 0.30) — Index + headline reveal ===
    tl.to(
      indexRef.current,
      { opacity: 0.35, y: 0, duration: 0.08, ease: 'cinematic' },
      0.12
    );
    if (splitTitle?.words) {
      // Short declarative headline — snappier stagger lets "A table
      // waiting." land sharply, the way the lantern's emissive snaps on.
      tl.to(
        splitTitle.words,
        {
          y: '0%',
          filter: 'blur(0px)',
          opacity: 1,
          stagger: 0.05,
          duration: 0.12,
          ease: 'cinematic',
        },
        0.15
      );
    }

    // === HOLD 0.30 – 0.46 ===

    // === Beat 3 (0.46 – 0.62) — Sub reveals as camera settles by table ===
    tl.to(
      subRef.current,
      { opacity: 0.7, y: 0, duration: 0.10, ease: 'cinematic' },
      0.52
    );

    // === HOLD 0.62 – 0.88 — Camera leans toward lantern in JourneyScene ===

    // === Beat 4 (0.88 – 1.00) — Text exit: drift aside (intimate arc) ===
    tl.to(
      textRef.current,
      { opacity: 0, x: -40, force3D: true, duration: 0.12, ease: 'cinematic' },
      0.88
    );
    tl.to(
      sectionEl,
      { opacity: 0, duration: 0.08, ease: 'cinematic' },
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
      className="moment relative w-full overflow-hidden"
      id="moment-07"
      aria-label="Chapter VI — A table waiting"
    >
      {/* Editorial column — left, matching the hero voice anchor */}
      <div
        ref={textRef}
        className="absolute top-[14%] md:top-[16%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-20 max-w-[34em] pointer-events-none"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-3 md:mb-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
            lineHeight: 1,
            color: 'rgba(240,210,160,0.4)',
            textShadow: '0 2px 16px rgba(20,12,4,0.75)',
          }}
        >
          VI.
        </span>
        <h2
          ref={titleRef}
          className="italic font-light mb-6 md:mb-8"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 3.8vw, 3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: 'rgba(245,225,185,0.95)',
            textShadow: '0 4px 50px rgba(20,12,4,0.75)',
          }}
        >
          A table waiting.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em]"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
            lineHeight: 1.5,
            color: 'rgba(240,215,175,0.75)',
            textShadow: '0 2px 20px rgba(20,12,4,0.55)',
          }}
        >
          Sourced from this island. Served by lantern.
        </p>
      </div>
    </section>
  );
};

export default Moment07;
