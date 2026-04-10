"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

const Moment02 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const waterShimmerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useScroll();

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=180%" : "+=250%", 
        pin: true,
        pinSpacing: false,
        scrub: isMobile ? 0.6 : 1.5,
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

    // 2. Island entrance and Parallax depth - Midground speed
    tl.fromTo(islandRef.current, 
      { x: 100, opacity: 0, scale: 0.8 },
      { 
        x: 0, 
        opacity: 1,
        scale: 1,
        force3D: true,
        duration: 0.5,
        ease: "power2.out"
      }, 0.1);

    tl.to(islandRef.current, {
      scale: 1.9,
      x: "-15vw",
      y: "8vh",
      force3D: true,
      ease: "none",
    }, 0.5);

    // 3. Background parallax - Very slow deep background
    tl.to(backgroundRef.current, {
      y: "6%", // Slower than before
      scale: 1.08,
      force3D: true,
      ease: "none",
    }, 0);

    // 4. Water Shimmer - Mid-slow speed
    tl.to(waterShimmerRef.current, {
      backgroundPositionX: "400px",
      y: "2%",
      ease: "none",
    }, 0);

    // 5. Warm Overlay fade in
    tl.fromTo(overlayRef.current,
      { opacity: 0, scale: 1.1 },
      {
        opacity: 0.75,
        scale: 1,
        force3D: true,
        ease: "none"
      }, 0);

    // 6. Text content animation - Foreground (fastest)
    tl.fromTo(textRef.current,
      { opacity: 0, y: 80, scale: 0.92, skewX: 2 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        skewX: 0,
        force3D: true,
        duration: 0.4,
        ease: "power2.out"
      }, 0.25);

    tl.to(textRef.current, {
        opacity: 0,
        y: -140, // Fast exit for depth
        scale: 1.15,
        force3D: true,
        ease: "power2.in",
    }, 0.7);

    // 7. Exit transition - standardized fade + transform exit
    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.92,
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
      id="moment-02"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      {/* Background Base */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%]" 
        style={{
          background: 'linear-gradient(180deg, #0e2038 0%, #1c4d70 30%, #3a8aaa 60%, #89c0d0 82%, #d4eaf0 100%)'
        }}
      />

      {/* Warm Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(210,160,80,0.12) 0%, transparent 50%)'
        }}
      />

      {/* Context Text */}
      <div 
        ref={textRef}
        className="absolute top-[25%] left-[8%] md:left-[12%] z-10 max-w-[420px] pr-4 pointer-events-none"
      >
        <h2 
          className="italic font-light mb-6 drop-shadow-md"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: 'rgba(240, 232, 210, 0.95)',
            letterSpacing: '0.05em',
            lineHeight: '1.2'
          }}
        >
          A sanctuary,<br/>woven into the shoreline.
        </h2>
        <p
          className="font-light drop-shadow-sm"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.85rem, 1vw, 1rem)',
            color: 'rgba(240, 232, 210, 0.7)',
            letterSpacing: '0.05em',
            lineHeight: '1.8'
          }}
        >
          Far from the noise, suspended above the turquoise sea. Every detail of this secluded retreat is designed to foster deep stillness and effortless luxury. Your arrival changes everything.
        </p>
      </div>

      {/* Island Silhouette Container */}
      <div 
        ref={islandRef}
        className="absolute bottom-[38%] right-[28%] z-[2]"
        style={{
          width: 'clamp(80px, 12vw, 160px)',
          height: 'clamp(30px, 5vw, 65px)',
          filter: 'drop-shadow(0 15px 25px rgba(15,35,55,0.4))'
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            background: 'rgba(15, 35, 55, 0.75)',
            clipPath: 'polygon(0% 100%, 8% 60%, 15% 75%, 22% 40%, 30% 65%, 38% 30%, 45% 55%, 52% 20%, 58% 50%, 65% 35%, 72% 60%, 80% 45%, 88% 65%, 95% 55%, 100% 100%)',
          }}
        />
      </div>

      {/* Water Shimmer */}
      <div 
        ref={waterShimmerRef}
        className="absolute bottom-0 left-0 w-full h-[45%] z-[1] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(92deg, transparent, transparent 60px, rgba(255,255,255,0.025) 61px, rgba(255,255,255,0.025) 62px)',
        }}
      />

    </section>
  );
};

export default Moment02;

