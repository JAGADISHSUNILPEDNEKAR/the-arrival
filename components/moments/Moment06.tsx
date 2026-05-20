"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';
import { buildKineticWordsFor, KineticWord } from '@/lib/kineticWord';

const Moment06 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<HTMLDivElement[]>([]);
  const roofRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);
  const palmLeftRef = useRef<HTMLDivElement>(null);
  const palmRightRef = useRef<HTMLDivElement>(null);
  const dappleRefs = useRef<HTMLDivElement[]>([]);

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

    const revealElements = [
      platformRef.current,
      ...postRefs.current,
      roofRef.current,
      lightsRef.current,
    ].filter(Boolean) as HTMLElement[];

    // Initial states
    gsap.set([indexRef.current, subRef.current], { opacity: 0, y: 24 });
    if (splitTitle?.words) {
      gsap.set(splitTitle.words, {
        y: '110%',
        filter: 'blur(6px)',
        opacity: 0,
      });
    }
    gsap.set(revealElements, { opacity: 0, y: 40 });
    gsap.set(glowRef.current, { opacity: 0, scale: 0.8 });

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.8, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      gsap.set(revealElements, { opacity: 1, y: 0 });
      gsap.set(glowRef.current, { opacity: 0.2, scale: 1.4 });
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

    // === Beat 1 (0.00 – 0.15) — Section enters; palms + dapples drift ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    tl.to(
      palmLeftRef.current,
      { x: '-15vw', y: '-10vh', rotate: -15, scale: 1.15, ease: 'none' },
      0
    );
    tl.to(
      palmRightRef.current,
      { x: '15vw', y: '-10vh', rotate: 15, scale: 1.15, ease: 'none' },
      0
    );
    tl.to(
      structureRef.current,
      { scale: 1.15, y: '-5vh', force3D: true, ease: 'none' },
      0
    );
    dappleRefs.current.forEach((dapple, i) => {
      if (!dapple) return;
      tl.to(
        dapple,
        {
          xPercent: i % 2 === 0 ? 25 : -25,
          yPercent: i % 3 === 0 ? 15 : -15,
          rotate: i % 2 === 0 ? 12 : -12,
          scale: 1.2,
          opacity: 0.15,
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
    // Kinetic breath on "lantern" — fires once after the word lands.
    tl.call(() => kineticTitle.forEach((kw) => kw.play()), [], 0.42);

    // === HOLD 0.32 – 0.42 ===

    // === Beat 3 (0.42 – 0.62) — Sub + pavilion stagger + glow bloom ===
    tl.to(
      subRef.current,
      { opacity: 0.8, y: 0, duration: 0.10, ease: 'cinematic' },
      0.42
    );
    tl.to(
      revealElements,
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        force3D: true,
        duration: 0.16,
        ease: 'cinematic',
      },
      0.44
    );
    tl.to(
      glowRef.current,
      {
        opacity: 0.2,
        scale: 1.4,
        force3D: true,
        duration: 0.20,
        ease: 'cinematic',
      },
      0.50
    );

    // === HOLD 0.62 – 0.74 ===

    // === Beat 4 (0.74 – 0.88) — Pavilion pulls toward camera; glow brightens ===
    tl.to(
      structureRef.current,
      { scale: 1.35, ease: 'none' },
      0.74
    );
    tl.to(
      glowRef.current,
      { opacity: 0.35, scale: 1.7, ease: 'none' },
      0.74
    );

    // === Beat 5 (0.88 – 1.00) — Exit ===
    tl.to(
      [structureRef.current, palmLeftRef.current, palmRightRef.current],
      {
        opacity: 0,
        y: -100,
        scale: '+=0.1',
        force3D: true,
        ease: 'cinematic',
        stagger: 0.04,
      },
      0.88
    );
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

  const dapples = [
    { top: '10%', left: '15%', size: '300px' },
    { top: '25%', left: '60%', size: '350px' },
    { top: '5%', left: '40%', size: '280px' },
    { top: '30%', left: '20%', size: '320px' },
    { top: '15%', left: '75%', size: '310px' },
    { top: '40%', left: '45%', size: '290px' },
  ];

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-06"
      style={{
        background:
          'linear-gradient(180deg, rgba(26,48,32,0.72) 0%, rgba(36,56,40,0.68) 35%, rgba(28,46,34,0.65) 65%, rgba(20,30,24,0.62) 100%)',
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {dapples.map((d, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dappleRefs.current[i] = el;
            }}
            className="absolute bg-[#dcc864] opacity-[0.07]"
            style={{
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              borderRadius: '50%',
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      {/* Editorial column — left, light text on dim green twilight */}
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
            color: 'rgba(245,240,232,0.35)',
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
            color: 'rgba(245,240,232,0.95)',
            textShadow: '0 4px 50px rgba(15,30,20,0.55)',
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
            color: 'rgba(245,240,232,0.8)',
          }}
        >
          Lit by lantern. Veiled by palm.
        </p>
      </div>

      <div
        ref={structureRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="relative w-full max-w-[800px] h-[400px]">
          <div
            className="absolute bottom-0 left-[-50%] w-[200%] h-[40%] bg-[#28647866] opacity-40 z-0"
            style={{ filter: 'blur(40px)' }}
          />

          <div
            ref={glowRef}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#ffc864] opacity-[0.12] z-0"
            style={{ filter: 'blur(15px)' }}
          />

          <div
            ref={platformRef}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[60vw] max-w-[800px] h-[2px] bg-[rgba(180,150,100,0.6)] z-20 shadow-[0_0_10px_rgba(180,150,100,0.3)]"
          />

          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) postRefs.current[i] = el;
              }}
              className="absolute bottom-[20%] w-[3px] h-[35%] bg-[rgba(140,110,70,0.7)] z-10"
              style={{
                left: `${15 + i * 23.33}%`,
                transform: 'translateX(-50%)',
              }}
            />
          ))}

          <div
            ref={roofRef}
            className="absolute bottom-[55%] left-1/2 -translate-x-1/2 w-[65vw] max-w-[850px] h-[100px] z-30"
            style={{
              background:
                'linear-gradient(180deg, rgba(100,75,45,0.8) 0%, rgba(140,105,65,0.6) 100%)',
              clipPath: 'polygon(5% 100%, 0% 0%, 100% 0%, 95% 100%)',
            }}
          />

          <div
            ref={lightsRef}
            className="absolute top-[35%] left-[15%] w-[70%] h-[60px] z-25 pointer-events-none"
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-full h-[1px] mb-[12px]"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(255,240,180,0.6) 13px, rgba(255,240,180,0.6) 15px, transparent 16px)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        ref={palmLeftRef}
        className="absolute left-0 bottom-[-10%] w-[12px] h-[120%] bg-[#1a2e22] z-40"
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          transform: 'rotate(2deg)',
        }}
      >
        <div
          className="absolute top-0 left-[-50px] w-[120px] h-[100px] bg-[#141e18]"
          style={{
            clipPath: 'polygon(50% 100%, 0% 0%, 15% 0%, 50% 80%, 85% 0%, 100% 0%)',
          }}
        />
      </div>

      <div
        ref={palmRightRef}
        className="absolute right-0 bottom-[-10%] w-[12px] h-[120%] bg-[#1a2e22] z-40"
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          transform: 'rotate(-2deg)',
        }}
      >
        <div
          className="absolute top-0 right-[-50px] w-[120px] h-[100px] bg-[#141e18]"
          style={{
            clipPath: 'polygon(50% 100%, 0% 0%, 15% 0%, 50% 80%, 85% 0%, 100% 0%)',
          }}
        />
      </div>
    </section>
  );
};

export default Moment06;
