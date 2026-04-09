"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const Preloader = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.display = 'none';
          }
        }
      });

      // 1. Fill the loading line over 1.2s
      tl.to(lineRef.current, {
        width: '100%',
        duration: 1.2,
        ease: 'power2.inOut'
      });

      // 2. Fade out the entire overlay over 2s
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut',
        delay: 0.2
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0d2137 0%, #1a4a6b 25%, #2d7a9a 55%, #7ab8cc 78%, #c8e0e8 92%, #e8f2f6 100%)'
      }}
    >
      <div className="relative w-64 h-px bg-white/10 overflow-hidden">
        <div 
          ref={lineRef}
          className="absolute top-0 left-0 h-full bg-white/60 w-0"
        />
      </div>
    </div>
  );
};

export default Preloader;
