"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

/**
 * The opening ritual. A fixed full-screen autoplay overlay that sits over
 * the persistent AtmosphereLayer at frame zero, runs a ~4.8s entry ceremony
 * (coord count-up → atmosphere reveal), then unmounts so FilmHomepage's
 * hero takes over.
 *
 * The "FROM THE MALDIVES" coord micro is locked to FilmHomepage's Act I
 * coord position (top-[26%] md:top-[28%] left-[8%] md:left-[10%]) and fades
 * out synchronously with the veil lift — at which point FilmHomepage's
 * coord, pre-positioned at the same place with the same alpha, becomes the
 * visible element. The handoff is invisible. Do not move either coord.
 *
 * Returning visits (sessionStorage gate) and reduced-motion users get a
 * compressed ~1s fade-out instead of the full ritual.
 */
const MALDIVES_LAT_DEG = 3;
const MALDIVES_LAT_MIN = 15;
const MALDIVES_LON_DEG = 73;
const MALDIVES_LON_MIN = 0;

const STORAGE_KEY = 'arrival.entry.seen';

const formatPair = (deg: number, min: number, suffix: 'N' | 'E') => {
  const d = String(Math.floor(deg)).padStart(2, '0');
  const m = String(Math.floor(min)).padStart(2, '0');
  return `${d}°${m}'${suffix}`;
};

const targetCoordString = `${formatPair(MALDIVES_LAT_DEG, MALDIVES_LAT_MIN, 'N')} · ${formatPair(MALDIVES_LON_DEG, MALDIVES_LON_MIN, 'E')}`;

const Preloader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const coordLabelRef = useRef<HTMLSpanElement>(null);
  const coordValueRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);
  const { stopScroll, startScroll } = useScroll();

  useEffect(() => {
    if (!containerRef.current) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isReturning =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(STORAGE_KEY) === '1';

    // Lock scroll during the ritual so the entry ceremony can't be scrubbed
    // past. No-op under reduced-motion (Lenis isn't initialised). Resume
    // happens at ritual completion AND on cleanup — both paths matter
    // because HMR / Fast Refresh can unmount mid-ritual.
    stopScroll();

    // Returning visitor or reduced-motion: skip the ritual.
    if (reducedMotion || isReturning) {
      if (coordValueRef.current) {
        coordValueRef.current.textContent = targetCoordString;
      }
      gsap.set(coordValueRef.current, { opacity: 0.55 });
      const exit = gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.9,
        ease: 'cinematic',
        delay: 0.3,
        onComplete: () => {
          sessionStorage.setItem(STORAGE_KEY, '1');
          startScroll();
          setMounted(false);
        },
      });
      return () => {
        exit.kill();
        startScroll();
      };
    }

    // Full ritual initial state
    gsap.set(coordValueRef.current, { opacity: 0, y: 6 });
    gsap.set(hintRef.current, { opacity: 0 });

    const counter = { lat: 0, latMin: 0, lon: 0, lonMin: 0 };
    const renderCoord = () => {
      if (!coordValueRef.current) return;
      const latStr = formatPair(counter.lat, counter.latMin, 'N');
      const lonStr = formatPair(counter.lon, counter.lonMin, 'E');
      coordValueRef.current.textContent = `${latStr} · ${lonStr}`;
    };
    renderCoord();

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, '1');
        startScroll();
        setMounted(false);
      },
    });

    // === Phase A (0.0 – 0.4s) — coord value fades in ===
    tl.to(coordValueRef.current, {
      opacity: 0.55,
      y: 0,
      duration: 0.4,
      ease: 'cinematic',
    });

    // === Phase B (0.4 – 1.6s) — latitude climbs ===
    tl.to(counter, {
      lat: MALDIVES_LAT_DEG,
      latMin: MALDIVES_LAT_MIN,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: renderCoord,
    });

    // === Phase B (1.6 – 2.6s) — longitude climbs ===
    tl.to(counter, {
      lon: MALDIVES_LON_DEG,
      lonMin: MALDIVES_LON_MIN,
      duration: 1.0,
      ease: 'power3.out',
      onUpdate: renderCoord,
    });

    // === Silence (2.6 – 3.0s) — coord settles, world about to reveal ===
    tl.to({}, { duration: 0.4 });

    // === Phase C (3.0 – 4.2s) — veil lifts; label fades in lockstep ===
    // The synchronized fade preserves the documented handoff: FilmHomepage's
    // pre-positioned coord (always at 0.6) takes over without perceptible
    // change because both are at the same place with the same style.
    tl.to(
      veilRef.current,
      { opacity: 0, duration: 1.2, ease: 'cinematic' },
      'reveal'
    );
    tl.to(
      coordLabelRef.current,
      { opacity: 0, duration: 1.2, ease: 'cinematic' },
      'reveal'
    );
    tl.to(
      hintRef.current,
      { opacity: 0.4, duration: 0.5, ease: 'cinematic' },
      'reveal+=0.5'
    );

    // === Phase D (4.2 – 4.8s) — lat/lon fades; container unmounts on complete ===
    tl.to(coordValueRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'cinematic',
    });

    return () => {
      tl.kill();
      startScroll();
    };
  }, [stopScroll, startScroll]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] pointer-events-none"
    >
      {/* Translucent veil — atmosphere shader breathes through */}
      <div
        ref={veilRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'linear-gradient(180deg, rgba(6,8,16,0.88) 0%, rgba(6,8,16,0.75) 55%, rgba(6,8,16,0.68) 100%)',
        }}
      />

      {/* Coord column — anchored to FilmHomepage's Act I coord position. */}
      <div className="absolute top-[26%] md:top-[28%] left-[8%] md:left-[10%] z-[2] flex flex-col gap-5 md:gap-6">
        <span
          ref={coordLabelRef}
          className="block uppercase"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.625rem, 0.75vw, 0.8rem)',
            letterSpacing: '0.45em',
            color: 'rgba(245,240,232,0.6)',
          }}
        >
          From the Maldives
        </span>
        {/* aria-hidden because the GSAP onUpdate writes new lat/lon strings
            ~60×/sec during the 2.2s count-up. Without hiding it, screen
            readers announce every intermediate value as the counter climbs
            from 00°00' to 03°15'N · 73°00'E — pure noise. The visual ritual
            is decorative; the page's narrative coord "From the Maldives" is
            already announced via the label above. */}
        <div
          ref={coordValueRef}
          aria-hidden
          className="font-light"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.7rem, 0.85vw, 0.9rem)',
            letterSpacing: '0.25em',
            color: 'rgba(245,240,232,0.55)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {targetCoordString}
        </div>
      </div>

      {/* Bottom-center scroll hint */}
      <div
        ref={hintRef}
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-3"
      >
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.625rem, 0.7vw, 0.75rem)',
            letterSpacing: '0.5em',
            color: 'rgba(245,240,232,0.4)',
          }}
        >
          Scroll
        </span>
        <span
          aria-hidden
          className="scroll-hint-chevron"
          style={{ color: 'rgba(245,240,232,1)', lineHeight: 0 }}
        >
          <svg
            width="14"
            height="22"
            viewBox="0 0 14 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 8 L7 14 L11 8" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default Preloader;
