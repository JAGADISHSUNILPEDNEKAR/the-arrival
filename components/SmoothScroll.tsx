"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useScroll } from "@/lib/context/ScrollContext";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isMobile, setLenis } = useScroll();

  useEffect(() => {
    // Reduced-motion bail: smooth-scroll inertia is itself a motion effect,
    // and users who opted out should get native browser scrolling. ScrollTrigger
    // still works correctly against the native scroll position.
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      // Still refresh ScrollTrigger after layout settles — pin positions need
      // to be computed against the final document height.
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 1000);
      return () => clearTimeout(refreshTimer);
    }

    // Scroll physics tuned for cinematic resistance, not snappy navigation.
    // Longer duration + lower lerp = the page glides under inertial weight,
    // so each chapter feels arrived-at, not jumped-to. Mobile keeps slightly
    // shorter values so touch flings don't feel laggy.
    const lenis = new Lenis({
      duration: isMobile ? 1.6 : 2.8,
      // Slower-decaying expo gives a longer tail on each scroll burst, so
      // momentum lingers a beat past the last wheel tick — the "resistance"
      // half of the brief's motion language.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      smoothWheel: true,
      wheelMultiplier: isMobile ? 1.0 : 0.7,
      lerp: isMobile ? 0.07 : 0.025,
      touchMultiplier: isMobile ? 1.6 : 2.0,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    document.documentElement.style.scrollBehavior = "auto";

    setLenis(lenis);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      setLenis(null);
      lenis.destroy();
      gsap.ticker.remove(raf);
      document.documentElement.style.scrollBehavior = "";
      clearTimeout(refreshTimer);
    };
  }, [isMobile, setLenis]);

  return <>{children}</>;
}
