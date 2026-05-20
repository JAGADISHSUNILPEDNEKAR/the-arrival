"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * MomentWipe — branded transition overlay for narratively-loaded seams.
 *
 * Two variants:
 *   - "ocean":   rises from below. Used at Moment08 → Moment09 — emerging
 *                from the testimonial void back into the warm dining world.
 *   - "curtain": descends from above. Used at Moment10 → Moment11 — the
 *                night closing in around the final invitation.
 *
 * Other moment-to-moment seams stay as cross-fades. These two wipes earn
 * their keep because they're the page's two emotional gear changes; using
 * the same effect on every transition would read as overdesigned.
 *
 * The wipe is a fixed-position element that scrubs against ScrollTrigger
 * across the scroll window where the destination moment is sliding up the
 * viewport (between "top bottom" and "top 25%"). The built-in gradient
 * keeps one edge soft — there's no hard rectangle sweeping across.
 */
type WipeVariant = "ocean" | "curtain";

interface MomentWipeProps {
  triggerId: string;
  variant: WipeVariant;
}

const VARIANT_STYLES: Record<
  WipeVariant,
  { background: string; startY: string; endY: string }
> = {
  ocean: {
    // 180deg = top to bottom. Top is the leading edge as the element rises.
    background:
      "linear-gradient(180deg, rgba(46,30,14,0.0) 0%, rgba(28,18,8,0.94) 18%, rgba(20,12,4,0.97) 60%, rgba(18,10,2,0.97) 100%)",
    startY: "100%",
    endY: "-100%",
  },
  curtain: {
    // 180deg = top to bottom. Bottom is the leading edge as the element falls.
    background:
      "linear-gradient(180deg, rgba(8,14,28,0.97) 0%, rgba(10,18,32,0.96) 40%, rgba(14,24,40,0.90) 82%, rgba(20,32,52,0.0) 100%)",
    startY: "-100%",
    endY: "100%",
  },
};

const MomentWipe = ({ triggerId, variant }: MomentWipeProps) => {
  const wipeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wipeEl = wipeRef.current;
    if (!wipeEl) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) {
      wipeEl.style.display = "none";
      return;
    }

    const triggerEl = document.querySelector(triggerId);
    if (!triggerEl) return;

    const { startY, endY } = VARIANT_STYLES[variant];
    gsap.set(wipeEl, { y: startY });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl as Element,
        start: "top bottom",
        end: "top 25%",
        scrub: 1.0,
      },
    });
    tl.fromTo(
      wipeEl,
      { y: startY },
      { y: endY, ease: "power3.inOut" }
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [triggerId, variant]);

  return (
    <div
      ref={wipeRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        background: VARIANT_STYLES[variant].background,
        willChange: "transform",
      }}
    />
  );
};

export default MomentWipe;
