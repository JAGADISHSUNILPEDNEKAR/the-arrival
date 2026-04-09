"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/gsap";

const Moment07 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const ceilingRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null); // Nearest table
  const textRef = useRef<HTMLDivElement>(null);
  const candleRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !containerRef.current) return;

      // --- SCROLL-IN ANIMATION ---
      gsap.fromTo(containerRef.current,
        { 
          filter: "brightness(0.7)", 
          scale: 0.97 
        },
        {
          filter: "brightness(1)",
          scale: 1,
          force3D: true,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top top",
            scrub: 2.5,
            onEnter: () => { gsap.set(containerRef.current, { willChange: "filter, transform" }); },
            onLeave: () => { gsap.set(containerRef.current, { clearProps: "willChange" }); },
            onEnterBack: () => { gsap.set(containerRef.current, { willChange: "filter, transform" }); },
            onLeaveBack: () => { gsap.set(containerRef.current, { clearProps: "willChange" }); },
          }
        }
      );

      gsap.fromTo(textRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
            end: "top top",
            scrub: 2.5,
            onEnter: () => { gsap.set(textRef.current, { willChange: "transform, opacity" }); },
            onLeave: () => { gsap.set(textRef.current, { clearProps: "willChange" }); },
            onEnterBack: () => { gsap.set(textRef.current, { willChange: "transform, opacity" }); },
            onLeaveBack: () => { gsap.set(textRef.current, { clearProps: "willChange" }); }
          }
        }
      );

      // --- SCROLL-OUT ANIMATION ---
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2.5,
        },
        onStart: () => { gsap.set([containerRef.current, tableRef.current, textRef.current], { willChange: "transform, opacity, filter" }); },
        onComplete: () => { gsap.set([containerRef.current, tableRef.current, textRef.current], { clearProps: "willChange" }); }
      });

      if (tableRef.current) {
        exitTl.to(tableRef.current, {
          scale: 1.08,
          y: -10,
          opacity: 0.8,
          force3D: true,
          ease: "power1.inOut"
        }, 0);
      }

      exitTl.to(containerRef.current, {
        scale: 1.03,
        force3D: true,
        ease: "none"
      }, 0);

      exitTl.to(textRef.current, {
        opacity: 0,
        x: -50,
        force3D: true,
        ease: "none"
      }, 0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 4 light pools: absolutely positioned ellipses
  const candles = [
    { left: '25%', top: '45%', width: '120px', height: '60px', dur: '3.2s', delay: '0s' },
    { left: '60%', top: '55%', width: '140px', height: '70px', dur: '4.5s', delay: '-1.2s' },
    { left: '40%', top: '35%', width: '90px', height: '45px', dur: '5s', delay: '-0.5s' },
    { left: '75%', top: '40%', width: '110px', height: '55px', dur: '3.8s', delay: '-2s' },
  ];

  // Table data
  const tables = [
    { left: '20%', bottom: '25%', width: '100px', height: '8px', brightness: 0.18, isNearest: false },
    { left: '70%', bottom: '28%', width: '80px', height: '6px', brightness: 0.12, isNearest: false },
    { left: '45%', bottom: '18%', width: '130px', height: '10px', brightness: 0.22, isNearest: true }, // Nearest
  ];

  return (
    <section 
      ref={sectionRef}
      className="moment relative h-screen w-screen overflow-hidden" 
      id="moment-07"
    >
      <div 
        ref={containerRef}
        className="relative w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #2a1e12 0%, #3a2818 25%, #2e2015 60%, #1e1408 100%)'
        }}
      >
        {/* Narrative Context */}
        <div 
          ref={textRef}
          className="absolute top-[40%] left-[8%] md:left-[15%] z-30 max-w-[350px] pointer-events-none"
        >
          <h2 
            className="italic font-light mb-6 drop-shadow-md"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              color: 'rgba(240, 210, 160, 0.95)',
              letterSpacing: '0.05em',
              lineHeight: '1.2'
            }}
          >
            A table waiting.
          </h2>
          <p
            className="font-light"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.85rem, 1vw, 1rem)',
              color: 'rgba(240, 210, 160, 0.7)',
              letterSpacing: '0.05em',
              lineHeight: '1.8'
            }}
          >
            Sourced entirely from the island and immediate ocean. Every dish is an expression of the environment, served in the suspended glow of the dining pavilion.
          </p>
        </div>

        {/* CEILING STRUCTURE (Upper 25%) */}
        <div 
          ref={ceilingRef}
          className="absolute top-0 left-0 w-full h-[25%] z-20 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(45deg, rgba(40, 30, 10, 0.4) 0px, rgba(40, 30, 10, 0.4) 2px, transparent 2px, transparent 10px),
              repeating-linear-gradient(-45deg, rgba(60, 45, 20, 0.3) 0px, rgba(60, 45, 20, 0.3) 1px, transparent 1px, transparent 8px),
              linear-gradient(180deg, rgba(30, 20, 10, 0.8) 0%, rgba(58, 40, 24, 0.4) 100%)
            `
          }}
        >
          {/* Pendant Lamp Bases */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-[rgba(200,160,80,0.4)] rounded-full"
              style={{
                width: `${15 + i * 2}px`,
                height: `${15 + i * 2}px`,
                top: `${(i * 15) % 40}%`,
                left: `${15 + i * 18}%`,
                boxShadow: '0 0 15px rgba(200,160,80,0.2)'
              }}
            />
          ))}
        </div>

        {/* OPEN SIDE / THE VIEW (Right 30%) */}
        <div 
          className="absolute top-0 right-0 w-[30%] h-full z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,200,100,0.05) 60%, rgba(180,140,80,0.15) 100%)'
          }}
        />

        {/* FLOOR / WOODEN DECKING (Lower 35%) */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[35%] z-20"
          style={{ perspective: '1200px' }}
        >
          <div 
            ref={floorRef}
            className="w-full h-full origin-bottom"
            style={{ 
              transform: 'rotateX(15deg)',
              background: 'repeating-linear-gradient(0deg, rgba(120,80,40,0.9) 0px, rgba(140,95,50,0.85) 14px, rgba(100,65,30,0.7) 15px, rgba(100,65,30,0.7) 17px, rgba(120,80,40,0.9) 18px)'
            }}
          >
            {/* LAGOON VISIBLE BELOW (Gaps in floor) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute left-0 w-full h-[1px] bg-[rgba(60,150,170,0.3)]"
                  style={{ bottom: `${10 + i * 30}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* AMBIENT CANDLE LIGHTS */}
        <div className="absolute inset-0 z-15 pointer-events-none">
          {candles.map((c, i) => (
            <div 
              key={i}
              ref={el => { if (el) candleRefs.current[i] = el; }}
              className="absolute rounded-[50%] bg-[#ffbe50]"
              style={{
                left: c.left,
                top: c.top,
                width: c.width,
                height: c.height,
                opacity: 0.15,
                filter: 'blur(30px)',
                animation: `flicker ${c.dur} ease-in-out ${c.delay} infinite`
              }}
            />
          ))}
        </div>

        {/* TABLES (Glimpsed Silhouettes) */}
        <div className="absolute inset-0 z-25 pointer-events-none">
          {tables.map((t, i) => (
            <div 
              key={i}
              ref={t.isNearest ? tableRef : null}
              className="absolute flex flex-col items-center"
              style={{
                left: t.left,
                bottom: t.bottom,
                opacity: 0.9
              }}
            >
              {/* Table Top */}
              <div 
                style={{
                  width: t.width,
                  height: t.height,
                  background: `rgba(200,180,140,${t.brightness})`,
                  borderRadius: '1px'
                }}
              />
              {/* Table Leg */}
              <div 
                style={{
                  width: '2px',
                  height: '60px',
                  background: `rgba(200,180,140,${t.brightness * 0.5})`
                }}
              />
            </div>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          25% { opacity: 0.20; transform: scale(1.05); }
          50% { opacity: 0.13; transform: scale(0.98); }
          75% { opacity: 0.18; transform: scale(1.02); }
        }
      ` }} />
    </section>
  );
};

export default Moment07;
