"use client";

import React, { forwardRef } from 'react';

interface HeroBackgroundProps {
  glowRef: React.RefObject<HTMLDivElement | null>;
  backgroundGradRef: React.RefObject<HTMLDivElement | null>;
}

const HeroBackground = forwardRef<HTMLDivElement, HeroBackgroundProps>(
  ({ glowRef, backgroundGradRef }, ref) => {
    return (
      <div 
        ref={ref}
        className="absolute inset-0 w-full h-full"
        style={{ animation: 'breathe 7s ease-in-out infinite' }}
      >
        {/* Layer 1: Indian Ocean Gradient */}
        <div 
          ref={backgroundGradRef}
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(180deg, #0d2137 0%, #1a4a6b 25%, #2d7a9a 55%, #7ab8cc 78%, #c8e0e8 92%, #e8f2f6 100%)'
          }}
        />

        {/* Layer 2: Horizon Glow */}
        <div 
          ref={glowRef}
          className="absolute inset-0 w-full h-full z-[1] origin-bottom"
          style={{
            background: 'radial-gradient(ellipse 120% 40% at 50% 100%, rgba(200,220,230,0.4) 0%, transparent 70%)'
          }}
        />

        {/* Layer 3: Shimmer Surface */}
        <div 
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-[2]"
          style={{
            background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 10px, transparent 10px, transparent 20px)',
            animation: 'shimmer 8s linear infinite'
          }}
        />
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes breathe {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shimmer {
            from { background-position-x: 0px; }
            to { background-position-x: 200px; }
          }
        ` }} />
      </div>
    );
  }
);

HeroBackground.displayName = 'HeroBackground';

export default HeroBackground;
