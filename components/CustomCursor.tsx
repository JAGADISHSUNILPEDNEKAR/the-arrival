"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Disables default pointer 
    document.body.style.cursor = 'none';
    
    // Automatically center transform pivot to prevent offset drift
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    let rafId: number;
    const render = () => {
      // 1 / 6 = ~0.16 multiplier equates to about 6 frames of lag mathematically 
      cursorX += (mouseX - cursorX) * 0.16;
      cursorY += (mouseY - cursorY) * 0.16;

      gsap.set(cursor, {
        x: cursorX,
        y: cursorY,
        force3D: true, // Forces GPU acceleration via transform3d
      });

      rafId = requestAnimationFrame(render);
    };
    
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      document.body.style.cursor = 'auto'; // Reset on cleanup
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-[24px] h-[24px] rounded-full border border-white/50 bg-white/10 backdrop-blur-sm pointer-events-none z-[9999]"
      style={{
        willChange: 'transform' // Stays on continuously because the cursor never stops rendering
      }}
    />
  );
}
