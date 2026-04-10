"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

import HeroBackground from '../hero/HeroBackground';
import HeroContent from '../hero/HeroContent';
import HeroCTA from '../hero/HeroCTA';
import HeroProofPoints from '../hero/HeroProofPoints';

const Moment01 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundContainerRef = useRef<HTMLDivElement>(null);
  const backgroundGradRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const proofsRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useScroll();
  
  useEffect(() => {
    if (!sectionRef.current) return;

    // Create a local timeline for this moment
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=150%" : "+=200%", // Slightly shorter on mobile for better flow
        pin: true,
        pinSpacing: false, 
        scrub: isMobile ? 0.6 : 1.5, // Snappier on mobile
        onToggle: self => {
          if (self.isActive) {
            sectionRef.current?.classList.add('active');
          } else {
            sectionRef.current?.classList.remove('active');
          }
        }
      }
    });

    // 1. Entry Reveal - standardized fade + transform
    tl.fromTo(sectionRef.current,
      { opacity: 0, scale: 1.05 },
      { 
        opacity: 1, 
        scale: 1,
        ease: "power2.out",
        duration: 0.2 
      }, 0);

    // 2. Parallax Background - movement speed differentiation
    tl.to(backgroundGradRef.current, {
      y: "8%", // Very slow deep background
      force3D: true,
      ease: "none",
    }, 0);

    tl.to(backgroundContainerRef.current, {
      scale: 1.12, // Subtle zoom
      force3D: true,
      ease: "none",
    }, 0);

    // 3. Horizon glow parallax - Midground speed
    tl.to(glowRef.current, {
      scaleY: 1.5,
      y: "-8%", 
      opacity: 0.8,
      force3D: true,
      ease: "none",
    }, 0);

    // 4. Content Reveal (Layered) - delayed slightly for better reveal
    tl.fromTo([contentRef.current, ctaRef.current, proofsRef.current], 
      { opacity: 0, y: 60, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out"
      }, 0.15);

    // 5. Exit Transition - Foreground elements move faster for depth
    tl.to([contentRef.current, ctaRef.current, proofsRef.current], {
      opacity: 0,
      y: -120, // Faster exit for "foreground" feel
      scale: 1.1,
      force3D: true,
      ease: "power2.in",
      stagger: 0.05
    }, 0.7);

    // 6. Final Moment Fade - standardized fade + transform exit
    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.92, // Slight shrink back
      y: -50,
      ease: "power2.inOut",
    }, 0.85);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, []);


  return (
    <section 
      ref={sectionRef}
      className="moment relative w-full overflow-hidden" 
      id="moment-01"
       // Start hidden
    >
      <HeroBackground 
        ref={backgroundContainerRef} 
        glowRef={glowRef} 
        backgroundGradRef={backgroundGradRef} 
      />
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <HeroContent ref={contentRef} />
        <div className="mt-auto mb-12 flex flex-col items-center">
          <HeroCTA ref={ctaRef} />
          <HeroProofPoints ref={proofsRef} />
        </div>
      </div>
    </section>
  );
};

export default Moment01;

