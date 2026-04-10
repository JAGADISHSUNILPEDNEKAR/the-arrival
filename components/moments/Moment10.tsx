"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';


const Moment10 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [starsData, setStarsData] = useState<any[]>([]);


  useEffect(() => {
    // Generate 55 stars with random properties only on client
    setStarsData(Array.from({ length: 55 }).map((_, i) => {
      const size = i < 40 ? 1 : i < 50 ? 2 : 3;
      const isBlueTint = Math.random() > 0.7;
      const color = isBlueTint ? 'rgba(220, 230, 255, 0.6)' : `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`;
      const animationType = (i % 3) + 1; 
      const duration = animationType === 1 ? 2 : animationType === 2 ? 3 : 4;
      const delay = Math.random() * 5;
      const hasGlow = size >= 2 && Math.random() > 0.5;

      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${size}px`,
        color,
        animationName: `twinkle${animationType}`,
        duration,
        delay,
        hasGlow
      };
    }));
  }, []);

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

    // Camera pull back
    tl.fromTo(contentRef.current, 
      { scale: 1.1 },
      {
        scale: 1,
        force3D: true,
        ease: "none",
      }, 0);

    // Text Fade-In
    tl.fromTo(textRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        force3D: true,
        ease: "power1.inOut",
      }, 0.4);

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
      className="moment relative w-screen overflow-hidden bg-[#060810]" 
      id="moment-10"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 100%, #060a12 0%, #080c18 40%, #060810 100%)'
        }}
      />

      <div ref={contentRef} className="absolute inset-0 w-full h-full">
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[40%] origin-center pointer-events-none opacity-40"
          style={{
            transform: 'translate(-50%, -70%) rotate(25deg)',
          }}
        >
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'repeating-linear-gradient(92deg, transparent 0%, rgba(180,190,220,0.015) 1%, rgba(200,210,240,0.025) 2%, transparent 3%, transparent 6%)'
            }}
          />
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'rgba(200,210,240,0.04)',
              filter: 'blur(40px)'
            }}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {starsData.map((star) => (
            <div 
              key={star.id}
              className="absolute rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                boxShadow: star.hasGlow ? '0 0 3px rgba(220, 230, 255, 0.4)' : 'none',
                animation: `${star.animationName} ${star.duration}s ease-in-out ${star.delay}s infinite alternate`
              }}
            />
          ))}
        </div>

        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 75%, rgba(10,30,50,0.6) 0%, rgba(5,15,25,0.3) 50%, transparent 75%)'
          }}
        />

        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[clamp(100px,18vw,240px)] h-[25%] z-20"
        >
          <div 
            className="absolute inset-0"
            style={{
              background: 'rgba(15,35,20,0.85)',
              clipPath: 'ellipse(50% 40% at 50% 80%)',
              boxShadow: '0 0 40px 15px rgba(255,185,80,0.15)'
            }}
          >
            <div className="absolute top-[20%] left-[20%] w-[10%] h-[30%] bg-black/40 blur-[2px] rotate-[15deg] rounded-full" />
            <div className="absolute top-[15%] right-[25%] w-[8%] h-[35%] bg-black/40 blur-[2px] rotate-[-10deg] rounded-full" />
            <div className="absolute top-[35%] left-[45%] w-[12%] h-[25%] bg-black/40 blur-[2px] rotate-[5deg] rounded-full" />
          </div>

          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: '0 0 40px 15px rgba(255,185,80,0.15)'
            }}
          />

          <div 
            className="absolute top-[65%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full z-30"
            style={{
              background: 'rgba(255,200,100,0.7)',
              boxShadow: '0 0 15px 5px rgba(255,180,70,0.3)'
            }}
          />
        </div>
      </div>

      <div 
        ref={textRef}
        className="absolute top-[35%] left-1/2 -translate-x-1/2 z-40 w-full text-center px-6 pointer-events-none"
      >
        <p className="font-serif italic font-light tracking-[0.2em] text-[#dcd7c8] opacity-[0.55]"
           style={{
             fontSize: 'clamp(0.9rem, 2.2vw, 1.5rem)',
             fontFamily: '"Cormorant Garamond", serif'
           }}
        >
          Some tables are remembered longer than others.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes twinkle1 {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes twinkle2 {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes twinkle3 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      ` }} />
    </section>
  );
};

export default Moment10;
