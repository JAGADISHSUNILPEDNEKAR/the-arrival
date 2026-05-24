"use client";

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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
import AudioToggle from './AudioToggle';
import WebGLContentLayer from './WebGL/WebGLContentLayer';

// AtmosphereLayer pulls in three.js (~131 KB gz) and its own GLSL shader.
// It's purely client-side decoration (no SSR value — the canvas only paints
// after WebGL initialises), so we defer the import. The Preloader veil at
// z-[10000] opacity 0.88 sits on top of frame zero and masks the brief
// moment before the shader paints. By the time the veil lifts (~3s into
// the entry ritual), the atmosphere is fully alive underneath.
const AtmosphereLayer = dynamic(() => import('./Atmosphere/AtmosphereLayer'), {
  ssr: false,
});

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
