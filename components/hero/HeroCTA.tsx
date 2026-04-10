"use client";

import React, { forwardRef } from 'react';

const HeroCTA = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div 
      ref={ref}
      className="relative z-20 flex flex-col items-center justify-center my-8"
      style={{
        animation: 'fadeInUp 2.5s ease-out 1.5s forwards',
        opacity: 0,
        transform: 'translateY(15px)',
      }}
    >
      <button 
        className="group relative px-6 md:px-10 py-3 md:py-4 overflow-hidden rounded-sm transition-all duration-700 ease-out hover:scale-105 active:scale-95"
        style={{
          background: 'rgba(20, 30, 40, 0.4)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(240, 232, 210, 0.3)',
          width: 'max-content'
        }}
        onClick={() => {
          // Future: Smooth scroll to reservation section
          const elem = document.getElementById('moment-11');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 w-full h-full bg-white opacity-0 transition-opacity duration-700 group-hover:opacity-[0.05]" />
        
        <span 
          className="relative z-10 block pointer-events-none"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
            color: 'rgba(240, 232, 210, 0.9)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          Request an Invitation
        </span>
      </button>
    </div>
  );
});

HeroCTA.displayName = 'HeroCTA';

export default HeroCTA;
