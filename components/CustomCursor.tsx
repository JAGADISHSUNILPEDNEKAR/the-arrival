"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Editorial cursor. Default = small outline ring with a 6-frame lerp lag.
 * Scales up and brightens when hovering elements with `data-cursor="cta"`
 * (Begin, Reserve, etc.). Disabled entirely on coarse pointers (touch).
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // No custom cursor on touch / coarse pointer devices.
    const finePointer =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) {
      cursor.style.display = 'none';
      return;
    }

    document.body.style.cursor = 'none';
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 1, opacity: 1 });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let hoveringCta = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Delegated CTA detection — any descendant of [data-cursor="cta"] activates.
    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const isCta = !!target?.closest?.('[data-cursor="cta"]');
      if (isCta && !hoveringCta) {
        hoveringCta = true;
        gsap.to(cursor, {
          scale: 2.4,
          opacity: 0.9,
          duration: 0.45,
          ease: 'power2.out',
        });
      } else if (!isCta && hoveringCta) {
        hoveringCta = false;
        gsap.to(cursor, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });

    let rafId: number;
    const render = () => {
      cursorX += (mouseX - cursorX) * 0.16;
      cursorY += (mouseY - cursorY) * 0.16;
      gsap.set(cursor, { x: cursorX, y: cursorY, force3D: true });
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerover', onPointerOver);
      cancelAnimationFrame(rafId);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="fixed top-0 left-0 w-[20px] h-[20px] rounded-full border border-white/40 pointer-events-none z-[9999]"
      style={{ willChange: 'transform' }}
    />
  );
}
