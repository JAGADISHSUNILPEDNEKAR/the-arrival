"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

interface Bougainvillea {
  size: number;
  top: number;
  right: number;
  rotate: number;
}

const Moment05 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sunSideRef = useRef<HTMLDivElement>(null);
  const shadeSideRef = useRef<HTMLDivElement>(null);
  const boundaryRef = useRef<HTMLDivElement>(null);
  const dappleRefs = useRef<HTMLDivElement[]>([]);
  const petalsRef = useRef<HTMLDivElement[]>([]);

  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const [bougainvilleaData, setBougainvilleaData] = useState<Bougainvillea[]>([]);
  const { isMobile } = useScroll();

  useEffect(() => {
    const count = isMobile ? 6 : 12;
    const data: Bougainvillea[] = [...Array(count)].map(() => ({
      size: 6 + Math.random() * 8,
      top: 15 + Math.random() * 20,
      right: 10 + Math.random() * 15,
      rotate: Math.random() * 360,
    }));
    const rafId = requestAnimationFrame(() => setBougainvilleaData(data));
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

    // === Beat 1 (0.00 – 0.15) — Section enters; dapple drift begins ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    // Dappled lights drift continuously across the whole scrub
    dappleRefs.current.forEach((dapple, i) => {
      if (!dapple) return;
      tl.to(
        dapple,
        {
          x: i % 2 === 0 ? 50 : -50,
          y: i % 3 === 0 ? 40 : -40,
          opacity: 0.4,
          scale: 1.5,
          rotate: i % 2 === 0 ? 25 : -25,
          force3D: true,
          ease: 'none',
        },
        0
      );
    });
    // Bougainvillea petals sway continuously
    petalsRef.current.forEach((petal, i) => {
      if (!petal) return;
      tl.to(
        petal,
        {
          rotation: i % 2 === 0 ? 240 : -240,
          y: -150 - i * 30,
          x: i % 2 === 0 ? 40 : -40,
          opacity: 0.1,
          scale: 1.8,
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

    // === Beat 3 (0.42 – 0.62) — The Great Split (shade widens, sun retreats) + sub ===
    tl.to(
      subRef.current,
      { opacity: 0.8, y: 0, duration: 0.10, ease: 'cinematic' },
      0.42
    );
    tl.to(
      shadeSideRef.current,
      { width: '70%', force3D: true, duration: 0.20, ease: 'cinematic' },
      0.44
    );
    tl.to(
      sunSideRef.current,
      { width: '35%', force3D: true, duration: 0.20, ease: 'cinematic' },
      0.44
    );
    tl.to(
      boundaryRef.current,
      { left: '30%', force3D: true, duration: 0.20, ease: 'cinematic' },
      0.44
    );

    // === HOLD 0.62 – 0.74 ===

    // === Beat 4 (0.74 – 0.88) — Palm shadows drift upward ===
    tl.to(
      boundaryRef.current,
      { y: '-15vh', scaleY: 1.2, ease: 'none' },
      0.74
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
      splitTitle?.revert();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === sectionEl)
        .forEach((st) => st.kill());
    };
  }, [bougainvilleaData, isMobile]);

  const palmShadows = [
    { width: 12, height: 100, top: 0, left: 0, opacity: 0.8 },
    { width: 25, height: 80, top: 10, left: 10, opacity: 0.9, clip: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' },
    { width: 5, height: 95, top: 0, left: 24, opacity: 0.7 },
    { width: 18, height: 75, top: 25, left: 32, opacity: 0.85, clip: 'polygon(5% 0, 95% 0, 100% 100%, 0% 100%)' },
    { width: 22, height: 100, top: 0, left: 45, opacity: 0.9 },
    { width: 3, height: 85, top: 5, left: 62, opacity: 0.65 },
    { width: 14, height: 90, top: 0, left: 70, opacity: 0.8, clip: 'polygon(0 0, 100% 15%, 100% 100%, 0 85%)' },
    { width: 10, height: 100, top: 0, left: 88, opacity: 0.9 },
  ];

  const dappledLights = [
    { top: '15%', left: '25%', w: 40, h: 60 },
    { top: '40%', left: '60%', w: 30, h: 50 },
    { top: '25%', left: '75%', w: 55, h: 35 },
    { top: '60%', left: '35%', w: 25, h: 80 },
    { top: '10%', left: '45%', w: 45, h: 45 },
    { top: '55%', left: '80%', w: 20, h: 30 },
    { top: '35%', left: '15%', w: 60, h: 40 },
    { top: '75%', left: '55%', w: 35, h: 55 },
  ];

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-05"
    >
      <div
        ref={sunSideRef}
        className="absolute top-0 left-0 h-full w-[52%] z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(232,212,138,0.55) 0%, rgba(240,224,160,0.50) 40%, rgba(245,232,176,0.45) 70%, rgba(224,200,112,0.40) 100%)',
        }}
      />

      <div
        ref={shadeSideRef}
        className="absolute top-0 right-0 h-full w-[50%] z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(26,48,32,0.70) 0%, rgba(42,74,48,0.65) 30%, rgba(30,56,40,0.60) 60%, rgba(22,42,30,0.55) 100%)',
        }}
      >
        {dappledLights.map((light, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dappleRefs.current[i] = el;
            }}
            className="absolute bg-[#dcc878] opacity-[0.12]"
            style={{
              top: light.top,
              left: light.left,
              width: `${light.w}px`,
              height: `${light.h}px`,
              borderRadius: '50%',
              filter: 'blur(8px)',
            }}
          />
        ))}

        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          {bougainvilleaData.map((petal, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) petalsRef.current[i] = el;
              }}
              className="absolute bg-[#c8345a]"
              style={{
                top: `${petal.top}%`,
                right: `${petal.right}%`,
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                transform: `rotate(${petal.rotate}deg)`,
                clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)',
              }}
            />
          ))}
        </div>
      </div>

      <div
        ref={boundaryRef}
        className="absolute top-0 left-[48%] w-[8%] h-full z-[3] overflow-visible pointer-events-none"
      >
        {palmShadows.map((shadow, i) => (
          <div
            key={i}
            className="absolute bg-[#0f1e0f]"
            style={{
              width: `${shadow.width}px`,
              height: `${shadow.height}%`,
              top: `${shadow.top}%`,
              left: `${shadow.left}%`,
              opacity: shadow.opacity,
              clipPath: shadow.clip || 'none',
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Editorial column — right side, on the shade for legibility */}
      <div
        ref={textRef}
        className="absolute top-[16%] md:top-[18%] right-[8%] md:right-[10%] left-[8%] md:left-[40%] z-20 max-w-[34em] pointer-events-none text-right"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-3 md:mb-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
            lineHeight: 1,
            color: 'rgba(245,240,232,0.35)',
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
            textShadow: '0 4px 50px rgba(15,30,20,0.55)',
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
          }}
        >
          The first lesson of the island.
        </p>
      </div>
    </section>
  );
};

export default Moment05;
