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
      duration: isMobile ? 1.4 : 2.2, // More weighted feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      wheelMultiplier: isMobile ? 1.1 : 0.8, 
      lerp: isMobile ? 0.08 : 0.035, // Ultra-smooth on desktop
      touchMultiplier: isMobile ? 1.8 : 2.2, 
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
