"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Editorial cursor. Default = small outline ring with a 6-frame lerp lag.
 *
 * Three states, in priority order:
 *   1. CTA hover (scale 2.4, opacity 0.9) — wins over all others
 *   2. Active scroll (scale 0.6, opacity 0.3) — signals "navigating, not
 *      pointing" so the cursor recedes during fast vertical movement
 *   3. Idle (scale 1, opacity 1)
 *
 * mixBlendMode: difference keeps the ring legible across the day/night
 * palette arc (midday lagoon vs moonlit) without per-zone color tuning.
 *
 * Disabled entirely on coarse pointers (touch).
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

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
    let isScrolling = false;
    let lastScrollY = window.scrollY;
    let scrollIdleTimeout: number | null = null;

    const applyState = () => {
      if (hoveringCta) {
        gsap.to(cursor, {
          scale: 2.4,
          opacity: 0.9,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else if (isScrolling) {
        gsap.to(cursor, {
          scale: 0.6,
          opacity: 0.3,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        gsap.to(cursor, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const isCta = !!target?.closest?.('[data-cursor="cta"]');
      if (isCta !== hoveringCta) {
        hoveringCta = isCta;
        applyState();
      }
    };

    // Scroll-velocity awareness — Lenis drives scroll under us, so per-event
    // deltas are small (~rAF cadence). A 6px-per-event threshold catches
    // wheel/keyboard/touch but ignores cursor-jitter and inertia tails.
    const onScroll = () => {
      const now = window.scrollY;
      const delta = Math.abs(now - lastScrollY);
      lastScrollY = now;

      if (delta > 6 && !hoveringCta && !isScrolling) {
        isScrolling = true;
        applyState();
      }

      if (scrollIdleTimeout !== null) {
        window.clearTimeout(scrollIdleTimeout);
      }
      scrollIdleTimeout = window.setTimeout(() => {
        if (isScrolling) {
          isScrolling = false;
          applyState();
        }
      }, 400);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

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
      window.removeEventListener('scroll', onScroll);
      if (scrollIdleTimeout !== null) window.clearTimeout(scrollIdleTimeout);
      cancelAnimationFrame(rafId);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="fixed top-0 left-0 w-[20px] h-[20px] rounded-full border border-white/40 pointer-events-none z-[9999]"
      style={{ willChange: 'transform', mixBlendMode: 'difference' }}
    />
  );
}
