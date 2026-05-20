"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

/**
 * Chapter IV — "Out of the sun. Into the shade. The first lesson of the island."
 *
 * Camera steps off the jetty onto the island and moves into the palm canopy
 * zone. The nearest palm at world (-4, -25) frames the left side of the
 * view at very close range; pavilion sits in the distance through the
 * gaps between palms. JourneyScene owns the world; this component is
 * text-only.
 *
 * Text composition is deliberately right-anchored (rather than the
 * left-anchored editorial column the other moments use). It's an
 * intentional inversion from the original sun/shade split design — the
 * shade side carries the text. Don't move it back to the left.
 */
const Moment05 = ({}: { index: number }) => {
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
      gsap.set(sectionEl, { opacity: 1, scale: 1, filter: 'none' });
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
        0.15
      );
    }

    // === HOLD 0.30 – 0.48 ===

    // === Beat 3 (0.48 – 0.62) — Sub reveals as camera settles under palm ===
    tl.to(
      subRef.current,
      { opacity: 0.8, y: 0, duration: 0.10, ease: 'cinematic' },
      0.52
    );

    // === HOLD 0.62 – 0.88 — Camera dwells under shade in JourneyScene ===

    // === Beat 4 (0.88 – 1.00) — Text exit: drift aside (intimate arc) ===
    tl.to(
      textRef.current,
      { opacity: 0, x: -40, force3D: true, ease: 'cinematic' },
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
      id="moment-05"
    >
      {/* Editorial column — RIGHT-anchored. The shade carries the text,
          framed against the palm silhouette on the left of the view. */}
      <div
        ref={textRef}
        className="absolute top-[12%] md:top-[18%] right-[6%] md:right-[10%] left-auto md:left-[40%] z-20 max-w-[60vw] md:max-w-[34em] pointer-events-none text-right"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-3 md:mb-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
            lineHeight: 1,
            color: 'rgba(245,240,232,0.4)',
          }}
        >
          IV.
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
            textShadow: '0 4px 50px rgba(10,16,24,0.7)',
          }}
        >
          Out of the sun. Into the shade.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em] ml-auto"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
            lineHeight: 1.5,
            color: 'rgba(245,240,232,0.8)',
            textShadow: '0 2px 20px rgba(10,16,24,0.55)',
          }}
        >
          The first lesson of the island.
        </p>
      </div>
    </section>
  );
};

export default Moment05;
