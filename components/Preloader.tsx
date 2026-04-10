"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const Preloader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: true,
        onLeave: () => {
             // Ensure it doesn't block interactions once "passed"
             if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none';
        },
        onEnterBack: () => {
             if (overlayRef.current) overlayRef.current.style.pointerEvents = 'auto';
        }
      }
    });

    // 1. Fill the loading line
    tl.to(lineRef.current, {
      width: '100%',
      ease: 'none'
    }, 0);

    // 2. Fade out text
    tl.to(textRef.current, {
        opacity: 0,
        y: -20,
        ease: 'none'
    }, 0.5);

    // 3. Fade out the entire overlay
    tl.to(overlayRef.current, {
      opacity: 0,
      scale: 1.1,
      ease: 'none',
    }, 0.6);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === containerRef.current).forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-screen h-screen z-[10000]">
      <div 
        ref={overlayRef}
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0d2137 0%, #1a4a6b 25%, #2d7a9a 55%, #7ab8cc 78%, #c8e0e8 92%, #e8f2f6 100%)'
        }}
      >
        <div ref={textRef} className="mb-8 text-white/40 uppercase tracking-[0.4em] text-[10px] font-light">
            Scroll to Enter
        </div>
        <div className="relative w-64 h-px bg-white/10 overflow-hidden">
          <div 
            ref={lineRef}
            className="absolute top-0 left-0 h-full bg-white/60 w-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;

