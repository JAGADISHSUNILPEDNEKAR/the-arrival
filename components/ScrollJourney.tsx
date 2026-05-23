"use client";

import React, { useEffect, useRef } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

import FilmHomepage from './FilmHomepage';
import ChapterShore from './chapters/ChapterShore';
import ChapterPath from './chapters/ChapterPath';
import ChapterPavilion from './chapters/ChapterPavilion';
import ChapterTable from './chapters/ChapterTable';
import ChapterEvening from './chapters/ChapterEvening';
import ChapterInvitation from './chapters/ChapterInvitation';
import Preloader from './Preloader';
import GlobalNav from './GlobalNav';
import AtmosphereLayer from './Atmosphere/AtmosphereLayer';
import AudioToggle from './AudioToggle';
import WebGLContentLayer from './WebGL/WebGLContentLayer';

const ScrollJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The initial ScrollTrigger.refresh() runs in SmoothScroll.tsx after
    // Lenis initialises. Resize stays — that's a genuine reactive recompute.
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main role="main" className="scroll-journey relative">
      <a
        href="#chapter-07-invitation"
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
            <ChapterShore index={1} />
            <ChapterPath index={2} />
            <ChapterPavilion index={3} />
            <ChapterTable index={4} />
            <ChapterEvening index={5} />
            <ChapterInvitation index={6} />
          </div>
        </div>
      </WebGLContentLayer>
    </main>
  );
};

export default ScrollJourney;
