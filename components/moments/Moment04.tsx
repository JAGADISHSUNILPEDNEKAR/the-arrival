"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

interface Petal {
  left: string;
  bottom: string;
  rotate: number;
}

const Moment04 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const planksContainerRef = useRef<HTMLDivElement>(null);
  const planksRef = useRef<HTMLDivElement>(null);
  const feetRef = useRef<HTMLDivElement>(null);
  const feetLeftRef = useRef<HTMLDivElement>(null);
  const feetRightRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<HTMLDivElement[]>([]);

  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const [petals, setPetals] = useState<Petal[]>([]);
  const { isMobile } = useScroll();

  // Generate petals client-side — rAF defers setState out of the effect body.
  useEffect(() => {
    const count = isMobile ? 3 : 6;
    const data = [...Array(count)].map((_, i) => ({
      left: `${15 + i * 12 + Math.random() * 5}%`,
      bottom: `${10 + i * 4 + Math.random() * 10}%`,
      rotate: Math.random() * 30 - 15,
    }));
    const rafId = requestAnimationFrame(() => setPetals(data));
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
    gsap.set(planksContainerRef.current, { opacity: 0, y: 80, scale: 0.95 });
    gsap.set(feetRef.current, { opacity: 0, y: 30 });

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.85, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      gsap.set(planksContainerRef.current, { opacity: 1, y: 0, scale: 1 });
      gsap.set(feetRef.current, { opacity: 1, y: 0 });
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

    // === Beat 1 (0.00 – 0.15) — Section enters; slow plank parallax ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    // Plank perspective tilts gradually across the entire scrub
    tl.to(planksRef.current, { rotateX: '45deg', force3D: true, ease: 'none' }, 0);

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

    // === Beat 3 (0.42 – 0.60) — Sub + planks + feet reveal ===
    tl.to(
      subRef.current,
      { opacity: 0.85, y: 0, duration: 0.10, ease: 'cinematic' },
      0.42
    );
    tl.to(
      planksContainerRef.current,
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
    tl.to(
      feetRef.current,
      { opacity: 1, y: 0, duration: 0.12, ease: 'cinematic' },
      0.50
    );

    // Petals drift continuously across the scrub
    petalsRef.current.forEach((petal, i) => {
      if (!petal) return;
      tl.to(
        petal,
        {
          y: -200 - i * 30,
          x: i % 2 === 0 ? 60 : -60,
          rotation: i % 2 === 0 ? 180 : -180,
          opacity: 0,
          scale: 1.8,
          ease: 'none',
        },
        0.20
      );
    });

    // === HOLD 0.60 – 0.72 ===

    // === Beat 4 (0.72 – 0.88) — Camera moves along the jetty ===
    tl.to(
      planksContainerRef.current,
      {
        y: '-20vh',
        scale: 1.1,
        force3D: true,
        ease: 'none',
      },
      0.72
    );
    tl.to(
      figureRef.current,
      {
        scale: 2.8,
        y: '-80px',
        opacity: 0.1,
        force3D: true,
        ease: 'none',
      },
      0.72
    );
    tl.to(
      feetLeftRef.current,
      { scale: 1.2, opacity: 0.5, y: -20, ease: 'none' },
      0.74
    );
    tl.to(
      feetRightRef.current,
      { scale: 1.2, opacity: 0.5, y: -20, ease: 'none' },
      0.78
    );

    // === Beat 5 (0.88 – 1.00) — Exit ===
    tl.to(
      textRef.current,
      {
        opacity: 0,
        y: -120,
        scale: 1.1,
        force3D: true,
        ease: 'cinematic',
      },
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
  }, [petals, isMobile]);

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-04"
      style={{
        background:
          'linear-gradient(180deg, rgba(90,173,190,0.50) 0%, rgba(125,196,207,0.45) 30%, rgba(168,216,224,0.40) 55%, rgba(208,236,240,0.35) 80%, rgba(232,246,248,0.30) 100%)',
      }}
    >
      {/* Editorial column — left, dark text against bright translucent lagoon */}
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
            color: 'rgba(15,50,70,0.35)',
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
            color: 'rgba(15,50,70,0.95)',
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
            color: 'rgba(15,50,70,0.85)',
          }}
        >
          Cross by barefoot. The tides keep time.
        </p>
      </div>

      {/* Jetty composition — planks, figure, petals, feet */}
      <div
        ref={planksContainerRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55vw] max-w-[700px] h-[70%] z-10"
        style={{ perspective: '800px' }}
      >
        <div
          ref={planksRef}
          className="relative w-full h-full origin-bottom"
          style={{ transform: 'rotateX(25deg)' }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                rgba(160,110,60,0.9) 0px,
                rgba(180,130,75,0.85) 18px,
                rgba(40,160,180,0.8) 18px,
                rgba(40,160,180,0.8) 21px,
                rgba(160,110,60,0.9) 21px
              )`,
            }}
          />

          <div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                92deg,
                transparent 0px,
                rgba(0,0,0,0.04) 1px,
                transparent 2px,
                transparent 8px
              )`,
            }}
          />

          <div
            ref={figureRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20px] z-[4]"
            style={{
              width: '8px',
              height: '20px',
              borderRadius: '4px 4px 0 0',
              background: 'rgba(240,235,220,0.7)',
            }}
          />

          {petals.map((petal, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) petalsRef.current[i] = el;
              }}
              className="absolute"
              style={{
                width: '8px',
                height: '14px',
                borderRadius: '60% 40% 60% 40%',
                background: 'rgba(255, 248, 235, 0.85)',
                left: petal.left,
                bottom: petal.bottom,
                transform: `rotate(${petal.rotate}deg)`,
              }}
            />
          ))}

          <div ref={feetRef} className="absolute inset-0 z-[5] pointer-events-none">
            <div
              ref={feetLeftRef}
              className="absolute left-[38%] bottom-[15%]"
              style={{
                width: '28px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(210, 170, 130, 0.7)',
              }}
            />
            <div
              ref={feetRightRef}
              className="absolute left-[58%] bottom-[22%]"
              style={{
                width: '28px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(210, 170, 130, 0.7)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Moment04;
