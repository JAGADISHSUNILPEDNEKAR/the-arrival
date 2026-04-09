"use client";

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { gsap } from "@/lib/gsap";

const Moment09 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const sauceRef = useRef<HTMLDivElement>(null);
  const fishRef = useRef<HTMLDivElement>(null);
  const herbsRef = useRef<HTMLDivElement>(null);
  const foamRef = useRef<HTMLDivElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const steamRef = useRef<HTMLDivElement>(null);
  const [starsData, setStarsData] = useState<any[]>([]);
  const [foamData, setFoamData] = useState<any[]>([]);

  useEffect(() => {
    // Generate data only on client
    setStarsData(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 1.5}px`,
      opacity: 0.3 + Math.random() * 0.4,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 2,
    })));

    setFoamData([...Array(6)].map((_, i) => ({
      width: 3 + Math.random() * 2,
      height: 3 + Math.random() * 2,
      top: Math.random() * 12 - 6,
      left: Math.random() * 12 - 6
    })));

    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      // Initialize sauce and other elements for animation
      gsap.set(sauceRef.current, { x: -30, opacity: 0, scale: 0.8 });
      gsap.set([fishRef.current, herbsRef.current, foamRef.current], { opacity: 0, y: 15, scale: 0.95 });

      // Scroll-In Animation
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: 1.8,
          onEnter: () => { gsap.set([plateRef.current, sauceRef.current, fishRef.current, herbsRef.current, foamRef.current], { willChange: "transform, opacity, scale" }); },
          onLeave: () => { gsap.set([plateRef.current, sauceRef.current, fishRef.current, herbsRef.current, foamRef.current], { clearProps: "willChange" }); },
          onEnterBack: () => { gsap.set([plateRef.current, sauceRef.current, fishRef.current, herbsRef.current, foamRef.current], { willChange: "transform, opacity, scale" }); },
          onLeaveBack: () => { gsap.set([plateRef.current, sauceRef.current, fishRef.current, herbsRef.current, foamRef.current], { clearProps: "willChange" }); },
        }
      });

      // Plate enters from darkness
      enterTl.fromTo(plateRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, force3D: true, ease: "power2.out" }
      );

      // Sauce pools in from left
      enterTl.to(sauceRef.current, {
        x: 0,
        opacity: 1,
        scale: 1,
        force3D: true,
        ease: "power2.out",
        duration: 0.8
      }, "-=0.4");

      // Stagger food elements
      const foodElements = [fishRef.current, herbsRef.current, foamRef.current].filter(Boolean) as HTMLElement[];
      foodElements.forEach((item, i) => {
        enterTl.to(item, {
          opacity: 1,
          y: 0,
          scale: 1,
          force3D: true,
          ease: "back.out(1.2)",
          duration: 0.6
        }, "-=0.3");
      });

      // Scroll-Out Animation
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.8,
        },
        onStart: () => { gsap.set(plateRef.current, { willChange: "transform, opacity" }); },
        onComplete: () => { gsap.set(plateRef.current, { clearProps: "willChange" }); }
      });

      // Plate translates upward (being removed) over the last 20%
      exitTl.to(plateRef.current, {
        y: -150,
        opacity: 0,
        force3D: true,
        ease: "power2.inOut"
      }, 0.8); // Starts at 80% of the timeline

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="moment relative min-h-[100svh] w-screen overflow-hidden" 
      id="moment-09"
    >
      {/* Background (Deep blue-black world) */}
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #080810 0%, #0c0c18 40%, #080810 100%)'
        }}
      >
        {/* Night Stars */}
        <div ref={starsRef} className="absolute inset-0 pointer-events-none z-0">
          {starsData.map((star) => (
            <div 
              key={star.id}
              className="absolute bg-white rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate`
              }}
            />
          ))}
        </div>

        {/* Lagoon (Barely visible Presence) */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[30%] z-1"
          style={{
            background: 'rgba(15,35,50,0.6)',
            maskImage: 'linear-gradient(to top, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to top, black, transparent)'
          }}
        />

        {/* Candle (Primary Light Source) - Positioned upper-left of center */}
        <div 
          ref={candleRef}
          className="absolute top-[28%] left-[28%] z-30 flex flex-col items-center"
        >
          {/* Prominent Glow */}
          <div 
            className="absolute -top-24 w-[300px] h-[400px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: '50%',
              top: '10px',
              background: 'radial-gradient(ellipse 120px 180px at center, rgba(255,185,70,0.3) 0%, rgba(255,160,50,0.08) 50%, transparent 75%)',
              animation: 'candleGlow 4s ease-in-out infinite'
            }}
          />
          {/* Flame */}
          <div className="w-1.5 h-3.5 bg-[rgba(255,210,80,0.95)] rounded-[50%_50%_30%_30%] mb-1 shadow-[0_0_12px_rgba(255,180,50,0.7)]"
               style={{
                 animation: 'candleFlicker 2.5s ease-in-out infinite'
               }}
          />
          {/* Candle Body */}
          <div className="w-[8px] h-[45px]"
               style={{
                 background: 'linear-gradient(180deg, #f0e0b0, #dcc080)'
               }}
          />
        </div>

        {/* Wine Glass (Quiet witness) */}
        <div 
          ref={glassRef}
          className="absolute top-[35%] left-[38%] flex flex-col items-center pointer-events-none z-20 opacity-30"
        >
          <div className="w-7 h-11 rounded-[40%_40%_100%_100%] border border-[rgba(255,255,255,0.05)] bg-[rgba(150,170,200,0.03)]" />
          <div className="w-[1px] h-9 bg-[rgba(255,255,255,0.06)]" />
          <div className="w-6 h-[1px] bg-[rgba(255,255,255,0.04)] rounded-full" />
        </div>

        {/* The Plate (Protagonist) */}
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div 
            ref={plateRef}
            className="relative w-[clamp(120px,18vw,220px)] h-[clamp(120px,18vw,220px)] flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #1a1510, #252015, #1e1a0e)',
              borderRadius: '51% 49% 50% 50% / 50% 51% 49% 50%',
              boxShadow: 'inset -3px -2px 0 rgba(255,200,100,0.15), 0 0 0 1px rgba(255,200,100,0.08), 0 20px 50px rgba(0,0,0,0.7)'
            }}
          >
            {/* Food Elements Stack */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Pool of Sauce */}
              <div 
                ref={sauceRef}
                className="absolute top-[48%] left-[32%] w-[38%] h-[32%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(200,80,40,0.9) 0%, rgba(220,100,30,0.7) 100%)',
                  borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%',
                  filter: 'blur(0.5px)'
                }}
              />

              {/* The Fish */}
              <div 
                ref={fishRef}
                className="absolute top-1/2 left-1/2 w-[55%] h-[28%] -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(220,200,160,0.9) 0%, rgba(190,170,130,0.8) 100%)',
                  borderRadius: '45% 55% 50% 50% / 40% 40% 60% 60%',
                  boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.15), 0 3px 10px rgba(0,0,0,0.4)'
                }}
              >
                {/* Seared top */}
                <div className="absolute inset-0 w-full h-1/2 bg-white/5 rounded-t-full blur-[2px]" />
              </div>

              {/* Herb Elements */}
              <div ref={herbsRef} className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute top-[40%] left-[65%] w-[6px] h-[6px] rounded-full bg-[rgba(60,100,40,0.95)]" />
                <div className="absolute top-[62%] left-[72%] w-[5px] h-[5px] rounded-full bg-[rgba(60,100,40,0.95)]" />
              </div>

              {/* Foam/Emulsion */}
              <div ref={foamRef} className="absolute top-[65%] left-[42%] w-[15px] h-[15px] pointer-events-none z-20">
                {foamData.map((f, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-[rgba(245,240,220,0.85)] rounded-full backdrop-blur-[1px]"
                    style={{
                      width: `${f.width}px`,
                      height: `${f.height}px`,
                      top: `${f.top}px`,
                      left: `${f.left}px`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  />
                ))}
              </div>

              {/* Steam Above Main Element */}
              <div ref={steamRef} className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-16 h-24 pointer-events-none flex justify-center gap-3">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-[2px] h-[25px]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))',
                      animation: `steamMove 3s ease-out ${i * 0.8}s infinite`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.9); }
          100% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes steamMove {
          0% { transform: translateY(0); opacity: 0; }
          40% { opacity: 0.15; }
          100% { transform: translateY(-35px); opacity: 0; }
        }
        @keyframes candleFlicker {
          0%, 100% { transform: scale(0.9) skewX(0deg); opacity: 0.9; }
          25% { transform: scale(1.1) skewX(1deg); opacity: 1; }
          50% { transform: scale(0.95) skewX(-1deg); opacity: 0.85; }
          75% { transform: scale(1.05) skewX(0.5deg); opacity: 1; }
        }
        @keyframes candleGlow {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }
      ` }} />
    </section>
  );
};

export default Moment09;
