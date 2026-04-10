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
      className="fixed top-0 left-0 w-full z-50 transition-none"
      style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem)' }}
    >
      <div className="flex justify-between items-center w-full max-w-[1400px] mx-auto">
        <div 
          className="text-[rgba(240,232,210,0.9)] tracking-[0.25em] uppercase text-xs md:text-sm font-light drop-shadow-md"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          The Arrival
        </div>
        <button 
          className="uppercase text-[10px] md:text-xs tracking-widest px-4 md:px-6 py-2 md:py-3 border border-[rgba(240,232,210,0.3)] text-[rgba(240,232,210,0.9)] hover:bg-[rgba(240,232,210,0.1)] transition-colors duration-500 backdrop-blur-sm drop-shadow-md"
          style={{ fontFamily: 'var(--font-sans)' }}
          onClick={() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
        >
          Reserve
        </button>
      </div>
    </header>
  );
};

export default GlobalNav;

