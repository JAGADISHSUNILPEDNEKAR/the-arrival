"use client";

import React, { useEffect, useState } from 'react';

const GlobalNav = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past 30% of the first viewport height
      if (window.scrollY > window.innerHeight * 0.3) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
