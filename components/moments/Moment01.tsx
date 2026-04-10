"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

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
  
  useEffect(() => {
    if (!sectionRef.current) return;

    // Create a local timeline for this moment
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=200%", // Lock for 2 viewports
        pin: true,
        pinSpacing: false, // Allow next section to scroll over
        scrub: true,
        onToggle: self => {
          if (self.isActive) {
            sectionRef.current?.classList.add('active');
          } else {
            sectionRef.current?.classList.remove('active');
          }
        }
      }
    });

    // 1. Entry Reveal - opacity tied to scroll
    tl.to(sectionRef.current, { 
      opacity: 1, 
      ease: "none",
      duration: 0.1 
    }, 0);

    // 2. Parallax Background - movement speed differentiation
    tl.to(backgroundGradRef.current, {
      y: "15%",
      force3D: true,
      ease: "none",
    }, 0);

    tl.to(backgroundContainerRef.current, {
      scale: 1.1,
      force3D: true,
      ease: "none",
    }, 0);

    // 3. Horizon glow parallax
    tl.to(glowRef.current, {
      scaleY: 1.4,
      y: "-5%",
      force3D: true,
      ease: "none",
    }, 0);

    // 4. Content Reveal (Layered)
    tl.fromTo([contentRef.current, ctaRef.current, proofsRef.current], 
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out"
      }, 0.1);

    // 5. Exit Transition - UI Elements fade out first
    tl.to([contentRef.current, ctaRef.current, proofsRef.current], {
      opacity: 0,
      y: -60,
      scale: 1.05,
      force3D: true,
      ease: "power2.in",
      stagger: 0.05
    }, 0.6);

    // 6. Final Moment Fade
    tl.to(sectionRef.current, {
      opacity: 0,
      ease: "none",
    }, 0.9);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, []);


  return (
    <section 
      ref={sectionRef}
      className="moment relative w-screen overflow-hidden" 
      id="moment-01"
      style={{ opacity: 0 }} // Start hidden
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

