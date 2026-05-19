"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';
import AssetSlot from '@/components/AssetSlot';

const Moment02 = ({}: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const waterShimmerRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
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
    gsap.set(islandRef.current, { opacity: 0, x: 60, scale: 0.9, y: 40 });
    gsap.set(overlayRef.current, { opacity: 0 });

    // Reduced motion: settle visible, no pin. Override the .moment CSS by
    // forcing opacity 1 + adding the .active class for visibility.
    if (reducedMotion) {
      sectionEl.classList.add('active');
      gsap.set(sectionEl, { opacity: 1, scale: 1 });
      gsap.set(indexRef.current, { opacity: 0.35, y: 0 });
      gsap.set(subRef.current, { opacity: 0.8, y: 0 });
      if (splitTitle?.words) {
        gsap.set(splitTitle.words, { y: '0%', filter: 'none', opacity: 1 });
      }
      gsap.set(islandRef.current, { opacity: 1, x: 0, scale: 1, y: 0 });
      gsap.set(overlayRef.current, { opacity: 0.8 });
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

    // === Beat 1 (0.00 – 0.15) — Section enters; background drifts slowly ===
    tl.fromTo(
      sectionEl,
      { opacity: 0, scale: 1.02 },
      { opacity: 1, scale: 1, ease: 'cinematic', duration: 0.5 },
      0.05
    );
    tl.to(
      backgroundRef.current,
      { y: '12vh', scale: 1.15, ease: 'none' },
      0
    );
    tl.to(
      waterShimmerRef.current,
      { backgroundPositionX: '300px', y: '5%', ease: 'none' },
      0
    );
    tl.to(
      overlayRef.current,
      { opacity: 0.8, duration: 1, ease: 'cinematic' },
      0.05
    );

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

    // === Beat 3 (0.42 – 0.60) — Sub + island enter together ===
    tl.to(
      subRef.current,
      { opacity: 0.8, y: 0, duration: 0.10, ease: 'cinematic' },
      0.42
    );
    tl.to(
      islandRef.current,
      {
        opacity: 1,
        x: 0,
        scale: 1,
        y: 0,
        force3D: true,
        duration: 0.18,
        ease: 'cinematic',
      },
      0.40
    );

    // === HOLD 0.60 – 0.72 ===

    // === Beat 4 (0.72 – 0.88) — Island drifts toward camera ===
    tl.to(
      islandRef.current,
      {
        scale: 1.5,
        x: '-5vw',
        y: '6vh',
        force3D: true,
        ease: 'none',
      },
      0.72
    );

    // === Beat 5 (0.88 – 1.00) — Exit ===
    tl.to(
      [textRef.current, islandRef.current],
      {
        opacity: 0,
        y: -100,
        scale: '+=0.1',
        force3D: true,
        ease: 'cinematic',
        stagger: 0.05,
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
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="moment relative w-full overflow-hidden"
      id="moment-02"
    >
      {/* Translucent dawn-sanctuary gradient — atmosphere shows through */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(14,32,56,0.55) 0%, rgba(28,77,112,0.50) 30%, rgba(58,138,170,0.45) 60%, rgba(137,192,208,0.40) 82%, rgba(212,234,240,0.35) 100%)',
        }}
      />

      {/* Warm overlay tint that breathes in */}
      <div
        ref={overlayRef}
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(210,160,80,0.12) 0%, transparent 50%)',
        }}
      />

      {/* Editorial column — left, matching the hero voice anchor */}
      <div
        ref={textRef}
        className="absolute top-[18%] md:top-[20%] left-[8%] md:left-[10%] right-[8%] md:right-[10%] z-10 max-w-[34em] pointer-events-none"
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
          I.
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
            textShadow: '0 4px 50px rgba(6,14,26,0.45)',
          }}
        >
          A sanctuary, woven into the shoreline.
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
          Far from the noise. Suspended above the turquoise sea.
        </p>
      </div>

      {/* Island silhouette — bottom-right; AssetSlot ready to swap for photo */}
      <div
        ref={islandRef}
        className="absolute bottom-[38%] right-[28%] z-[2]"
        style={{
          width: 'clamp(80px, 12vw, 160px)',
          height: 'clamp(30px, 5vw, 65px)',
          filter: 'drop-shadow(0 15px 25px rgba(15,35,55,0.4))',
        }}
      >
        <AssetSlot
          id="moment-02-island"
          alt="Private island silhouette at dawn"
          className="w-full h-full"
        >
          <div
            className="w-full h-full"
            style={{
              background: 'rgba(15, 35, 55, 0.75)',
              clipPath:
                'polygon(0% 100%, 8% 60%, 15% 75%, 22% 40%, 30% 65%, 38% 30%, 45% 55%, 52% 20%, 58% 50%, 65% 35%, 72% 60%, 80% 45%, 88% 65%, 95% 55%, 100% 100%)',
            }}
          />
        </AssetSlot>
      </div>

      {/* Water shimmer at the base */}
      <div
        ref={waterShimmerRef}
        className="absolute bottom-0 left-0 w-full h-[45%] z-[1] pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(92deg, transparent, transparent 60px, rgba(255,255,255,0.025) 61px, rgba(255,255,255,0.025) 62px)',
        }}
      />
    </section>
  );
};

export default Moment02;
