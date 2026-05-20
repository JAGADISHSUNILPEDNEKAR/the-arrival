"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

/**
 * Chapter VII — the press testimonial. The narrative peak.
 *
 * Deliberately stripped of any object composition. AtmosphereLayer is muted
 * to near-black by a localized blackout overlay, so the quote exists in
 * cinematic isolation — film-title-card framing, long dwell, no competing
 * imagery. Pin runs 300% (vs 250% on neighboring chapters) to enforce
 * the silence beat and the post-reveal hold.
 */
const Moment08 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const sourceRef = useRef<HTMLParagraphElement>(null);

  const { isMobile } = useScroll();

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const splitQuote = quoteRef.current
      ? new SplitText(quoteRef.current, {
          type: 'lines,words',
          linesClass: 'overflow-hidden inline-flex flex-wrap justify-center',
          wordsClass: 'word',
        })
      : null;

    gsap.set([indexRef.current, sourceRef.current], { opacity: 0, y: 24 });
    if (splitQuote?.words) {
      gsap.set(splitQuote.words, {
        y: '110%',
        filter: 'blur(8px)',
        opacity: 0,
      });
    }
    gsap.set(blackoutRef.current, { opacity: 0 });

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1, filter: 'none' });
      gsap.set(blackoutRef.current, { opacity: 0.92 });
      gsap.set(indexRef.current, { opacity: 0.4, y: 0 });
      gsap.set(sourceRef.current, { opacity: 0.55, y: 0 });
      if (splitQuote?.words) {
        gsap.set(splitQuote.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      return () => {
        splitQuote?.revert();
      };
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top top',
        end: isMobile ? '+=180%' : '+=300%',
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.8 : 1.2,
        onToggle: (self) => {
          sectionEl.classList.toggle('active', self.isActive);
        },
      },
    });

    // === Beat 1 (0.00 – 0.18) — Section enters; world fades to near-black ===
    // Scale + blur clear slowly alongside the blackout — a ceremonial settle
    // appropriate to the testimonial silence beat (vs the fast camera-settle
    // used on other moments).
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.015, filter: 'blur(1px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        ease: 'cinematic',
        duration: 0.5,
      },
      0
    );
    tl.to(blackoutRef.current, { opacity: 0.92, ease: 'power2.inOut' }, 0.04);

    // === HOLD 0.18 – 0.30 — Silence beat. Nothing on screen but the void. ===

    // === Beat 2 (0.30 – 0.55) — Numeral, then quote word-by-word, then source ===
    tl.to(
      indexRef.current,
      { opacity: 0.4, y: 0, duration: 0.10, ease: 'cinematic' },
      0.30
    );
    if (splitQuote?.words) {
      tl.to(
        splitQuote.words,
        {
          y: '0%',
          filter: 'blur(0px)',
          opacity: 1,
          stagger: 0.035,
          duration: 0.18,
          ease: 'expo.out',
        },
        0.34
      );
    }
    tl.to(
      sourceRef.current,
      { opacity: 0.55, y: 0, duration: 0.10, ease: 'cinematic' },
      0.54
    );

    // === HOLD 0.55 – 0.85 — Long dwell. The reader sits with the line. ===

    // === Beat 3 (0.85 – 1.00) — Exit. Quote dissolves, world re-emerges. ===
    tl.to(
      textRef.current,
      { opacity: 0, y: -40, filter: 'blur(4px)', duration: 0.12, ease: 'cinematic' },
      0.85
    );
    tl.to(
      blackoutRef.current,
      { opacity: 0, duration: 0.15, ease: 'power2.inOut' },
      0.88
    );
    tl.to(
      sectionEl,
      { opacity: 0, ease: 'cinematic', duration: 0.12 },
      0.92
    );

    return () => {
      tl.kill();
      splitQuote?.revert();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === sectionEl)
        .forEach((st) => st.kill());
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-08"
    >
      {/* Blackout — mutes AtmosphereLayer underneath so the quote stands alone */}
      <div
        ref={blackoutRef}
        className="absolute inset-0 z-0 pointer-events-none bg-black"
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div ref={textRef} className="w-full max-w-[85vw] md:max-w-[65vw] lg:max-w-[55vw] px-8 text-center">
          <span
            ref={indexRef}
            className="block italic font-light mb-8 md:mb-12"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)',
              lineHeight: 1,
              letterSpacing: '0.02em',
              color: 'rgba(240,210,160,0.4)',
            }}
          >
            VII.
          </span>
          <p
            ref={quoteRef}
            className="italic font-light mb-10 md:mb-14"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 5.5vw, 5.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: 'rgba(245,225,185,0.95)',
              textShadow: '0 4px 60px rgba(0,0,0,0.85)',
            }}
          >
            “An experience that completely redefines the concept of private dining.”
          </p>
          <p
            ref={sourceRef}
            className="uppercase"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.625rem, 0.75vw, 0.8rem)',
              letterSpacing: '0.45em',
              color: 'rgba(240,210,160,0.55)',
            }}
          >
            — The Times Luxury
          </p>
        </div>
      </div>
    </section>
  );
};

export default Moment08;
