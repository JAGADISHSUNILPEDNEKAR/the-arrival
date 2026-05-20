"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

/**
 * Chapter IX — "Some tables are remembered longer than others."
 *
 * The meditative pause between the meal and the invitation. JourneyScene
 * drifts the camera out into open water, looking back at the island with
 * the pavilion silhouetted against the night and the lantern flickering
 * as a small warm point in the distance. The text composition is
 * deliberately CENTERED (vs the editorial left-anchor of other moments) —
 * a quote-like beat, not a chapter headline.
 *
 * The procedural CSS nebula/silhouette/star-field that used to render here
 * is gone — the night sky comes from AtmosphereLayer + JourneyScene's
 * atmospheric particles, the silhouette is the real pavilion in the world.
 */
const Moment10 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);

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
          linesClass: 'overflow-hidden inline-flex flex-wrap justify-center',
          wordsClass: 'word',
        })
      : null;

    gsap.set(indexRef.current, { opacity: 0, y: 24 });
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

    // === Beat 2 (0.20 – 0.45) — Index, then the quote arrives ===
    // The centered-quote composition keeps its later index/quote entry —
    // this is the meditative reflection beat, not a chapter headline.
    tl.to(
      indexRef.current,
      { opacity: 0.35, y: 0, duration: 0.10, ease: 'cinematic' },
      0.22
    );
    if (splitTitle?.words) {
      tl.to(
        splitTitle.words,
        {
          y: '0%',
          filter: 'blur(0px)',
          opacity: 1,
          stagger: 0.04,
          duration: 0.18,
          ease: 'expo.out',
        },
        0.28
      );
    }

    // === HOLD 0.45 – 0.88 — Long dwell, camera drifts out into open water ===

    // === Beat 3 (0.88 – 1.00) — Text exit: fade to void (night arc) ===
    tl.to(
      textRef.current,
      { opacity: 0, scale: 0.985, force3D: true, ease: 'cinematic' },
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
      id="moment-10"
    >
      {/* Centered quote — the site's only centered text composition.
          A deliberate pause beat between the gallery and the reservation. */}
      <div
        ref={textRef}
        className="absolute top-[36%] md:top-[38%] left-1/2 -translate-x-1/2 z-30 w-full max-w-[42em] px-6 pointer-events-none text-center"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-4 md:mb-5"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
            lineHeight: 1,
            color: 'rgba(220,225,235,0.4)',
          }}
        >
          IX.
        </span>
        <p
          ref={titleRef}
          className="italic font-light"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3.2vw, 3rem)',
            lineHeight: 1.25,
            letterSpacing: '0.005em',
            color: 'rgba(230,230,240,0.85)',
            textShadow: '0 4px 50px rgba(0,0,0,0.7)',
          }}
        >
          Some tables are remembered longer than others.
        </p>
      </div>
    </section>
  );
};

export default Moment10;
