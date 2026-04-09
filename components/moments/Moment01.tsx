"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/gsap";
import HeroBackground from '../hero/HeroBackground';
import HeroContent from '../hero/HeroContent';
import HeroCTA from '../hero/HeroCTA';
import HeroProofPoints from '../hero/HeroProofPoints';

const Moment01 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundGradRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const proofsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !backgroundGradRef.current || !glowRef.current || !contentRef.current || !ctaRef.current || !proofsRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2.5,
        },
        onStart: () => {
          gsap.set([backgroundGradRef.current, glowRef.current, contentRef.current, ctaRef.current, proofsRef.current], { willChange: "transform, opacity" });
        },
        onComplete: () => {
          gsap.set([backgroundGradRef.current, glowRef.current, contentRef.current, ctaRef.current, proofsRef.current], { clearProps: "willChange" });
        }
      });

      // Background translates Y by +12% (bow dipping effect)
      tl.to(backgroundGradRef.current, {
        y: "12%",
        force3D: true,
        ease: "none",
        duration: 1
      }, 0);

      // Horizon glow scales from scaleY(1) to scaleY(1.3)
      tl.to(glowRef.current, {
        scaleY: 1.3,
        force3D: true,
        ease: "none",
        duration: 1
      }, 0);

      // UI Elements fade out early as we scroll to Moment 02
      tl.to([contentRef.current, ctaRef.current, proofsRef.current], {
        opacity: 0,
        y: -30,
        force3D: true,
        ease: "power2.inOut",
        duration: 0.4,
        stagger: 0.1
      }, 0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="moment relative min-h-[100svh] w-screen overflow-hidden" 
      id="moment-01"
    >
      <HeroBackground 
        ref={sectionRef} 
        glowRef={glowRef} 
        backgroundGradRef={backgroundGradRef} 
      />
      
      <HeroContent ref={contentRef} />
      
      <HeroCTA ref={ctaRef} />
      
      <HeroProofPoints ref={proofsRef} />
    </section>
  );
};

export default Moment01;
