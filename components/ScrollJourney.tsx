"use client";

import React, { useEffect, useRef } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

import FilmHomepage from './FilmHomepage';
import Moment02 from './moments/Moment02';
import Moment03 from './moments/Moment03';
import Moment04 from './moments/Moment04';
import Moment05 from './moments/Moment05';
import Moment06 from './moments/Moment06';
import Moment07 from './moments/Moment07';
import Moment08 from './moments/Moment08';
import Moment09 from './moments/Moment09';
import MomentGallery from './moments/MomentGallery';
import Moment10 from './moments/Moment10';
import Moment11 from './moments/Moment11';
import Preloader from './Preloader';
import GlobalNav from './GlobalNav';
import AtmosphereLayer from './Atmosphere/AtmosphereLayer';
import AudioToggle from './AudioToggle';
import WebGLContentLayer from './WebGL/WebGLContentLayer';

const ScrollJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The initial ScrollTrigger.refresh() runs in SmoothScroll.tsx after Lenis
    // initialises — Lenis must be in place before ScrollTrigger maps pin
    // positions. The previous setTimeout + 'load' listener here ran the same
    // refresh twice more, which is expensive on a page with 12+ pinned
    // sections (each refresh recomputes every pin). Resize stays — that's a
    // genuine reactive recompute, not redundant init noise.
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main role="main" className="scroll-journey relative">
      {/* Skip link — visually hidden until keyboard-focused. Jumps past the
          11-chapter scroll journey straight to the actionable reservation. */}
      <a
        href="#moment-11"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10001] focus:px-4 focus:py-2 focus:rounded focus:bg-black/85 focus:text-white focus:no-underline"
        style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}
      >
        Skip to reservation
      </a>

      <AtmosphereLayer />
      <Preloader />
      <GlobalNav />
      <AudioToggle />

      <WebGLContentLayer>
        <div ref={containerRef} className="scroll-container relative z-10">
          <div className="moments-wrapper relative w-full h-full">
            <FilmHomepage />
            <Moment02 index={1} />
            <Moment03 index={2} />
            <Moment04 index={3} />
            <Moment05 index={4} />
            <Moment06 index={5} />
            <Moment07 index={6} />
            <Moment08 index={7} />
            <Moment09 index={8} />
            <MomentGallery />
            <Moment10 index={9} />
            <Moment11 index={10} />
          </div>
        </div>
      </WebGLContentLayer>
    </main>
  );
};

export default ScrollJourney;
