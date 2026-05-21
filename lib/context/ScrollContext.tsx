"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import type Lenis from 'lenis';

interface ScrollContextType {
  isMobile: boolean;
  /**
   * Register the active Lenis instance. Called by SmoothScroll on mount;
   * called with null when SmoothScroll is unmounted or under reduced-motion.
   */
  setLenis: (instance: Lenis | null) => void;
  /**
   * Smooth-scroll to a CSS selector or DOM node via Lenis when available.
   * Falls back to native scrollIntoView when Lenis isn't initialised
   * (reduced-motion users, SSR hydration window).
   */
  scrollToElement: (target: string | HTMLElement) => void;
  /**
   * Pause Lenis (no-ops under reduced motion). Used by the Preloader so the
   * entry ritual can't be scrubbed past.
   */
  stopScroll: () => void;
  /**
   * Resume Lenis. Pairs with stopScroll.
   */
  startScroll: () => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const setLenis = useCallback((instance: Lenis | null) => {
    lenisRef.current = instance;
  }, []);

  const scrollToElement = useCallback((target: string | HTMLElement) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { duration: 2.5 });
      return;
    }
    // Native fallback — used during the brief pre-mount window or when Lenis
    // is intentionally absent (reduced motion). Native smooth-scroll obeys
    // the user's motion preference automatically.
    const el =
      typeof target === 'string' ? document.querySelector(target) : target;
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const stopScroll = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const startScroll = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  const value = React.useMemo(
    () => ({ isMobile, setLenis, scrollToElement, stopScroll, startScroll }),
    [isMobile, setLenis, scrollToElement, stopScroll, startScroll]
  );

  return (
    <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
