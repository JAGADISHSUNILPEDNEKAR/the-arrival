"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const GlobalNav = () => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!navRef.current) return;

    // Initially hide the nav
    gsap.set(navRef.current, { opacity: 0, pointerEvents: 'none' });

    const st = ScrollTrigger.create({
      start: "30% top", // Show after 30% of first viewport
      onEnter: () => {
        gsap.to(navRef.current, { 
          opacity: 1, 
          pointerEvents: 'auto', 
          duration: 1, 
          ease: "power2.out" 
        });
      },
      onLeaveBack: () => {
        gsap.to(navRef.current, { 
          opacity: 0, 
          pointerEvents: 'none', 
          duration: 0.8, 
          ease: "power2.in" 
        });
      }
    });

    return () => st.kill();
  }, []);

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out border-b border-transparent"
      style={{ 
        padding: 'clamp(1rem, 2vw, 1.5rem) clamp(1.5rem, 5vw, 4rem)',
        backgroundColor: 'rgba(6, 14, 26, 0.05)',
        backdropFilter: 'blur(0px)'
      }}
    >
      <div className="flex justify-between items-center w-full max-w-[1400px] mx-auto">
        <div 
          className="text-[rgba(240,232,210,0.9)] tracking-[0.3em] uppercase text-[10px] md:text-xs font-light"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          The Arrival
        </div>
        <button 
          className="uppercase text-[9px] md:text-[10px] tracking-[0.25em] px-5 md:px-7 py-2 md:py-2.5 border border-[rgba(240,232,210,0.25)] text-[rgba(240,232,210,0.85)] hover:bg-[rgba(240,232,210,0.1)] hover:text-white transition-all duration-700 backdrop-blur-sm rounded-sm"
          style={{ fontFamily: 'var(--font-sans)' }}
          onClick={() => {
            const elem = document.getElementById('moment-11');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Reserve
        </button>
      </div>
    </header>
  );
};

export default GlobalNav;

