"use client";

import React, { useEffect, useRef } from 'react';
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
  const { setMasterTl } = useScroll();

  useEffect(() => {
    // Refresh ScrollTrigger to ensure all dimensions are correct
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      console.log('ScrollTrigger refreshed from ScrollJourney');
    }, 1000);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main className="scroll-journey relative">
      <Preloader />
      <GlobalNav />
      
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
