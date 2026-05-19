"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

const Moment08 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const candleFlameRef = useRef<HTMLDivElement>(null);
  const candleGlowRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const glassShimmerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const sourceRef = useRef<HTMLParagraphElement>(null);

  const [menuLines, setMenuLines] = useState<number[]>([]);
  const { isMobile } = useScroll();

  // Random menu line widths — rAF defers setState out of the effect body.
  useEffect(() => {
    const lines = [...Array(6)].map(() => 60 + Math.random() * 30);
    const rafId = requestAnimationFrame(() => setMenuLines(lines));
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const splitQuote = quoteRef.current
      ? new SplitText(quoteRef.current, {
          type: 'lines,words',
          linesClass: 'overflow-hidden inline-flex',
          wordsClass: 'word',
        })
      : null;

    // Initial states
    gsap.set([indexRef.current, sourceRef.current], { opacity: 0, y: 24 });
    if (splitQuote?.words) {
      gsap.set(splitQuote.words, {
        y: '110%',
        filter: 'blur(6px)',
        opacity: 0,
      });
    }
    gsap.set(tableRef.current, { opacity: 0, y: 80, scale: 0.95 });

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(sourceRef.current, { opacity: 0.5, y: 0 });
      if (splitQuote?.words) {
        gsap.set(splitQuote.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      gsap.set(tableRef.current, { opacity: 1, y: 0, scale: 1 });
      return () => {
        splitQuote?.revert();
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

    // === Beat 1 (0.00 – 0.15) — Section enters; ambient continuous ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    tl.to(containerRef.current, { scale: 1.1, force3D: true, ease: 'none' }, 0);
    tl.fromTo(
      shadowRef.current,
      { x: '100%', opacity: 0 },
      { x: '-50%', opacity: 0.5, force3D: true, ease: 'none' },
      0
    );
    // Candle flame flickers, glow swells, glass shimmers — slow ambient.
    tl.to(candleFlameRef.current, { scale: 1.6, x: 5, rotate: 15, ease: 'none' }, 0);
    tl.to(candleGlowRef.current, { opacity: 0.6, scale: 2, ease: 'none' }, 0);
    tl.to(glassShimmerRef.current, { x: '300%', ease: 'none' }, 0);

    // === Beat 2 (0.15 – 0.32) — Index + quote reveal ===
    tl.to(
      indexRef.current,
      { opacity: 0.35, y: 0, duration: 0.08, ease: 'cinematic' },
      0.15
    );
    if (splitQuote?.words) {
      tl.to(
        splitQuote.words,
        {
          y: '0%',
          filter: 'blur(0px)',
          opacity: 1,
          stagger: 0.02,
          duration: 0.15,
          ease: 'cinematic',
        },
        0.18
      );
    }
    // Source attribution lands after the quote settles.
    tl.to(
      sourceRef.current,
      { opacity: 0.5, y: 0, duration: 0.08, ease: 'cinematic' },
      0.30
    );

    // === HOLD 0.32 – 0.42 ===

    // === Beat 3 (0.42 – 0.60) — Table + items stagger reveal ===
    tl.to(
      tableRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        force3D: true,
        duration: 0.16,
        ease: 'cinematic',
      },
      0.42
    );
    const items = [
      { el: plateRef.current, y: 30, rotateX: -10 },
      { el: menuRef.current, y: 50, rotate: 5 },
      { el: candleRef.current, y: 20, scale: 0.9 },
      { el: glassRef.current, y: 60, rotate: -5 },
    ];
    items.forEach((item, i) => {
      if (!item.el) return;
      tl.fromTo(
        item.el,
        {
          opacity: 0,
          y: item.y,
          rotate: item.rotate || 0,
          rotateX: item.rotateX || 0,
        },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          rotateX: 0,
          force3D: true,
          ease: 'cinematic',
          duration: 0.12,
        },
        0.46 + i * 0.025
      );
    });

    // === HOLD 0.60 – 0.72 ===

    // === Beat 4 (0.72 – 0.88) — Items drift as the camera pulls back ===
    tl.to(menuRef.current, { rotate: 8, y: '-15vh', x: '2vw', ease: 'none' }, 0.72);
    tl.to(plateRef.current, { scale: 1.2, y: '-8vh', ease: 'none' }, 0.72);
    tl.to(glassRef.current, { y: '-20vh', scale: 1.1, ease: 'none' }, 0.72);

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
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{
          background:
            'linear-gradient(135deg, rgba(26,16,8,0.78) 0%, rgba(38,24,8,0.72) 40%, rgba(30,20,8,0.68) 100%)',
        }}
      >
        {/* Overhead radial glow */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% -10%, rgba(255,200,100,0.22) 0%, transparent 65%)',
          }}
        />

        {/* Bottom horizon strip */}
        <div
          className="absolute bottom-0 left-0 w-full h-[20%] z-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(30,80,100,0.4) 0%, rgba(20,60,80,0.6) 100%)',
          }}
        />

        {/* Sweeping shadow */}
        <div
          ref={shadowRef}
          className="absolute right-0 top-0 h-full w-[40%] z-40 pointer-events-none bg-black blur-[100px] opacity-0"
        />

        {/* Editorial press-quote spread — right column, warm cream */}
        <div
          ref={textRef}
          className="absolute top-[14%] md:top-[16%] right-[8%] md:right-[10%] z-30 max-w-[24em] pointer-events-none text-right"
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
            VII.
          </span>
          <p
            ref={quoteRef}
            className="italic font-light mb-5 md:mb-6"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.005em',
              color: 'rgba(240,210,160,0.95)',
              textShadow: '0 4px 50px rgba(20,12,4,0.55)',
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
              letterSpacing: '0.4em',
              color: 'rgba(240,210,160,0.5)',
            }}
          >
            — The Times Luxury
          </p>
        </div>

        {/* Table composition */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div
            ref={tableRef}
            className="relative w-[55vw] max-w-[680px] h-[45vh] max-h-[350px] shadow-[0_20px_80px_rgba(0,0,0,0.7),0_4px_20px_rgba(0,0,0,0.5)] rounded-[4px]"
            style={{
              background: `
                repeating-linear-gradient(91deg, transparent, transparent 30px, rgba(0,0,0,0.04) 31px),
                linear-gradient(180deg, rgba(90,58,30,0.95) 0%, rgba(70,45,22,0.9) 100%)
              `,
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[80%] border border-[rgba(220,215,200,0.4)] shadow-sm"
              style={{
                background: `
                  repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.015) 5px),
                  rgba(245,240,228,0.92)
                `,
              }}
            >
              <div
                ref={plateRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(80px,12vw,140px)] h-[clamp(80px,12vw,140px)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.15),0_4px_20px_rgba(0,0,0,0.3)] group cursor-pointer transition-transform duration-500 hover:scale-[1.03]"
                style={{
                  background:
                    'linear-gradient(145deg, #d4c8a8, #c8bca0, #dcd0b0)',
                  borderRadius: '51% 49% 52% 48% / 49% 51% 48% 52%',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[rgba(0,0,0,0.1)] rounded-[inherit]">
                  <span
                    className="text-[9px] uppercase tracking-widest text-[#fff] font-light drop-shadow-md"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Explore Dish
                  </span>
                </div>
              </div>

              <div
                ref={menuRef}
                className="absolute top-[20%] right-[10%] w-[clamp(80px,10vw,120px)] h-[clamp(120px,15vw,180px)] p-4 shadow-[2px_3px_12px_rgba(0,0,0,0.25)] -rotate-[2deg] flex flex-col gap-[14px] group cursor-pointer transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-[1.05]"
                style={{
                  background: 'rgba(248,244,234,0.96)',
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 bg-[rgba(248,244,234,0.95)] px-2">
                  <p
                    className="text-[8px] uppercase tracking-widest text-center text-[#4a3820]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Tasting Menu
                    <br />
                    <span
                      className="italic normal-case text-[10px] mt-2 block opacity-70"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Inspired by the Tides
                    </span>
                  </p>
                </div>
                {menuLines.map((width, i) => (
                  <div
                    key={i}
                    className="h-[1px] bg-[rgba(100,80,60,0.3)]"
                    style={{ width: `${width}%` }}
                  />
                ))}
                <div className="mt-auto h-[1px] bg-[rgba(80,60,40,0.5)] w-[40px]" />
              </div>

              <div
                ref={candleRef}
                className="absolute top-[30%] left-[15%] w-[40px] h-[70px] flex flex-col items-center"
              >
                <div
                  ref={candleGlowRef}
                  className="absolute -top-4 w-20 h-24 rounded-full pointer-events-none opacity-25"
                  style={{
                    background:
                      'radial-gradient(ellipse 40px 50px at center, rgba(255,200,80,0.5), transparent)',
                  }}
                />
                <div
                  ref={candleFlameRef}
                  className="w-2 h-4 bg-[rgba(255,210,80,0.9)] rounded-[50%_50%_30%_30%] mb-1"
                />
                <div
                  className="w-[10px] h-[50px]"
                  style={{
                    background: 'linear-gradient(180deg, #f5e8c0, #e8d4a0)',
                  }}
                />
              </div>

              <div
                ref={glassRef}
                className="absolute top-[25%] right-[25%] flex flex-col items-center pointer-events-none"
              >
                <div className="w-8 h-12 rounded-[40%_40%_100%_100%] bg-[rgba(200,190,170,0.3)] overflow-hidden">
                  <div
                    ref={glassShimmerRef}
                    className="w-full h-full"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      transform: 'translateX(-100%)',
                    }}
                  />
                </div>
                <div className="w-[2px] h-10 bg-[rgba(200,190,170,0.3)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Moment08;
