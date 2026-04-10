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
        scrub: 1,
        onToggle: self => {
          if (self.isActive) {
            sectionRef.current?.classList.add('active');
          } else {
            sectionRef.current?.classList.remove('active');
          }
        }
      }
    });

    // Background logic
    tl.to(backgroundGradRef.current, {
      y: "12%",
      force3D: true,
      ease: "none",
    }, 0);

    // Horizon glow
    tl.to(glowRef.current, {
      scaleY: 1.3,
      force3D: true,
      ease: "none",
    }, 0);

    // UI Elements fade out as we scroll deep into the pin
    tl.to([contentRef.current, ctaRef.current, proofsRef.current], {
      opacity: 0,
      y: -50,
      force3D: true,
      ease: "power2.inOut",
      stagger: 0.1
    }, 0.5);

    // Fade out background slightly as next moment arrives
    tl.to(sectionRef.current, {
      opacity: 0,
      ease: "none",
    }, 1);

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
        <HeroCTA ref={ctaRef} />
        <HeroProofPoints ref={proofsRef} />
      </div>
    </section>
  );
};

export default Moment01;
