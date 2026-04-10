"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

interface ScrollContextType {
  masterTl: gsap.core.Timeline | null;
  setMasterTl: (tl: gsap.core.Timeline) => void;
  isMobile: boolean;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [masterTl, setMasterTl] = useState<gsap.core.Timeline | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const value = React.useMemo(() => ({ 
    masterTl, 
    setMasterTl,
    isMobile 
  }), [masterTl, isMobile]);

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
