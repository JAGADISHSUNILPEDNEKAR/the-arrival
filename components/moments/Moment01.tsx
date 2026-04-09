"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/gsap";

const Moment01 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundWrapperRef = useRef<HTMLDivElement>(null);
  const backgroundGradRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !backgroundGradRef.current || !textRef.current || !glowRef.current || !indicatorRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2.5,
        },
        onStart: () => {
          gsap.set([backgroundGradRef.current, glowRef.current, textRef.current], { willChange: "transform, opacity" });
        },
        onComplete: () => {
          gsap.set([backgroundGradRef.current, glowRef.current, textRef.current], { clearProps: "willChange" });
        }
      });

      // Background translates Y by +12% (bow dipping effect)
      tl.to(backgroundGradRef.current, {
        y: "12%",
        force3D: true,
        ease: "none",
        duration: 1
      }, 0);

      // Horizon glow scales from scaleY(1) to scaleY(1.3)
      tl.to(glowRef.current, {
        scaleY: 1.3,
        force3D: true,
        ease: "none",
        duration: 1
      }, 0);

      // Text fades from opacity 1 -> 0 over the first 30% of the scroll range
      tl.to(textRef.current, {
        opacity: 0,
        force3D: true,
        ease: "none",
        duration: 0.3
      }, 0);

      // Scroll Indicator fades out early
      tl.to(indicatorRef.current, {
        opacity: 0,
        duration: 0.1,
        ease: "none"
      }, 0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="moment relative min-h-[100svh] w-screen overflow-hidden" 
      id="moment-01"
    >
      {/* Background Wrapper with Breathe animation */}
      <div 
        ref={backgroundWrapperRef}
        className="absolute inset-0 w-full h-full"
        style={{ animation: 'breathe 7s ease-in-out infinite' }}
      >
        {/* Layer 1: Indian Ocean Gradient */}
        <div 
          ref={backgroundGradRef}
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(180deg, #0d2137 0%, #1a4a6b 25%, #2d7a9a 55%, #7ab8cc 78%, #c8e0e8 92%, #e8f2f6 100%)'
          }}
        />

        {/* Layer 2: Horizon Glow */}
        <div 
          ref={glowRef}
          className="absolute inset-0 w-full h-full z-[1] origin-bottom"
          style={{
            background: 'radial-gradient(ellipse 120% 40% at 50% 100%, rgba(200,220,230,0.4) 0%, transparent 70%)'
          }}
        />

        {/* Layer 3: Shimmer Surface */}
        <div 
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-[2]"
          style={{
            background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 10px, transparent 10px, transparent 20px)',
            animation: 'shimmer 8s linear infinite'
          }}
        />
      </div>

      {/* Centered Text */}
      <div 
        ref={textRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full px-8 flex flex-col items-center justify-center gap-8"
        style={{ opacity: 1 }}
      >
        <p 
          className="italic font-light text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 'clamp(1.1rem, 2.8vw, 1.9rem)',
            color: 'rgba(240, 232, 210, 0.92)',
            letterSpacing: '0.18em',
            lineHeight: '1.8',
            maxWidth: '600px',
          }}
        >
          You are no longer arriving. You have already arrived.
        </p>
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: 'clamp(0.7rem, 1vw, 0.85rem)',
            color: 'rgba(240, 232, 210, 0.7)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            maxWidth: '500px',
            animation: 'fadeInUp 2.5s ease-out 1s forwards',
            opacity: 0,
            transform: 'translateY(10px)',
          }}
        >
          An exclusive private island & culinary experience
        </p>
      </div>

      {/* Scroll Indicator */}
      <div 
        ref={indicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <div className="w-[1px] h-[40px] bg-[rgba(240,232,210,0.4)] relative overflow-hidden">
          <div className="scroll-dot" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes breathe {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          from { background-position-x: 0px; }
          to { background-position-x: 200px; }
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .scroll-dot {
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 3px;
          background: rgba(240,232,210,0.8);
          border-radius: 50%;
          animation: scrollMove 2s cubic-bezier(0.76, 0, 0.24, 1) infinite;
        }
        @keyframes scrollMove {
          0% { top: -4px; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 40px; opacity: 0; }
        }
      ` }} />
    </section>
  );
};

export default Moment01;
