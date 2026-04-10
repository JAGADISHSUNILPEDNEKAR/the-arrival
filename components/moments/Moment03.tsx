"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';


const Moment03 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundGroupRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const deepWaterRef = useRef<HTMLDivElement>(null);
  const shallowLagoonRef = useRef<HTMLDivElement>(null);
  const sandRef = useRef<HTMLDivElement>(null);
  const causticsRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const jettyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=200%",
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

    // Island and jetty entrance
    tl.fromTo([islandRef.current, jettyRef.current],
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0,
        force3D: true,
        ease: "power2.out"
      }, 0);

    // Background movement
    tl.to(backgroundGroupRef.current, {
      y: "6%",
      force3D: true,
      ease: "none",
    }, 0);

    // Caustics fade out
    tl.to(causticsRef.current, {
      opacity: 0,
      force3D: true,
      ease: "none",
    }, 0);

    // Island zoom and fade out (main action)
    tl.to(islandRef.current, {
      scale: 2,
      y: "-30vh",
      opacity: 0,
      force3D: true,
      ease: "power1.in",
    }, 0.5);

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
      className="moment relative w-screen overflow-hidden bg-[#1a4060]" 
      id="moment-03"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      {/* Background Layers Group */}
      <div ref={backgroundGroupRef} className="absolute inset-0 w-full h-full">
        {/* Sky */}
        <div 
          ref={skyRef}
          className="absolute top-0 left-0 w-full h-[42%] z-0"
          style={{
            background: 'linear-gradient(180deg, #1a4060 0%, #3a7a9a 35%, #6aadbe 55%)'
          }}
        />

        {/* Deep water horizon */}
        <div 
          ref={deepWaterRef}
          className="absolute top-[35%] left-0 w-full h-[25%] z-[1]"
          style={{
            background: 'linear-gradient(180deg, #4a9ab0 0%, #3a8a9e 100%)'
          }}
        />

        {/* Shallow lagoon */}
        <div 
          ref={shallowLagoonRef}
          className="absolute bottom-0 left-0 w-full h-[50%] z-[2]"
          style={{
            background: 'linear-gradient(180deg, rgba(40,160,160,0.9) 0%, rgba(60,190,170,0.85) 20%, rgba(100,210,180,0.8) 40%, rgba(150,225,200,0.75) 65%, rgba(200,238,218,0.7) 85%, rgba(225,245,230,0.65) 100%)'
          }}
        />

        {/* Sand beneath water */}
        <div 
          ref={sandRef}
          className="absolute bottom-0 left-0 w-full h-[30%] z-[3]"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(240,225,180,0.35) 0%, transparent 70%)'
          }}
        />

        {/* Caustic light patterns */}
        <div 
          ref={causticsRef}
          className="absolute inset-0 w-full h-full z-[4] pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 3px 8px at 20% 70%, rgba(255,255,255,0.15) 0%, transparent 100%),
              radial-gradient(ellipse 5px 3px at 45% 80%, rgba(255,255,255,0.12) 0%, transparent 100%),
              radial-gradient(ellipse 4px 6px at 70% 75%, rgba(255,255,255,0.1) 0%, transparent 100%),
              radial-gradient(ellipse 3px 5px at 85% 68%, rgba(255,255,255,0.13) 0%, transparent 100%)
            `,
            animation: 'caustics 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Island */}
      <div 
        ref={islandRef}
        className="absolute left-1/2 -translate-x-1/2 top-[28%] z-[4]"
        style={{
          width: 'clamp(200px, 35vw, 500px)',
          height: 'clamp(40px, 8vw, 100px)',
          background: 'rgba(15, 40, 25, 0.85)',
          clipPath: 'polygon(0% 100%, 5% 70%, 10% 85%, 14% 50%, 18% 70%, 22% 35%, 27% 60%, 31% 25%, 35% 55%, 39% 40%, 43% 65%, 47% 30%, 51% 55%, 55% 20%, 59% 50%, 63% 38%, 67% 60%, 71% 45%, 75% 65%, 80% 50%, 85% 70%, 90% 55%, 95% 75%, 100% 100%)'
        }}
      />

      {/* Jetty */}
      <div 
        ref={jettyRef}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-[5]"
        style={{
          width: '3px',
          height: '35%',
          background: 'linear-gradient(180deg, transparent, rgba(180,140,90,0.6) 40%, rgba(160,120,70,0.8) 100%)'
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes caustics {
          0%, 100% { background-position: 0px 0px; }
          50% { background-position: 3px -3px; }
        }
      ` }} />
    </section>
  );
};

export default Moment03;
