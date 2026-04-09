"use client";

import React, { forwardRef } from 'react';

const HeroCTA = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div 
      ref={ref}
      className="absolute top-[60%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center"
      style={{
        animation: 'fadeInUp 2.5s ease-out 1.5s forwards',
        opacity: 0,
        transform: 'translateY(15px)',
      }}
    >
      <button 
        className="group relative px-10 py-4 overflow-hidden rounded-sm transition-all duration-700 ease-out hover:scale-105 active:scale-95"
        style={{
          background: 'rgba(20, 30, 40, 0.4)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(240, 232, 210, 0.3)',
        }}
        onClick={() => {
          // Future: Smooth scroll to reservation section or open modal
          const elem = document.getElementById('reservation-section');
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
            fontSize: '0.85rem',
            color: 'rgba(240, 232, 210, 0.9)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
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
