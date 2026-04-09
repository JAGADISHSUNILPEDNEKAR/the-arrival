"use client";

import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

import Moment01 from './moments/Moment01';
import Moment02 from './moments/Moment02';
import Moment03 from './moments/Moment03';
import Moment04 from './moments/Moment04';
import Moment05 from './moments/Moment05';
import Moment06 from './moments/Moment06';
import Moment07 from './moments/Moment07';
import Moment08 from './moments/Moment08';
import Moment09 from './moments/Moment09';
import Moment10 from './moments/Moment10';
import Moment11 from './moments/Moment11';
import Preloader from './Preloader';
import GlobalNav from './GlobalNav';

const ScrollJourney = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 2.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Sync Lenis to GSAP ticker
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Normalize scroll for mobile browser chrome issues
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Register ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Cleanup
    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  return (
    <main className="scroll-journey">
      <Preloader />
      <GlobalNav />
      <Moment01 />
      <Moment02 />
      <Moment03 />
      <Moment04 />
      <Moment05 />
      <Moment06 />
      <Moment07 />
      <Moment08 />
      <Moment09 />
      <Moment10 />
      <Moment11 />
    </main>
  );
};

export default ScrollJourney;
