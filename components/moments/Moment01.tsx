"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
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

    // Split text for cinematic character-level reveals
    const splitTitle = new SplitText(".cinematic-text", { 
      type: "words,chars", 
      wordsClass: "overflow-hidden inline-flex",
      charsClass: "char" 
    });
    const splitSub = new SplitText(".cinematic-subtext", { 
      type: "words,chars",
      wordsClass: "overflow-hidden inline-flex",
      charsClass: "char"
    });

    // Create a local timeline for this moment
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=150%" : "+=250%", // Extended for cinematic breath
        pin: true,
        pinSpacing: true, 
        scrub: isMobile ? 0.8 : 1.2, // Tighter control for "viscosity"
        onToggle: self => {
          if (self.isActive) {
            sectionRef.current?.classList.add('active');
          } else {
            sectionRef.current?.classList.remove('active');
          }
        }
      }
    });

    // 1. Initial State Set - 100ms conceptual delay via a small empty tween or offset
    tl.set({}, {}, 0.1); 

    // 2. Entry Reveal - Standard +40px Y-translation + fade
    tl.fromTo(sectionRef.current,
      { opacity: 0, scale: 1.02, willChange: "transform, opacity" },
      { 
        opacity: 1, 
        scale: 1,
        ease: "cinematic",
        duration: 0.5,
        clearProps: "willChange"
      }, 0.1);

    // 3. Cinematic Typography Reveal (Character Level)
    if (splitTitle.chars) {
      tl.fromTo(splitTitle.chars, {
        y: "100%",
        filter: "blur(4px)",
        willChange: "transform, filter",
      }, {
        y: "0%",
        filter: "blur(0px)",
        stagger: 0.02,
        duration: 0.8,
        ease: "cinematic",
        clearProps: "willChange,filter"
      }, 0.2);
    }

    if (splitSub.chars) {
      tl.fromTo(splitSub.chars, {
        y: "100%",
        filter: "blur(4px)",
        willChange: "transform, filter",
      }, {
        y: "0%",
        filter: "blur(0px)",
        stagger: 0.01,
        duration: 0.6,
        ease: "cinematic",
        clearProps: "willChange,filter"
      }, 0.4);
    }

    // 4. Parallax Background - 0.3x scroll speed logic
    // We achieve this by moving the BG significantly less than the pin duration
    tl.to(backgroundGradRef.current, {
      y: "15vh", 
      force3D: true,
      ease: "none",
    }, 0.1);

    tl.to(backgroundContainerRef.current, {
      scale: 1.15,
      force3D: true,
      ease: "none",
    }, 0.1);

    // 5. Midground Glow Parallax
    tl.to(glowRef.current, {
      y: "-12vh",
      opacity: 0.9,
      scale: 1.4,
      force3D: true,
      ease: "none",
    }, 0.1);

    // 6. Foreground Reveal - 1x speed kinetics
    tl.fromTo([ctaRef.current, proofsRef.current], 
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "cinematic"
      }, 0.5);

    // 7. Exit Transition - Standardized -40px offset exit
    tl.to([contentRef.current, ctaRef.current, proofsRef.current], {
      opacity: 0,
      y: -80,
      scale: 1.05,
      force3D: true,
      ease: "cinematic",
      stagger: 0.05
    }, 0.8);

    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.98,
      y: -40,
      ease: "cinematic",
    }, 0.9);

    return () => {
      tl.kill();
      splitTitle.revert();
      splitSub.revert();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, [isMobile]);

  useEffect(() => {
    if (!backgroundContainerRef.current) return;
    
    // Very slow 8-second continuous breathing drift
    const driftTween = gsap.fromTo(backgroundContainerRef.current, 
      { y: 0, willChange: "transform" },
      {
        y: -12,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      }
    );

    return () => {
      driftTween.kill();
    };
  }, []);


  return (
    <section 
      ref={sectionRef}
      className="moment relative w-full overflow-hidden" 
      id="moment-01"
    >
      <HeroBackground 
        ref={backgroundContainerRef} 
        glowRef={glowRef} 
        backgroundGradRef={backgroundGradRef} 
      />
      
      <div className="relative z-10 w-full h-full flex flex-col pt-[15vh]">
        <HeroContent ref={contentRef} />
        <div className="mt-auto mb-20 flex flex-col items-center">
          <HeroCTA ref={ctaRef} />
          <HeroProofPoints ref={proofsRef} />
        </div>
      </div>
    </section>
  );
};

export default Moment01;
