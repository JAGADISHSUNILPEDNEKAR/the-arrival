"use client";

import React, { forwardRef } from 'react';

const HeroProofPoints = forwardRef<HTMLDivElement, {}>((props, ref) => {
  const proofs = [
    "OPENING 2026",
    "PRIVATE ISLAND ACCESS",
    "MAX 12 GUESTS"
  ];

  return (
    <div 
      ref={ref}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-row items-center justify-center gap-6 md:gap-12 w-full px-4"
      style={{
        animation: 'fadeInUp 2.5s ease-out 2s forwards',
        opacity: 0,
        transform: 'translateY(15px)',
      }}
    >
      {proofs.map((proof, index) => (
        <React.Fragment key={index}>
          <span 
            className="text-center whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.6rem, 0.9vw, 0.75rem)',
              color: 'rgba(240, 232, 210, 0.6)',
              letterSpacing: '0.25em',
            }}
          >
            {proof}
          </span>
          {index < proofs.length - 1 && (
            <span 
              className="w-[3px] h-[3px] rounded-full hidden md:block" 
              style={{ background: 'rgba(240, 232, 210, 0.3)' }}
            />
          )}
        </React.Fragment>
      ))}
      
      {/* Scroll Indicator below the proof points */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-[1px] h-[40px] bg-[rgba(240,232,210,0.2)] relative overflow-hidden">
          <div className="scroll-dot" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scroll-dot {
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 3px;
          background: rgba(240,232,210,0.8);
          border-radius: 50%;
          animation: scrollMove 2s cubic-bezier(0.76, 0, 0.24, 1) infinite;
        }
        @keyframes scrollMove {
          0% { top: -4px; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 40px; opacity: 0; }
        }
      ` }} />
    </div>
  );
});

HeroProofPoints.displayName = 'HeroProofPoints';

export default HeroProofPoints;
