"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const GlobalNav = () => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!navRef.current) return;

    gsap.set(navRef.current, { opacity: 0, pointerEvents: 'none' });

    const st = ScrollTrigger.create({
      start: '30% top',
      onEnter: () => {
        gsap.to(navRef.current, {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 1,
          ease: 'power2.out',
        });
      },
      onLeaveBack: () => {
        gsap.to(navRef.current, {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.8,
          ease: 'power2.in',
        });
      },
    });

    return () => st.kill();
  }, []);

  const handleReserve = () => {
    document.getElementById('moment-11')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50"
      style={{
        padding: 'clamp(1rem, 2vw, 1.5rem) clamp(1.5rem, 5vw, 4rem)',
      }}
    >
      <div className="flex justify-between items-center w-full max-w-[1400px] mx-auto">
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.625rem, 0.75vw, 0.8rem)',
            letterSpacing: '0.45em',
            color: 'rgba(245,240,232,0.6)',
          }}
        >
          The Arrival
        </span>
        <button
          onClick={handleReserve}
          data-cursor="cta"
          className="group italic font-light bg-transparent border-0 cursor-pointer p-0"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
            letterSpacing: '-0.01em',
            color: 'rgba(245,240,232,0.85)',
          }}
          aria-label="Reserve — scroll to the reservation"
        >
          <span className="relative inline-block">
            Reserve
            <span
              aria-hidden
              className="absolute left-0 right-0 -bottom-[0.1em] h-[1px] origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-[1200ms] ease-out"
              style={{ background: 'rgba(245,240,232,0.6)' }}
            />
          </span>
        </button>
      </div>
    </header>
  );
};

export default GlobalNav;
