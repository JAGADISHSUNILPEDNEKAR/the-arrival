"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  opacity: number;
}

interface Foam {
  size: number;
  top: number;
  left: number;
}

const Moment09 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<HTMLDivElement[]>([]);
  const plateRef = useRef<HTMLDivElement>(null);
  const sauceRef = useRef<HTMLDivElement>(null);
  const fishRef = useRef<HTMLDivElement>(null);
  const herbsRef = useRef<HTMLDivElement>(null);
  const foamRef = useRef<HTMLDivElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const steamItemsRef = useRef<HTMLDivElement[]>([]);
  const candleFlameRef = useRef<HTMLDivElement>(null);
  const candleGlowRef = useRef<HTMLDivElement>(null);

  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const [starsData, setStarsData] = useState<Star[]>([]);
  const [foamData, setFoamData] = useState<Foam[]>([]);
  const { isMobile } = useScroll();

  // Generate ambient data client-side — single rAF to defer both setStates.
  useEffect(() => {
    const starCount = isMobile ? 12 : 20;
    const foamCount = isMobile ? 3 : 6;
    const stars: Star[] = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 1.5}px`,
      opacity: 0.3 + Math.random() * 0.4,
    }));
    const foam: Foam[] = [...Array(foamCount)].map(() => ({
      size: 10 + Math.random() * 20,
      top: Math.random() * 10,
      left: Math.random() * 10,
    }));
    const rafId = requestAnimationFrame(() => {
      setStarsData(stars);
      setFoamData(foam);
    });
    return () => cancelAnimationFrame(rafId);
  }, [isMobile]);

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
    gsap.set(plateRef.current, {
      opacity: 0,
      scale: 0.85,
      y: 80,
      rotateX: 15,
    });

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.7, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      gsap.set(plateRef.current, { opacity: 1, scale: 1, y: 0, rotateX: 0 });
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

    // === Beat 1 (0.00 – 0.15) — Section enters; stars drift; candle ambient ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    starRefs.current.forEach((star) => {
      if (!star) return;
      tl.to(
        star,
        { opacity: 0.8, scale: 2, y: '-10vh', ease: 'none' },
        0
      );
    });
    tl.to(candleFlameRef.current, { scale: 1.8, x: 6, rotate: 20, ease: 'none' }, 0);
    tl.to(candleGlowRef.current, { opacity: 0.6, scale: 2.2, ease: 'none' }, 0);

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

    // === Beat 3 (0.42 – 0.62) — Sub + plate enters + dish components stagger + steam rises ===
    tl.to(
      subRef.current,
      { opacity: 0.7, y: 0, duration: 0.10, ease: 'cinematic' },
      0.42
    );
    tl.to(
      plateRef.current,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        force3D: true,
        duration: 0.18,
        ease: 'cinematic',
      },
      0.42
    );
    tl.fromTo(
      sauceRef.current,
      { x: -40, opacity: 0, scale: 0.8 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        force3D: true,
        duration: 0.10,
        ease: 'cinematic',
      },
      0.48
    );
    const foodItems = [fishRef.current, herbsRef.current, foamRef.current].filter(
      Boolean
    ) as HTMLElement[];
    tl.fromTo(
      foodItems,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        force3D: true,
        stagger: 0.025,
        duration: 0.10,
        ease: 'cinematic',
      },
      0.50
    );
    steamItemsRef.current.forEach((steam, i) => {
      if (!steam) return;
      tl.fromTo(
        steam,
        { y: 10, opacity: 0 },
        {
          y: -120 - i * 20,
          opacity: 0.5,
          scale: 2,
          ease: 'none',
          duration: 0.20,
        },
        0.50 + i * 0.015
      );
    });

    // === HOLD 0.62 – 0.72 ===

    // === Beat 4 (0.72 – 0.88) — Plate pulls forward ===
    tl.to(
      plateRef.current,
      {
        y: '-15vh',
        scale: 1.2,
        rotateX: -10,
        force3D: true,
        ease: 'none',
      },
      0.72
    );

    // === Beat 5 (0.88 – 1.00) — Exit ===
    tl.to(
      plateRef.current,
      {
        y: -250,
        opacity: 0,
        scale: 0.7,
        force3D: true,
        ease: 'cinematic',
      },
      0.88
    );
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
  }, [starsData, isMobile]);

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-09"
    >
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,8,16,0.82) 0%, rgba(12,12,24,0.78) 40%, rgba(8,8,16,0.82) 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-0">
          {starsData.map((star, i) => (
            <div
              key={star.id}
              ref={(el) => {
                if (el) starRefs.current[i] = el;
              }}
              className="absolute bg-white rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        {/* Editorial column — left, warm cream for dining sub-palette */}
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
            VIII.
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
              textShadow: '0 4px 50px rgba(0,0,0,0.6)',
            }}
          >
            Eight courses. One ocean.
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
            Sourced within sight of the plate.
          </p>
        </div>

        <div
          ref={candleRef}
          className="absolute top-[28%] left-[28%] z-30 flex flex-col items-center"
        >
          <div
            ref={candleGlowRef}
            className="absolute -top-24 w-[300px] h-[400px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: '50%',
              top: '10px',
              background:
                'radial-gradient(ellipse 120px 180px at center, rgba(255,185,70,0.3) 0%, rgba(255,160,50,0.08) 50%, transparent 75%)',
              opacity: 0.7,
            }}
          />
          <div
            ref={candleFlameRef}
            className="w-1.5 h-3.5 bg-[rgba(255,210,80,0.95)] rounded-[50%_50%_30%_30%] mb-1 shadow-[0_0_12px_rgba(255,180,50,0.7)]"
          />
          <div
            className="w-[8px] h-[45px]"
            style={{
              background: 'linear-gradient(180deg, #f0e0b0, #dcc080)',
            }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div
            ref={plateRef}
            className="relative w-[clamp(120px,18vw,220px)] h-[clamp(120px,18vw,220px)] flex items-center justify-center"
            style={{
              background:
                'linear-gradient(145deg, #1a1510, #252015, #1e1a0e)',
              borderRadius: '51% 49% 50% 50% / 50% 51% 49% 50%',
              boxShadow:
                'inset -3px -2px 0 rgba(255,200,100,0.15), 0 0 0 1px rgba(255,200,100,0.08), 0 20px 50px rgba(0,0,0,0.7)',
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                ref={sauceRef}
                className="absolute top-[48%] left-[32%] w-[38%] h-[32%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(200,80,40,0.9) 0%, rgba(220,100,30,0.7) 100%)',
                  borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%',
                  filter: 'blur(0.5px)',
                }}
              />

              <div
                ref={fishRef}
                className="absolute top-1/2 left-1/2 w-[55%] h-[28%] -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(220,200,160,0.9) 0%, rgba(190,170,130,0.8) 100%)',
                  borderRadius: '45% 55% 50% 50% / 40% 40% 60% 60%',
                  boxShadow:
                    'inset 0 2px 5px rgba(255,255,255,0.15), 0 3px 10px rgba(0,0,0,0.4)',
                }}
              />

              <div ref={herbsRef} className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute top-[40%] left-[65%] w-[6px] h-[6px] rounded-full bg-[rgba(60,100,40,0.95)]" />
                <div className="absolute top-[62%] left-[72%] w-[5px] h-[5px] rounded-full bg-[rgba(60,100,40,0.95)]" />
              </div>

              <div
                ref={foamRef}
                className="absolute top-[65%] left-[42%] w-[15px] h-[15px] pointer-events-none z-20"
              >
                {foamData.map((f, i) => (
                  <div
                    key={i}
                    className="absolute bg-[rgba(245,240,220,0.85)] rounded-full backdrop-blur-[1px]"
                    style={{
                      width: `${f.size}px`,
                      height: `${f.size}px`,
                      top: `${f.top}px`,
                      left: `${f.left}px`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  />
                ))}
              </div>

              <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-16 h-24 pointer-events-none flex justify-center gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) steamItemsRef.current[i] = el;
                    }}
                    className="w-[2px] h-[25px]"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Moment09;
