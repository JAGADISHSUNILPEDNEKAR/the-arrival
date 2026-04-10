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

import { ScrollProvider, useScroll } from '@/lib/context/ScrollContext';

const ScrollJourneyContent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { setMasterTl } = useScroll();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      lerp: 0.1,
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        fastScrollEnd: true,
        preventOverlaps: true,
      }
    });

    // Create labels for each moment to allow precise positioning
    // Each moment gets 10 units of "time" for clarity
    for (let i = 1; i <= 11; i++) {
        masterTl.addLabel(`moment-${i.toString().padStart(2, '0')}`, (i - 1) * 10);
    }

    setMasterTl(masterTl);
    
    // Refresh ScrollTrigger to ensure all dimensions are correct
    // We wait a bit longer to ensure all child components have registered their tweens
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      console.log('ScrollTrigger refreshed');
    }, 500);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
      lenis.destroy();
      gsap.ticker.remove(raf);
      masterTl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [setMasterTl]);

  return (
    <main className="scroll-journey relative">
      <Preloader />
      <GlobalNav />
      <div ref={scrollerRef} className="virtual-scroller" />
      
      <div ref={containerRef} className="scroll-container">
        <div className="moments-wrapper relative w-full h-full">
          <Moment01 index={0} />
          <Moment02 index={1} />
          <Moment03 index={2} />
          <Moment04 index={3} />
          <Moment05 index={4} />
          <Moment06 index={5} />
          <Moment07 index={6} />
          <Moment08 index={7} />
          <Moment09 index={8} />
          <Moment10 index={9} />
          <Moment11 index={10} />
        </div>
      </div>
    </main>
  );
};

const ScrollJourney = () => (
  <ScrollProvider>
    <ScrollJourneyContent />
  </ScrollProvider>
);

export default ScrollJourney;
