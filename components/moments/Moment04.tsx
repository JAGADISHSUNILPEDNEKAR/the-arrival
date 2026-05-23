"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useWebGLContent } from '@/components/WebGL/WebGLContentLayer';
import { useScroll } from '@/lib/context/ScrollContext';

/**
 * Chapter III — "Leave the noise behind. Cross by barefoot. The tides keep time."
 *
 * The jetty walk. After the aerial reveal in Moment03, the camera descends
 * back to ground level onto the jetty's outer end, then walks down the
 * jetty toward the island — water on either side, palms framing the view
 * ahead. JourneyScene owns the world; this component is text-only.
 *
 * The procedural CSS planks/feet/petals composition that used to live here
 * is gone — the jetty is now a real 3D element under the camera.
 */
const Moment04 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useWebGLContent({ id: 'moment-04', src: '/assets/moment-04/threshold.mp4', poster: '/assets/moment-04/threshold.poster.jpg', triggerRef: sectionRef });
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
      gsap.set(subRef.current, { opacity: 0.85, y: 0 });
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
      // Imperative line — slower, more deliberate stagger lets each word
      // land with weight ("Leave. The. Noise. Behind.").
      tl.to(
        splitTitle.words,
        {
          y: '0%',
          filter: 'blur(0px)',
          opacity: 1,
          stagger: 0.03,
          duration: 0.18,
          ease: 'cinematic',
        },
        0.15
      );
    }

    // === HOLD 0.30 – 0.46 ===

    // === Beat 3 (0.46 – 0.62) — Sub reveals as camera lands on the jetty ===
    tl.to(
      subRef.current,
      { opacity: 0.85, y: 0, duration: 0.10, ease: 'cinematic' },
      0.50
    );

    // === HOLD 0.62 – 0.88 — Camera walks the jetty in JourneyScene ===

    // === Beat 4 (0.88 – 1.00) — Text exit: dissolve upward (approach arc) ===
    tl.to(
      textRef.current,
      { opacity: 0, y: -60, filter: 'blur(2px)', force3D: true, duration: 0.12, ease: 'cinematic' },
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
      id="moment-04"
      aria-label="Chapter III — Leave the noise behind"
    >
      {/* Editorial column — left, matching the hero voice anchor */}
      <div
        ref={textRef}
        className="absolute top-[16%] md:top-[18%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-20 max-w-[34em] pointer-events-none"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-3 md:mb-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
            lineHeight: 1,
            color: 'rgba(240,232,210,0.4)',
            textShadow: '0 2px 16px rgba(8,16,24,0.65)',
          }}
        >
          III.
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
            textShadow: '0 4px 50px rgba(8,16,24,0.65)',
          }}
        >
          Leave the noise behind.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em]"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
            lineHeight: 1.5,
            color: 'rgba(245,240,232,0.85)',
            textShadow: '0 2px 20px rgba(8,16,24,0.55)',
          }}
        >
          Cross by barefoot. The tides keep time.
        </p>
      </div>
    </section>
  );
};

export default Moment04;
