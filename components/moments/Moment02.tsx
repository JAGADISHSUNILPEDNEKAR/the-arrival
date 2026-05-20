"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

/**
 * Chapter I — "A sanctuary, woven into the shoreline."
 *
 * Visuals are owned by JourneyScene (3D sanctuary island + ocean + camera
 * approach). This component is now text-only — the editorial column rides
 * on top of the rendered world. The procedural CSS island/water shimmer/
 * gradient overlays that used to live here are gone; the world below the
 * text is real now.
 */
const Moment02 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
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
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.8, y: 0 });
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

    // === Beat 1 (0.00 – 0.15) — Section enters ===
    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );

    // === Beat 2 (0.15 – 0.32) — Index + headline reveal ===
    tl.to(
      indexRef.current,
      { opacity: 0.35, y: 0, duration: 0.08, ease: 'cinematic' },
      0.15
    );
    if (splitTitle?.words) {
      tl.to(
        splitTitle.words,
        {
          y: '0%',
          filter: 'blur(0px)',
          opacity: 1,
          stagger: 0.04,
          duration: 0.15,
          ease: 'cinematic',
        },
        0.18
      );
    }

    // === HOLD 0.32 – 0.42 ===

    // === Beat 3 (0.42 – 0.60) — Sub reveals ===
    tl.to(
      subRef.current,
      { opacity: 0.8, y: 0, duration: 0.10, ease: 'cinematic' },
      0.42
    );

    // === HOLD 0.60 – 0.88 — Camera dwells on sanctuary in JourneyScene ===

    // === Beat 4 (0.88 – 1.00) — Text exit ===
    tl.to(
      textRef.current,
      { opacity: 0, y: -80, force3D: true, ease: 'cinematic' },
      0.88
    );
    tl.to(
      sectionEl,
      { opacity: 0, ease: 'cinematic' },
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
      id="moment-02"
    >
      {/* Editorial column — left, matching the hero voice anchor */}
      <div
        ref={textRef}
        className="absolute top-[18%] md:top-[20%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-10 max-w-[34em] pointer-events-none"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-3 md:mb-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
            lineHeight: 1,
            color: 'rgba(240,232,210,0.4)',
          }}
        >
          I.
        </span>
        <h2
          ref={titleRef}
          className="italic font-light mb-6 md:mb-8"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 3.8vw, 3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: 'rgba(255,250,240,0.95)',
            textShadow: '0 4px 50px rgba(6,14,26,0.6)',
          }}
        >
          A sanctuary, woven into the shoreline.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em]"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
            lineHeight: 1.5,
            color: 'rgba(245,240,232,0.8)',
            textShadow: '0 2px 20px rgba(6,14,26,0.5)',
          }}
        >
          Far from the noise. Suspended above the turquoise sea.
        </p>
      </div>
    </section>
  );
};

export default Moment02;
