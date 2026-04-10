"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';


const Moment09 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<HTMLDivElement[]>([]);
  const plateRef = useRef<HTMLDivElement>(null);
  const sauceRef = useRef<HTMLDivElement>(null);
  const fishRef = useRef<HTMLDivElement>(null);
  const herbsRef = useRef<HTMLDivElement>(null);
  const herbItemsRef = useRef<HTMLDivElement[]>([]);
  const foamRef = useRef<HTMLDivElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const steamRef = useRef<HTMLDivElement>(null);
  const steamItemsRef = useRef<HTMLDivElement[]>([]);
  const candleFlameRef = useRef<HTMLDivElement>(null);
  const candleGlowRef = useRef<HTMLDivElement>(null);
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
    })));

    setFoamData([...Array(6)].map((_, i) => ({
      width: 3 + Math.random() * 2,
      height: 3 + Math.random() * 2,
      top: Math.random() * 12 - 6,
      left: Math.random() * 12 - 6
    })));
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

    // 1. Entry Reveal
    tl.to(sectionRef.current, { opacity: 1, duration: 0.1 }, 0);

    // 2. Initial state for dish elements
    tl.set(sauceRef.current, { x: -30, opacity: 0, scale: 0.8 }, 0);
    tl.set([fishRef.current, herbsRef.current, foamRef.current], { opacity: 0, y: 30, scale: 0.9, filter: 'blur(5px)' }, 0);

    // 3. Plate Entry with Depth
    tl.fromTo(plateRef.current,
      { opacity: 0, scale: 0.85, y: 100 },
      { opacity: 1, scale: 1, y: 0, force3D: true, ease: "power2.out", duration: 0.4 }, 0);

    // 4. Sauce "Pour"
    tl.to(sauceRef.current, {
      x: 0,
      opacity: 1,
      scale: 1,
      force3D: true,
      ease: "power2.inOut",
      duration: 0.3
    }, 0.2);

    // 5. Staggered reveal of dish components
    const foodItems = [fishRef.current, herbsRef.current, foamRef.current].filter(Boolean) as HTMLElement[];
    foodItems.forEach((item, i) => {
      tl.to(item, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        force3D: true,
        ease: "back.out(1.4)",
        duration: 0.3
      }, 0.3 + i * 0.1);
    });

    // 6. Kinetic Enhancements
    // Herbs bounce
    herbItemsRef.current.forEach((herb, i) => {
        if (herb) tl.to(herb, { y: -5, opacity: 1, delay: i * 0.05, ease: "back.out" }, 0.4);
    });

    // Steam Drift - Converted from CSS to GSAP Scroll-driven
    steamItemsRef.current.forEach((steam, i) => {
      if (steam) {
        tl.fromTo(steam, 
          { y: 0, opacity: 0 },
          { y: -60, opacity: 0.2, ease: "none", duration: 0.4 }, 0.2 + i * 0.1);
      }
    });

    // 7. Celestial & Ambience
    // Stars Twinkle - Converted to GSAP
    starRefs.current.forEach((star, i) => {
      if (star) {
        tl.to(star, {
          opacity: 1,
          scale: 1.5,
          ease: "none",
        }, 0);
      }
    });

    // Candle Flicker
    tl.to(candleFlameRef.current, { scale: 1.3, x: 2, ease: "none" }, 0.2);
    tl.to(candleGlowRef.current, { opacity: 1, scale: 1.2, ease: "none" }, 0);

    // 8. Exit transition (Fly away)
    tl.to(plateRef.current, {
      y: -250,
      opacity: 0,
      scale: 0.7,
      rotateX: -30,
      force3D: true,
      ease: "power2.in",
    }, 0.8);

    tl.to(sectionRef.current, {
      opacity: 0,
      ease: "none",
    }, 0.9);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, [starsData, foamData]);


  return (
    <section 
      ref={sectionRef}
      className="moment relative w-screen overflow-hidden" 
      id="moment-09"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #080810 0%, #0c0c18 40%, #080810 100%)'
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-0">
          {starsData.map((star, i) => (
            <div 
              key={star.id}
              ref={el => { if (el) starRefs.current[i] = el; }}
              className="absolute bg-white rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        <div 
          className="absolute bottom-0 left-0 w-full h-[30%] z-1"
          style={{
            background: 'rgba(15,35,50,0.6)',
            maskImage: 'linear-gradient(to top, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to top, black, transparent)'
          }}
        />

        <div 
          ref={candleRef}
          className="absolute top-[28%] left-[28%] z-30 flex flex-col items-center"
        >
          <div 
            ref={candleGlowRef}
            className="absolute -top-24 w-[300px] h-[400px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: '50%',
              top: '10px',
              background: 'radial-gradient(ellipse 120px 180px at center, rgba(255,185,70,0.3) 0%, rgba(255,160,50,0.08) 50%, transparent 75%)',
              opacity: 0.7
            }}
          />
          <div 
            ref={candleFlameRef}
            className="w-1.5 h-3.5 bg-[rgba(255,210,80,0.95)] rounded-[50%_50%_30%_30%] mb-1 shadow-[0_0_12px_rgba(255,180,50,0.7)]"
          />
          <div className="w-[8px] h-[45px]"
               style={{
                 background: 'linear-gradient(180deg, #f0e0b0, #dcc080)'
               }}
          />
        </div>

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
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                ref={sauceRef}
                className="absolute top-[48%] left-[32%] w-[38%] h-[32%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(200,80,40,0.9) 0%, rgba(220,100,30,0.7) 100%)',
                  borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%',
                  filter: 'blur(0.5px)'
                }}
              />

              <div 
                ref={fishRef}
                className="absolute top-1/2 left-1/2 w-[55%] h-[28%] -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(220,200,160,0.9) 0%, rgba(190,170,130,0.8) 100%)',
                  borderRadius: '45% 55% 50% 50% / 40% 40% 60% 60%',
                  boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.15), 0 3px 10px rgba(0,0,0,0.4)'
                }}
              >
                <div className="absolute inset-0 w-full h-1/2 bg-white/5 rounded-t-full blur-[2px]" />
              </div>

              <div ref={herbsRef} className="absolute inset-0 pointer-events-none z-20">
                <div 
                    ref={el => { if (el) herbItemsRef.current[0] = el; }}
                    className="absolute top-[40%] left-[65%] w-[6px] h-[6px] rounded-full bg-[rgba(60,100,40,0.95)] opacity-0" 
                />
                <div 
                    ref={el => { if (el) herbItemsRef.current[1] = el; }}
                    className="absolute top-[62%] left-[72%] w-[5px] h-[5px] rounded-full bg-[rgba(60,100,40,0.95)] opacity-0" 
                />
              </div>

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

              <div ref={steamRef} className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-16 h-24 pointer-events-none flex justify-center gap-3">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    ref={el => { if (el) steamItemsRef.current[i] = el; }}
                    className="w-[2px] h-[25px]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Moment09;

