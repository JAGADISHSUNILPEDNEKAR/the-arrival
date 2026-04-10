"use client";

import { useEffect, useLayoutEffect, useCallback } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Cinematic settings for a premium, weighted feel
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom cinematic easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.7, // More resistance for deeper deliberation
      lerp: 0.04, // Increased weight (lower lerp = more inertia)
      touchMultiplier: 2.5, // Refined touch response
    });

    // Sync Lenis with GSAP ScrollTrigger
    // This ensures that every scroll frame is processed by both Lenis and GSAP
    lenis.on("scroll", ScrollTrigger.update);

    // Use GSAP's high-performance ticker for the Lenis RAF loop
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after a short delay to ensure all layouts are settled
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      clearTimeout(refreshTimer);
    };
  }, []);

  return <>{children}</>;
}
