"use client";

import React, { forwardRef } from 'react';

const HeroContent = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div 
      ref={ref}
      className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full px-8 flex flex-col items-center justify-center gap-6"
    >
      <p 
        className="italic font-light text-center"
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
          color: 'rgba(240, 232, 210, 0.95)',
          letterSpacing: '0.15em',
          lineHeight: '1.4',
          maxWidth: '800px',
        }}
      >
        You are no longer arriving.
        <br />
        You have already arrived.
      </p>
      <p
        className="text-center mt-4"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 300,
          fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
          color: 'rgba(240, 232, 210, 0.8)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          maxWidth: '600px',
          animation: 'fadeInUp 2.5s ease-out 1s forwards',
          opacity: 0,
          transform: 'translateY(15px)',
        }}
      >
        An exclusive private island & culinary experience
      </p>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
});

HeroContent.displayName = 'HeroContent';

export default HeroContent;
