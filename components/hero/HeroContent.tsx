"use client";

import React, { forwardRef } from 'react';

const HeroContent = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div 
      ref={ref}
      className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full px-8 flex flex-col items-center justify-center gap-6"
    >
      <p 
        className="cinematic-text italic font-light text-center"
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
          color: 'rgba(240, 232, 210, 0.95)',
          letterSpacing: '0.15em',
          lineHeight: '1.4',
          maxWidth: '800px',
          opacity: 0,
        }}
      >
        You are no longer arriving.
        <br />
        You have already arrived.
      </p>
      <p
        className="cinematic-subtext text-center mt-4"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
          color: 'rgba(240, 232, 210, 0.8)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          maxWidth: '600px',
          opacity: 0,
        }}
      >
        An exclusive private island & culinary experience
      </p>
    </div>
  );
});

HeroContent.displayName = 'HeroContent';

export default HeroContent;
