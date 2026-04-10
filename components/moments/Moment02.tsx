"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';


const Moment02 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=250%", // Slightly longer for detailed content
        pin: true,
        pinSpacing: false,
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

    // Entry Reveal
    tl.to(sectionRef.current, { opacity: 1, duration: 0.1 }, 0);

    // Island entrance and main move
    tl.fromTo(islandRef.current, 
      { x: 40, opacity: 0 },
      { 
        x: 0, 
        opacity: 1,
        force3D: true,
      }, 0);

    tl.to(islandRef.current, {
      scale: 1.6,
      x: "-8vw",
      force3D: true,
      ease: "none",
    }, 0.4);

    // Background movement
    tl.to(backgroundRef.current, {
      y: "8%",
      force3D: true,
      ease: "none",
    }, 0);

    // Warm Overlay fade in
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      {
        opacity: 0.6,
        force3D: true,
      }, 0);

    // Text content animation
    tl.fromTo(textRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        force3D: true,
      }, 0.2);

    tl.to(textRef.current, {
        opacity: 0,
        y: -30,
        force3D: true,
        ease: "none",
    }, 0.7);

    // Exit transition (fade out)
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
      id="moment-02"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      {/* Background Base */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 w-full h-[110%] -top-[5%]" 
        style={{
          background: 'linear-gradient(180deg, #0e2038 0%, #1c4d70 30%, #3a8aaa 60%, #89c0d0 82%, #d4eaf0 100%)'
        }}
      />

      {/* Warm Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(210,160,80,0.08) 0%, transparent 50%)'
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
        className="absolute bottom-0 left-0 w-full h-[45%] z-[1] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(92deg, transparent, transparent 60px, rgba(255,255,255,0.025) 61px, rgba(255,255,255,0.025) 62px)',
          animation: 'waterMove 5s linear infinite'
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waterMove {
          from { background-position-x: 0px; }
          to { background-position-x: 120px; }
        }
      ` }} />
    </section>
  );
};

export default Moment02;
