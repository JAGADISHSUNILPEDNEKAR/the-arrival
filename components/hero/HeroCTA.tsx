"use client";

import React, { forwardRef } from 'react';

const HeroCTA = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div 
      ref={ref}
      className="relative z-20 flex flex-col items-center justify-center my-8"
    >
      <button 
        className="group relative px-6 md:px-10 py-3 md:py-4 overflow-hidden rounded-sm transition-all duration-700 ease-out hover:scale-105 active:scale-95 hover:border-[rgba(240,232,210,0.6)]"
        style={{
          background: 'rgba(20, 30, 40, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(240, 232, 210, 0.3)',
          width: 'max-content',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}
        onClick={() => {
          const elem = document.getElementById('moment-11');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        {/* Luxury Glow effect on hover */}
        <div className="absolute inset-0 w-full h-full bg-[rgba(240,232,210,0.08)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute -inset-x-20 inset-y-0 bg-gradient-to-r from-transparent via-[rgba(240,232,210,0.1)] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        <span 
          className="relative z-10 block pointer-events-none"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
            color: 'rgba(240, 232, 210, 0.9)',
            letterSpacing: '0.25em',
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
