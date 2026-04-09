"use client";

import React, { useEffect, useRef } from 'react';
import { useScroll } from '@/lib/context/ScrollContext';
import HeroBackground from '../hero/HeroBackground';
import HeroContent from '../hero/HeroContent';
import HeroCTA from '../hero/HeroCTA';
import HeroProofPoints from '../hero/HeroProofPoints';

const Moment01 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundGradRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const proofsRef = useRef<HTMLDivElement>(null);
  
  const { masterTl } = useScroll();

  useEffect(() => {
    if (!masterTl || !sectionRef.current) return;

    const label = `moment-01`;
    
    // Visibility toggle: Make active when we are in its range
    masterTl.to(sectionRef.current, { 
      opacity: 1, 
      pointerEvents: 'auto',
      duration: 0.1 
    }, label);

    // Background logic
    masterTl.to(backgroundGradRef.current, {
      y: "12%",
      force3D: true,
      ease: "none",
      duration: 8 // Occupies 80% of the slot
    }, `${label}+=0`);

    // Horizon glow
    masterTl.to(glowRef.current, {
      scaleY: 1.3,
      force3D: true,
      ease: "none",
      duration: 8
    }, `${label}+=0`);

    // UI Elements fade out
    masterTl.to([contentRef.current, ctaRef.current, proofsRef.current], {
      opacity: 0,
      y: -30,
      force3D: true,
      ease: "power2.inOut",
      duration: 3,
      stagger: 0.5
    }, `${label}+=5`);

    // Exit: fade out to next moment
    masterTl.to(sectionRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 2
    }, `${label}+=8`);

  }, [masterTl]);

  return (
    <section 
      ref={sectionRef}
      className="moment relative w-screen overflow-hidden" 
      id="moment-01"
      style={{ opacity: 0 }} // Start hidden
    >
      <HeroBackground 
        ref={sectionRef} 
        glowRef={glowRef} 
        backgroundGradRef={backgroundGradRef} 
      />
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <HeroContent ref={contentRef} />
        <HeroCTA ref={ctaRef} />
        <HeroProofPoints ref={proofsRef} />
      </div>
    </section>
  );
};

export default Moment01;
