"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';
import { buildKineticWordsFor, KineticWord } from '@/lib/kineticWord';

/**
 * Chapter V — "The pavilion at dusk. Lit by lantern. Veiled by palm."
 *
 * Camera moves through palm framing toward a centered close approach of
 * the pavilion structure. JourneyScene transitions sun direction toward
 * dusk during the scroll range that includes this moment, so the water
 * shader's fresnel and glint angle actually shift — the "dusk" beat is a
 * real lighting change, not a CSS tint.
 *
 * The anchor word "lantern" lives in the SUB line, not the title. We
 * split the sub paragraph specifically for kinetic-word lookup so the
 * breath fires correctly when the sub reveals. (The prior implementation
 * incorrectly wired kinetic to the title and never fired.)
 */
const Moment06 = ({}: { index: number }) => {
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
    // Sub split exists purely for kinetic-word lookup — we don't animate
    // the sub words individually; the paragraph still reveals as a whole.
    const splitSub = subRef.current
      ? new SplitText(subRef.current, {
          type: 'words',
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
        splitSub?.revert();
      };
    }

    const kineticSub: KineticWord[] = buildKineticWordsFor(
      splitSub?.words as Element[] | undefined
    );

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

    // === Beat 1 (0.00 – 0.12) — Section enters as camera approaches pavilion ===
    tl.fromTo(
      sectionEl,
      { opacity: 0 },
      { opacity: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );

    // === Beat 2 (0.12 – 0.32) — Index + headline reveal ===
    tl.to(
      indexRef.current,
      { opacity: 0.35, y: 0, duration: 0.08, ease: 'cinematic' },
      0.14
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

    // === HOLD 0.32 – 0.46 ===

    // === Beat 3 (0.46 – 0.62) — Sub reveals; kinetic breath on "lantern" ===
    tl.to(
      subRef.current,
      { opacity: 0.8, y: 0, duration: 0.10, ease: 'cinematic' },
      0.50
    );
    // Kinetic breath on "lantern" in the sub line (not the title — anchor
    // word lives in the sub paragraph).
    tl.call(() => kineticSub.forEach((kw) => kw.play()), [], 0.60);

    // === HOLD 0.62 – 0.88 — Camera dwells on pavilion in JourneyScene ===

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
      kineticSub.forEach((kw) => kw.revert());
      splitTitle?.revert();
      splitSub?.revert();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === sectionEl)
        .forEach((st) => st.kill());
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-06"
    >
      {/* Editorial column — left, matching the hero voice anchor */}
      <div
        ref={textRef}
        className="absolute top-[14%] md:top-[18%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-20 max-w-[34em] pointer-events-none"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-3 md:mb-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
            lineHeight: 1,
            color: 'rgba(245,235,210,0.4)',
          }}
        >
          V.
        </span>
        <h2
          ref={titleRef}
          className="italic font-light mb-6 md:mb-8"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 3.8vw, 3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: 'rgba(255,245,215,0.95)',
            textShadow: '0 4px 50px rgba(15,18,28,0.7)',
          }}
        >
          The pavilion at dusk.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em]"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
            lineHeight: 1.5,
            color: 'rgba(245,235,215,0.8)',
            textShadow: '0 2px 20px rgba(15,18,28,0.55)',
          }}
        >
          Lit by lantern. Veiled by palm.
        </p>
      </div>
    </section>
  );
};

export default Moment06;
