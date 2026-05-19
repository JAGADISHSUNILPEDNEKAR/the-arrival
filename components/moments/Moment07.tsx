"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

const Moment07 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const ceilingRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const candleRefs = useRef<HTMLDivElement[]>([]);

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
    gsap.set(tableRef.current, { opacity: 0, y: 60, scale: 0.9 });

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.7, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      gsap.set(tableRef.current, { opacity: 1, y: 0, scale: 1 });
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

    // === Beat 1 (0.00 – 0.15) — Section enters; ceiling/floor parallax; candles drift ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    tl.to(ceilingRef.current, { y: '-10vh', opacity: 0.7, ease: 'none' }, 0);
    tl.to(floorRef.current, { y: '15vh', rotateX: '30deg', ease: 'none' }, 0);
    candleRefs.current.forEach((candle, i) => {
      if (!candle) return;
      tl.to(
        candle,
        {
          opacity: 0.4,
          scale: 1.4,
          x: i % 2 === 0 ? 30 : -30,
          y: i % 3 === 0 ? 15 : -15,
          filter: 'blur(50px)',
          ease: 'none',
        },
        0
      );
    });

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

    // === Beat 3 (0.42 – 0.60) — Sub + table enters ===
    tl.to(
      subRef.current,
      { opacity: 0.7, y: 0, duration: 0.10, ease: 'cinematic' },
      0.42
    );
    tl.to(
      tableRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        force3D: true,
        duration: 0.18,
        ease: 'cinematic',
      },
      0.42
    );

    // === HOLD 0.60 – 0.72 ===

    // === Beat 4 (0.72 – 0.88) — Camera pulls toward the table ===
    tl.to(
      tableRef.current,
      {
        scale: 1.5,
        y: '-10vh',
        force3D: true,
        ease: 'none',
      },
      0.72
    );

    // === Beat 5 (0.88 – 1.00) — Exit ===
    tl.to(
      textRef.current,
      { opacity: 0, y: -120, scale: 1.1, force3D: true, ease: 'cinematic' },
      0.88
    );
    tl.to(
      sectionEl,
      { opacity: 0, scale: 0.98, y: -40, ease: 'cinematic' },
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

  const candles = [
    { left: '25%', top: '45%', width: '120px', height: '60px' },
    { left: '60%', top: '55%', width: '140px', height: '70px' },
    { left: '40%', top: '35%', width: '90px', height: '45px' },
    { left: '75%', top: '40%', width: '110px', height: '55px' },
  ];

  const tables = [
    { left: '20%', bottom: '25%', width: '100px', height: '8px', brightness: 0.18, isNearest: false },
    { left: '70%', bottom: '28%', width: '80px', height: '6px', brightness: 0.12, isNearest: false },
    { left: '45%', bottom: '18%', width: '130px', height: '10px', brightness: 0.22, isNearest: true },
  ];

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-07"
    >
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{
          background:
            'linear-gradient(180deg, rgba(42,30,18,0.75) 0%, rgba(58,40,24,0.70) 25%, rgba(46,32,21,0.65) 60%, rgba(30,20,8,0.60) 100%)',
        }}
      >
        {/* Editorial column — left, warm cream typography for the dining sub-palette */}
        <div
          ref={textRef}
          className="absolute top-[14%] md:top-[16%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-30 max-w-[34em] pointer-events-none"
        >
          <span
            ref={indexRef}
            className="block italic font-light mb-3 md:mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
              lineHeight: 1,
              color: 'rgba(240,210,160,0.35)',
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
              color: 'rgba(240,210,160,0.95)',
              textShadow: '0 4px 50px rgba(20,12,4,0.55)',
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
              color: 'rgba(240,210,160,0.7)',
            }}
          >
            Sourced from this island. Served by lantern.
          </p>
        </div>

        <div
          ref={ceilingRef}
          className="absolute top-0 left-0 w-full h-[25%] z-20 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(45deg, rgba(40, 30, 10, 0.4) 0px, rgba(40, 30, 10, 0.4) 2px, transparent 2px, transparent 10px),
              repeating-linear-gradient(-45deg, rgba(60, 45, 20, 0.3) 0px, rgba(60, 45, 20, 0.3) 1px, transparent 1px, transparent 8px),
              linear-gradient(180deg, rgba(30, 20, 10, 0.8) 0%, rgba(58, 40, 24, 0.4) 100%)
            `,
          }}
        />

        <div
          className="absolute bottom-0 left-0 w-full h-[35%] z-20"
          style={{ perspective: '1200px' }}
        >
          <div
            ref={floorRef}
            className="w-full h-full origin-bottom"
            style={{
              transform: 'rotateX(15deg)',
              background:
                'repeating-linear-gradient(0deg, rgba(120,80,40,0.9) 0px, rgba(140,95,50,0.85) 14px, rgba(100,65,30,0.7) 15px, rgba(100,65,30,0.7) 17px, rgba(120,80,40,0.9) 18px)',
            }}
          />
        </div>

        <div className="absolute inset-0 z-[15] pointer-events-none">
          {candles.map((c, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) candleRefs.current[i] = el;
              }}
              className="absolute rounded-[50%] bg-[#ffbe50]"
              style={{
                left: c.left,
                top: c.top,
                width: c.width,
                height: c.height,
                opacity: 0.15,
                filter: 'blur(30px)',
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 z-[25] pointer-events-none">
          {tables.map((t, i) => (
            <div
              key={i}
              ref={t.isNearest ? tableRef : null}
              className="absolute flex flex-col items-center"
              style={{
                left: t.left,
                bottom: t.bottom,
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  width: t.width,
                  height: t.height,
                  background: `rgba(200,180,140,${t.brightness})`,
                  borderRadius: '1px',
                }}
              />
              <div
                style={{
                  width: '2px',
                  height: '60px',
                  background: `rgba(200,180,140,${t.brightness * 0.5})`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Moment07;
