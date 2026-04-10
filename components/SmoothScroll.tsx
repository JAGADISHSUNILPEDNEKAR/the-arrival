"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useScroll } from "@/lib/context/ScrollContext";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isMobile } = useScroll();

  useEffect(() => {
    // Cinematic settings optimized by device type
    const lenis = new Lenis({
      duration: isMobile ? 1.2 : 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      wheelMultiplier: isMobile ? 1 : 0.7, 
      lerp: isMobile ? 0.1 : 0.04, // Snappier on mobile to follow touch more closely
      touchMultiplier: isMobile ? 1.5 : 2.5, // Reduced on mobile for more natural control
      // syncTouch: true, // Optional: sync with native touch
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Use GSAP's high-performance ticker for the Lenis RAF loop
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Set scroll-behavior to auto to prevent browser interference
    document.documentElement.style.scrollBehavior = "auto";

    // Refresh ScrollTrigger after a short delay to ensure all layouts are settled
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      document.documentElement.style.scrollBehavior = "";
      clearTimeout(refreshTimer);
    };
  }, [isMobile]);

  return <>{children}</>;
}
