"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  color: string;
  hasGlow: boolean;
}

const Moment10 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);

  const textRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);

  const [starsData, setStarsData] = useState<Star[]>([]);
  const { isMobile } = useScroll();

  // Generate stars client-side — rAF defers setState out of effect body.
  useEffect(() => {
    const count = isMobile ? 25 : 55;
    const stars: Star[] = Array.from({ length: count }).map((_, i) => {
      const size = i < count * 0.7 ? 1 : i < count * 0.9 ? 2 : 3;
      const isBlueTint = Math.random() > 0.7;
      const color = isBlueTint
        ? 'rgba(220, 230, 255, 0.6)'
        : `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`;
      const hasGlow = size >= 2 && Math.random() > 0.5;
      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${size}px`,
        color,
        hasGlow,
      };
    });
    const rafId = requestAnimationFrame(() => setStarsData(stars));
    return () => cancelAnimationFrame(rafId);
  }, [isMobile]);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || !starsData.length) return;

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
    gsap.set(indexRef.current, { opacity: 0, y: 24 });
    if (splitTitle?.words) {
      gsap.set(splitTitle.words, {
        y: '110%',
        filter: 'blur(6px)',
        opacity: 0,
      });
    }
    gsap.set(silhouetteRef.current, { opacity: 0, y: 60, scale: 0.9 });

    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 0.7 });
      }
      gsap.set(silhouetteRef.current, { opacity: 1, y: 0, scale: 1 });
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

    // === Beat 1 (0.00 – 0.15) — Section enters; content drift; nebula slow ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    if (contentRef.current) {
      tl.fromTo(
        contentRef.current,
        { scale: 1.05, y: '5vh' },
        { scale: 1, y: 0, force3D: true, ease: 'none' },
        0
      );
    }
    if (nebulaRef.current) {
      tl.to(
        nebulaRef.current,
        { rotate: 45, opacity: 0.6, scale: 1.6, y: '-15vh', ease: 'none' },
        0
      );
    }

    // === Beat 2 (0.15 – 0.36) — Index + pull-quote reveal ===
    tl.to(
      indexRef.current,
      { opacity: 0.35, y: 0, duration: 0.08, ease: 'cinematic' },
      0.15
    );
    if (splitTitle?.words) {
      // Pull-quote: keep words at 0.7 max opacity (low-light meditative feel).
      tl.to(
        splitTitle.words,
        {
          y: '0%',
          filter: 'blur(0px)',
          opacity: 0.7,
          stagger: 0.02,
          duration: 0.10,
          ease: 'cinematic',
        },
        0.18
      );
    }

    // === HOLD 0.36 – 0.44 ===

    // === Beat 3 (0.44 – 0.62) — Stars celestial kinetic; silhouette reveal ===
    starRefs.current.forEach((star, i) => {
      if (!star) return;
      tl.to(
        star,
        {
          opacity: 0.9,
          scale: 1.8,
          x: i % 2 === 0 ? 80 : -80,
          y: i % 3 === 0 ? 60 : -60,
          ease: 'none',
        },
        0.44
      );
    });
    tl.to(
      silhouetteRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'cinematic',
        duration: 0.16,
      },
      0.50
    );

    // === HOLD 0.62 – 0.75 ===

    // === Beat 4 (0.75 – 0.88) — Camera tilts upward; silhouette drifts up ===
    tl.to(
      silhouetteRef.current,
      { y: '-15vh', scale: 1.2, x: '3vw', ease: 'none' },
      0.75
    );

    // === Beat 5 (0.88 – 1.00) — Exit ===
    tl.to(
      textRef.current,
      { opacity: 0, y: -150, scale: 1.2, force3D: true, ease: 'cinematic' },
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
      id="moment-10"
    >
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(6,10,18,0.65) 0%, rgba(8,12,24,0.60) 40%, rgba(6,8,16,0.65) 100%)',
        }}
      />

      <div ref={contentRef} className="absolute inset-0 w-full h-full">
        <div
          ref={nebulaRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[40%] origin-center pointer-events-none opacity-40"
          style={{
            transform: 'translate(-50%, -70%) rotate(25deg)',
          }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                'repeating-linear-gradient(92deg, transparent 0%, rgba(180,190,220,0.015) 1%, rgba(200,210,240,0.025) 2%, transparent 3%, transparent 6%)',
              filter: 'blur(30px)',
            }}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {starsData.map((star, i) => (
            <div
              key={star.id}
              ref={(el) => {
                starRefs.current[i] = el;
              }}
              className="absolute rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                boxShadow: star.hasGlow
                  ? '0 0 3px rgba(220, 230, 255, 0.4)'
                  : 'none',
              }}
            />
          ))}
        </div>

        <div
          ref={silhouetteRef}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[clamp(100px,18vw,240px)] h-[25%] z-20"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(15,35,20,0.85)',
              clipPath: 'ellipse(50% 40% at 50% 80%)',
              boxShadow: '0 0 40px 15px rgba(255,185,80,0.15)',
            }}
          >
            <div className="absolute top-[20%] left-[20%] w-[10%] h-[30%] bg-black/40 blur-[2px] rotate-[15deg] rounded-full" />
            <div className="absolute top-[15%] right-[25%] w-[8%] h-[35%] bg-black/40 blur-[2px] rotate-[-10deg] rounded-full" />
            <div className="absolute top-[35%] left-[45%] w-[12%] h-[25%] bg-black/40 blur-[2px] rotate-[5deg] rounded-full" />
          </div>

          <div
            className="absolute top-[65%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full z-30"
            style={{
              background: 'rgba(255,200,100,0.7)',
              boxShadow: '0 0 15px 5px rgba(255,180,70,0.3)',
            }}
          />
        </div>
      </div>

      {/* Editorial pull-quote — centered, the site's only centered text.
          A deliberate pause beat between dining intimacy and reservation. */}
      <div
        ref={textRef}
        className="absolute top-[36%] md:top-[38%] left-1/2 -translate-x-1/2 z-40 w-full max-w-[42em] px-6 pointer-events-none text-center"
      >
        <span
          ref={indexRef}
          className="block italic font-light mb-4 md:mb-5"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
            lineHeight: 1,
            color: 'rgba(220,225,235,0.35)',
          }}
        >
          IX.
        </span>
        <p
          ref={titleRef}
          className="italic font-light"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3.2vw, 3rem)',
            lineHeight: 1.25,
            letterSpacing: '0.005em',
            color: 'rgba(220,225,235,0.7)',
            textShadow: '0 4px 50px rgba(0,0,0,0.5)',
          }}
        >
          Some tables are remembered longer than others.
        </p>
      </div>
    </section>
  );
};

export default Moment10;
