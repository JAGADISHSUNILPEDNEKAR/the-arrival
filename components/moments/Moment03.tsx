"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';
import AssetSlot from '@/components/AssetSlot';
import { buildKineticWordsFor, KineticWord } from '@/lib/kineticWord';

const Moment03 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const deepWaterRef = useRef<HTMLDivElement>(null);
  const shallowLagoonRef = useRef<HTMLDivElement>(null);
  const sandRef = useRef<HTMLDivElement>(null);
  const causticsRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const jettyRef = useRef<HTMLDivElement>(null);

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

    // Initial states
    gsap.set([indexRef.current, subRef.current], { opacity: 0, y: 24 });
    if (splitTitle?.words) {
      gsap.set(splitTitle.words, {
        y: '110%',
        filter: 'blur(6px)',
        opacity: 0,
      });
    }
    gsap.set(islandRef.current, { opacity: 0, y: -120, scale: 0.7 });
    gsap.set(jettyRef.current, { opacity: 0, scaleY: 0, transformOrigin: 'bottom center' });

    // Reduced motion: settle visible, no pin.
    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.8, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      gsap.set(islandRef.current, { opacity: 1, y: 0, scale: 1 });
      gsap.set(jettyRef.current, { opacity: 1, scaleY: 1 });
      return () => {
        splitTitle?.revert();
      };
    }

    // Kinetic-typography controllers for the chapter's anchor word.
    const kineticTitle: KineticWord[] = buildKineticWordsFor(
      splitTitle?.words as Element[] | undefined
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

    // === Beat 1 (0.00 – 0.12) — Section enters; multi-layer parallax starts ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    tl.fromTo(skyRef.current, { y: '-5%' }, { y: '5%', ease: 'none' }, 0);
    tl.fromTo(
      deepWaterRef.current,
      { y: '10%' },
      { y: '-10%', ease: 'none' },
      0
    );
    tl.fromTo(
      shallowLagoonRef.current,
      { y: '15%' },
      { y: '-15%', ease: 'none' },
      0
    );
    tl.fromTo(
      sandRef.current,
      { y: '20%', opacity: 0.2 },
      { y: '-20%', opacity: 0.6, ease: 'none' },
      0
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
    // Kinetic breath on "coordinates" — fires once after the headline settles.
    tl.call(() => kineticTitle.forEach((kw) => kw.play()), [], 0.34);

    // === HOLD 0.30 – 0.40 ===

    // === Beat 3 (0.40 – 0.58) — Island descends; sub + jetty reveal ===
    tl.to(
      islandRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        force3D: true,
        duration: 0.18,
        ease: 'cinematic',
      },
      0.40
    );
    tl.to(
      subRef.current,
      { opacity: 0.8, y: 0, duration: 0.10, ease: 'cinematic' },
      0.48
    );
    tl.to(
      jettyRef.current,
      {
        opacity: 1,
        scaleY: 1,
        force3D: true,
        duration: 0.12,
        ease: 'cinematic',
      },
      0.52
    );

    // === HOLD 0.58 – 0.70 ===

    // === Beat 4 (0.70 – 0.88) — Fly-over: zoom toward the lagoon ===
    tl.to(
      islandRef.current,
      {
        scale: 2.5,
        y: '-25vh',
        opacity: 0.4,
        force3D: true,
        ease: 'none',
      },
      0.70
    );
    tl.to(
      jettyRef.current,
      {
        scaleY: 2.5,
        y: '-20vh',
        opacity: 0,
        force3D: true,
        ease: 'none',
      },
      0.70
    );
    tl.to(
      causticsRef.current,
      {
        opacity: 0.5,
        scale: 1.15,
        backgroundPosition: '60px -60px',
        ease: 'none',
      },
      0.70
    );

    // === Beat 5 (0.88 – 1.00) — Exit ===
    tl.to(
      textRef.current,
      { opacity: 0, y: -80, ease: 'cinematic' },
      0.88
    );
    tl.to(
      sectionEl,
      { opacity: 0, scale: 0.98, y: -40, ease: 'cinematic' },
      0.92
    );

    return () => {
      tl.kill();
      kineticTitle.forEach((kw) => kw.revert());
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
      id="moment-03"
    >
      <div className="absolute inset-0 w-full h-full">
        <div
          ref={skyRef}
          className="absolute top-0 left-0 w-full h-[45%] z-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(26,64,96,0.55) 0%, rgba(58,122,154,0.50) 35%, rgba(106,173,190,0.45) 55%)',
          }}
        />

        <div
          ref={deepWaterRef}
          className="absolute top-[35%] left-0 w-full h-[30%] z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(74,154,176,0.55) 0%, rgba(58,138,158,0.55) 100%)',
          }}
        />

        <div
          ref={shallowLagoonRef}
          className="absolute bottom-0 left-0 w-full h-[55%] z-[2]"
          style={{
            background:
              'linear-gradient(180deg, rgba(40,160,160,0.60) 0%, rgba(60,190,170,0.55) 20%, rgba(100,210,180,0.50) 40%, rgba(150,225,200,0.45) 65%, rgba(200,238,218,0.40) 85%, rgba(225,245,230,0.35) 100%)',
          }}
        />

        <div
          ref={sandRef}
          className="absolute bottom-0 left-0 w-full h-[35%] z-[3]"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(240,225,180,0.35) 0%, transparent 70%)',
          }}
        />

        <div
          ref={causticsRef}
          className="absolute inset-0 w-full h-full z-[4] pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 3px 8px at 20% 70%, rgba(255,255,255,0.15) 0%, transparent 100%),
              radial-gradient(ellipse 5px 3px at 45% 80%, rgba(255,255,255,0.12) 0%, transparent 100%),
              radial-gradient(ellipse 4px 6px at 70% 75%, rgba(255,255,255,0.1) 0%, transparent 100%),
              radial-gradient(ellipse 3px 5px at 85% 68%, rgba(255,255,255,0.13) 0%, transparent 100%)
            `,
          }}
        />
      </div>

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
            color: 'rgba(240,232,210,0.35)',
          }}
        >
          II.
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
            textShadow: '0 4px 50px rgba(15,35,55,0.5)',
          }}
        >
          No address. Only coordinates.
        </h2>
        <p
          ref={subRef}
          className="italic font-light max-w-[28em]"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
            lineHeight: 1.5,
            color: 'rgba(245,240,232,0.8)',
          }}
        >
          Twenty-eight acres, between reef and tide.
        </p>
      </div>

      {/* Island silhouette — centered, AssetSlot ready */}
      <div
        ref={islandRef}
        className="absolute left-1/2 -translate-x-1/2 top-[38%] z-[4]"
        style={{
          width: 'clamp(200px, 35vw, 500px)',
          height: 'clamp(40px, 8vw, 100px)',
        }}
      >
        <AssetSlot
          id="moment-03-island"
          alt="Aerial view of a private island in turquoise lagoon"
          className="w-full h-full"
        >
          <div
            className="w-full h-full"
            style={{
              background: 'rgba(15, 40, 25, 0.85)',
              clipPath:
                'polygon(0% 100%, 5% 70%, 10% 85%, 14% 50%, 18% 70%, 22% 35%, 27% 60%, 31% 25%, 35% 55%, 39% 40%, 43% 65%, 47% 30%, 51% 55%, 55% 20%, 59% 50%, 63% 38%, 67% 60%, 71% 45%, 75% 65%, 80% 50%, 85% 70%, 90% 55%, 95% 75%, 100% 100%)',
            }}
          />
        </AssetSlot>
      </div>

      {/* Slim wooden jetty — rises from the lagoon */}
      <div
        ref={jettyRef}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-[5]"
        style={{
          width: '3px',
          height: '38%',
          background:
            'linear-gradient(180deg, transparent, rgba(180,140,90,0.6) 40%, rgba(160,120,70,0.8) 100%)',
        }}
      />
    </section>
  );
};

export default Moment03;
