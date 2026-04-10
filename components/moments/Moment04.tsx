"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from "@/lib/gsap";
import { useScroll } from '@/lib/context/ScrollContext';

const Moment04 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const planksContainerRef = useRef<HTMLDivElement>(null);
  const planksRef = useRef<HTMLDivElement>(null);
  const feetRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [petals, setPetals] = useState<any[]>([]);

  const { masterTl } = useScroll();

  useEffect(() => {
    // Generate petals only on client
    setPetals([...Array(6)].map((_, i) => ({
      left: `${15 + (i * 12) + (Math.random() * 5)}%`,
      bottom: `${10 + (i * 4) + (Math.random() * 10)}%`,
      rotate: Math.random() * 30 - 15,
      delay: i * 0.2
    })));
  }, []);

  useEffect(() => {
    if (!masterTl || !sectionRef.current) return;

    const label = `moment-04`;

    // Entry transition
    masterTl.fromTo(sectionRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 2
      }, `${label}-=1`);

    // Planks and feet entrance
    masterTl.fromTo(planksContainerRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 4,
        force3D: true,
        ease: "power2.out"
      }, label);

    masterTl.fromTo(feetRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 3,
        force3D: true
      }, label);

    // Text content animation
    masterTl.fromTo(textRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        force3D: true,
        duration: 4
      }, `${label}+=2`);

    // Main perspective and movement
    masterTl.to(planksRef.current, {
      rotateX: "35deg",
      ease: "none",
      force3D: true,
      duration: 10
    }, label);

    masterTl.to(planksContainerRef.current, {
      y: "-15vh",
      ease: "none",
      force3D: true,
      duration: 10
    }, label);

    // Distant figure growth
    masterTl.to(figureRef.current, {
      scale: 1.5,
      y: "-20px",
      force3D: true,
      ease: "none",
      duration: 10
    }, label);

    masterTl.to(textRef.current, {
      opacity: 0,
      y: -30,
      force3D: true,
      ease: "none",
      duration: 4
    }, `${label}+=6`);

    // Exit transition
    masterTl.to(sectionRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 2
    }, `${label}+=8`);

  }, [masterTl]);

  return (
    <section 
      ref={sectionRef}
      className="moment relative w-screen overflow-hidden" 
      id="moment-04"
      style={{
        background: 'linear-gradient(180deg, #5aadbe 0%, #7dc4cf 30%, #a8d8e0 55%, #d0ecf0 80%, #e8f6f8 100%)',
        opacity: 0,
        pointerEvents: 'none'
      }}
    >
      {/* Context Text & Soft CTA */}
      <div 
        ref={textRef}
        className="absolute top-[20%] left-[10%] md:left-[15%] z-20 max-w-[400px] pointer-events-auto"
      >
        <h2 
          className="italic font-light mb-6 drop-shadow-md"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            color: 'rgba(25, 65, 85, 0.95)',
            letterSpacing: '0.05em',
            lineHeight: '1.2'
          }}
        >
          Leave the noise behind.
        </h2>
        <p
          className="font-light mb-8 drop-shadow-sm"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.85rem, 1vw, 1rem)',
            color: 'rgba(25, 65, 85, 0.8)',
            letterSpacing: '0.05em',
            lineHeight: '1.8'
          }}
        >
          Your barefoot journey begins the moment you step onto the weathered jetty. Feel the rhythm of the tides matching your pulse as you cross into absolute privacy.
        </p>
        <button 
          className="uppercase text-xs tracking-widest px-6 py-3 border border-[rgba(25,65,85,0.4)] text-[rgba(25,65,85,0.9)] hover:bg-[rgba(25,65,85,0.05)] transition-colors duration-500 backdrop-blur-sm"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Discover The Estate
        </button>
      </div>

      {/* Jetty Planks Section */}
      <div 
        ref={planksContainerRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55vw] max-w-[700px] h-[70%] z-10"
        style={{ perspective: '800px' }}
      >
        <div 
          ref={planksRef}
          className="relative w-full h-full origin-bottom"
          style={{ transform: 'rotateX(25deg)' }}
        >
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  rgba(160,110,60,0.9) 0px,
                  rgba(180,130,75,0.85) 18px,
                  rgba(40,160,180,0.8) 18px,
                  rgba(40,160,180,0.8) 21px,
                  rgba(160,110,60,0.9) 21px
                )
              `
            }}
          />
          
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background: `
                repeating-linear-gradient(
                  92deg,
                  transparent 0px,
                  rgba(0,0,0,0.04) 1px,
                  transparent 2px,
                  transparent 8px
                )
              `
            }}
          />

          <div 
            ref={figureRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20px] z-[4]"
            style={{
              width: '8px',
              height: '20px',
              borderRadius: '4px 4px 0 0',
              background: 'rgba(240,235,220,0.7)'
            }}
          />

          {petals.map((petal, i) => (
            <div 
              key={i}
              className="absolute"
              style={{
                width: '8px',
                height: '14px',
                borderRadius: '60% 40% 60% 40%',
                background: 'rgba(255, 248, 235, 0.85)',
                left: petal.left,
                bottom: petal.bottom,
                transform: `rotate(${petal.rotate}deg)`,
                animation: `floatPetal ${3 + petal.delay}s ease-in-out infinite`
              }}
            />
          ))}

          <div ref={feetRef} className="absolute inset-0 z-[5] pointer-events-none">
            <div 
              className="absolute left-[38%] bottom-[15%]"
              style={{
                width: '28px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(210, 170, 130, 0.7)',
                animation: 'stepBreath 1.5s ease-in-out infinite alternate'
              }}
            />
            <div 
              className="absolute left-[58%] bottom-[22%]"
              style={{
                width: '28px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(210, 170, 130, 0.7)',
                animation: 'stepBreath 1.5s ease-in-out infinite alternate-reverse'
              }}
            />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatPetal {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes stepBreath {
          from { transform: scale(1); }
          to { transform: scale(1.02); }
        }
      ` }} />
    </section>
  );
};

export default Moment04;
