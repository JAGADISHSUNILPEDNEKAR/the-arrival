"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * The opening veil. Sits over the persistent AtmosphereLayer so the WebGL
 * world is visible from frame zero. The top-left coord micro is positioned
 * to match FilmHomepage's Act I coord exactly — when this component unpins,
 * the coord appears to persist into the hero, masking the handoff.
 */
const Preloader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion: settle as a static editorial title card, no pin.
    if (reducedMotion) {
      if (lineRef.current) lineRef.current.style.transform = 'scaleY(1)';
      if (veilRef.current) veilRef.current.style.opacity = '0.4';
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: 'top center' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: true,
        },
      });

      // Vertical line fills as user scrolls.
      tl.to(lineRef.current, { scaleY: 1, ease: 'none' }, 0);

      // Scroll hint fades at midpoint.
      tl.to(hintRef.current, { opacity: 0, y: 8, ease: 'none' }, 0.5);

      // Veil lifts — atmosphere takes over.
      tl.to(veilRef.current, { opacity: 0, ease: 'none' }, 0.55);

      // Line fades before unpin so it doesn't pop against the hero's empty
      // Act-I column where the title will materialize next.
      tl.to(lineRef.current, { opacity: 0, ease: 'none' }, 0.78);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen z-[10000] pointer-events-none"
    >
      {/* Translucent veil — atmosphere shader breathes through */}
      <div
        ref={veilRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'linear-gradient(180deg, rgba(6,8,16,0.88) 0%, rgba(6,8,16,0.75) 55%, rgba(6,8,16,0.68) 100%)',
        }}
      />

      {/* Top-left column — visually anchored to FilmHomepage Act I coord.
          The coord persists across the handoff; the line is a loading marker
          that fades before unpin so the hero title materializes in its space. */}
      <div className="absolute top-[26%] md:top-[28%] left-[8%] md:left-[10%] z-[2] flex flex-col gap-8 md:gap-10">
        <span
          className="block uppercase"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.625rem, 0.75vw, 0.8rem)',
            letterSpacing: '0.45em',
            color: 'rgba(245,240,232,0.6)',
          }}
        >
          From the Maldives
        </span>
        <div className="relative w-[1px] h-[60px] overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(245,240,232,0.12)' }} />
          <div
            ref={lineRef}
            className="absolute inset-0"
            style={{ background: 'rgba(245,240,232,0.55)' }}
          />
        </div>
      </div>

      {/* Bottom-center scroll hint */}
      <div
        ref={hintRef}
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-3"
      >
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.625rem, 0.7vw, 0.75rem)',
            letterSpacing: '0.5em',
            color: 'rgba(245,240,232,0.4)',
          }}
        >
          Scroll
        </span>
        <span
          aria-hidden
          style={{
            color: 'rgba(245,240,232,0.4)',
            fontSize: '0.85rem',
            lineHeight: 1,
          }}
        >
          ↓
        </span>
      </div>
    </div>
  );
};

export default Preloader;
