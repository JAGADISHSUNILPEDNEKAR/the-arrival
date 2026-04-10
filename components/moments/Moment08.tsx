"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';


const Moment08 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const candleFlameRef = useRef<HTMLDivElement>(null);
  const candleGlowRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const glassShimmerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [menuLines, setMenuLines] = useState<number[]>([]);

  useEffect(() => {
    // Generate menu lines only on client
    setMenuLines([...Array(6)].map(() => 60 + Math.random() * 30));
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

    // 1. Entry Reveal - standardized fade + transform
    tl.fromTo(sectionRef.current,
      { opacity: 0, scale: 1.05 },
      { 
        opacity: 1, 
        scale: 1,
        ease: "power2.out",
        duration: 0.2 
      }, 0);

    // 2. Table and items entrance - Staggered mid-fast speeds
    tl.fromTo(tableRef.current, 
      { y: 100, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, force3D: true, ease: "power2.out", duration: 0.5 }, 0.1);

    // Differentiate items for depth pass
    const items = [
      { el: plateRef.current, y: 50, rotateX: -10, speed: 0.2 },
      { el: menuRef.current, y: 80, rotate: 5, speed: 0.35 },
      { el: candleRef.current, y: 30, scale: 0.8, speed: 0.15 },
      { el: glassRef.current, y: 100, rotate: -5, speed: 0.45 }
    ];

    items.forEach((item, i) => {
      if (item.el) {
        tl.fromTo(item.el,
          { opacity: 0, y: item.y, rotate: item.rotate || 0, rotateX: item.rotateX || 0 },
          { 
            opacity: 1, 
            y: 0, 
            rotate: 0,
            rotateX: 0,
            force3D: true, 
            ease: "power2.out",
            duration: 0.45
          }, 0.2 + i * 0.08);
      }
    });

    // 3. Narrative text reveal - Foreground Fast
    tl.fromTo(textRef.current,
      { opacity: 0, y: 60, x: 40, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        x: 0, 
        scale: 1,
        force3D: true, 
        ease: "power2.out",
        duration: 0.5 
      }, 0.3);

    // 4. Main pinned animations: subtle camera push
    tl.to(containerRef.current, {
      scale: 1.08, 
      force3D: true,
      ease: "none",
    }, 0);

    tl.fromTo(shadowRef.current,
      { x: "120%", opacity: 0, skewX: 10 },
      { x: "-40%", opacity: 0.6, skewX: 0, force3D: true, ease: "none" },
      0.1);

    // 5. Scroll-driven object kinetics (Differentiated speeds)
    tl.to(menuRef.current, { rotate: 5, y: "-25px", x: "10px", ease: "none" }, 0.2);
    tl.to(plateRef.current, { scale: 1.1, y: "-12px", ease: "none" }, 0.2);
    tl.to(glassRef.current, { y: "-40px", scale: 1.05, ease: "none" }, 0.2);
    
    // 6. Candle & Glass
    tl.to(candleFlameRef.current, { scale: 1.4, x: 4, rotate: 10, ease: "none" }, 0.2);
    tl.to(candleGlowRef.current, { opacity: 0.6, scale: 1.6, ease: "none" }, 0.1);
    tl.to(glassShimmerRef.current, { x: "250%", ease: "none" }, 0.1);

    // 7. Text Exit - Passing the camera
    tl.to(textRef.current, {
      opacity: 0,
      y: -120,
      x: 60,
      scale: 1.2,
      force3D: true,
      ease: "power2.in",
    }, 0.65);

    // 8. Final Exit transition - standardized fade + transform exit
    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.9,
      y: -60,
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
      className="moment relative w-screen overflow-hidden" 
      id="moment-08"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      <div 
        ref={textRef}
        className="absolute top-[15%] right-[10%] md:right-[15%] z-30 max-w-[320px] pointer-events-none text-right"
      >
        <p
          className="italic font-light mb-4 drop-shadow-md"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 2vw, 1.4rem)',
            color: 'rgba(230, 210, 180, 0.9)',
            lineHeight: '1.4'
          }}
        >
          "An experience that completely redefines the concept of private dining."
        </p>
        <p
          className="uppercase tracking-[0.2em] text-[10px]"
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'rgba(230, 210, 180, 0.5)',
          }}
        >
          — The Times Luxury
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #1a1008 0%, #261808 40%, #1e1408 100%)'
        }}
      >
        <div className="absolute inset-0 z-10 pointer-events-none"
             style={{
               background: 'radial-gradient(ellipse 60% 70% at 50% -10%, rgba(255,200,100,0.22) 0%, transparent 65%)'
             }}
        />

        <div 
          className="absolute bottom-0 left-0 w-full h-[20%] z-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30,80,100,0.4) 0%, rgba(20,60,80,0.6) 100%)'
          }}
        />

        <div 
          ref={shadowRef}
          className="absolute right-0 top-0 h-full w-[40%] z-40 pointer-events-none bg-black blur-[100px] opacity-0"
        />

        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div 
            ref={tableRef}
            className="relative w-[55vw] max-w-[680px] h-[45vh] max-h-[350px] shadow-[0_20px_80px_rgba(0,0,0,0.7),0_4px_20px_rgba(0,0,0,0.5)] rounded-[4px]"
            style={{
              background: `
                repeating-linear-gradient(91deg, transparent, transparent 30px, rgba(0,0,0,0.04) 31px),
                linear-gradient(180deg, rgba(90,58,30,0.95) 0%, rgba(70,45,22,0.9) 100%)
              `
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[80%] border border-[rgba(220,215,200,0.4)] shadow-sm"
                 style={{
                   background: `
                     repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.015) 5px),
                     rgba(245,240,228,0.92)
                   `
                 }}
            >
              <div 
                ref={plateRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(80px,12vw,140px)] h-[clamp(80px,12vw,140px)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.15),0_4px_20px_rgba(0,0,0,0.3)] group cursor-pointer transition-transform duration-500 hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(145deg, #d4c8a8, #c8bca0, #dcd0b0)',
                  borderRadius: '51% 49% 52% 48% / 49% 51% 48% 52%'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[rgba(0,0,0,0.1)] rounded-[inherit]">
                  <span className="text-[9px] uppercase tracking-widest text-[#fff] font-light drop-shadow-md" style={{ fontFamily: 'var(--font-sans)' }}>Explore Dish</span>
                </div>
              </div>

              <div 
                ref={menuRef}
                className="absolute top-[20%] right-[10%] w-[clamp(80px,10vw,120px)] h-[clamp(120px,15vw,180px)] p-4 shadow-[2px_3px_12px_rgba(0,0,0,0.25)] -rotate-[2deg] flex flex-col gap-[14px] group cursor-pointer transition-transform duration-500 hover:rotate-0 hover:-translate-y-2 hover:scale-[1.05]"
                style={{
                  background: 'rgba(248,244,234,0.96)'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 bg-[rgba(248,244,234,0.95)] px-2">
                   <p className="text-[8px] uppercase tracking-widest text-center text-[#4a3820]" style={{ fontFamily: 'var(--font-sans)' }}>Tasting Menu<br/><span className="italic normal-case text-[10px] mt-2 block opacity-70" style={{ fontFamily: 'var(--font-serif)' }}>Inspired by the Tides</span></p>
                </div>
                {menuLines.map((width, i) => (
                   <div key={i} className="h-[1px] bg-[rgba(100,80,60,0.3)]" style={{ width: `${width}%` }} />
                ))}
                <div className="mt-auto h-[1px] bg-[rgba(80,60,40,0.5)] w-[40px]" />
              </div>

              <div 
                ref={candleRef}
                className="absolute top-[30%] left-[15%] w-[40px] h-[70px] flex flex-col items-center"
              >
                <div 
                  ref={candleGlowRef}
                  className="absolute -top-4 w-20 h-24 rounded-full pointer-events-none opacity-25"
                  style={{
                    background: 'radial-gradient(ellipse 40px 50px at center, rgba(255,200,80,0.5), transparent)',
                  }}
                />
                <div 
                  ref={candleFlameRef}
                  className="w-2 h-4 bg-[rgba(255,210,80,0.9)] rounded-[50%_50%_30%_30%] mb-1"
                />
                <div className="w-[10px] h-[50px]"
                     style={{
                       background: 'linear-gradient(180deg, #f5e8c0, #e8d4a0)'
                     }}
                />
              </div>

              <div 
                ref={glassRef}
                className="absolute top-[25%] right-[25%] flex flex-col items-center pointer-events-none"
              >
                <div className="w-8 h-12 rounded-[40%_40%_100%_100%] bg-[rgba(200,190,170,0.3)] overflow-hidden">
                  <div 
                    ref={glassShimmerRef}
                    className="w-full h-full" 
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      transform: 'translateX(-100%)'
                    }} 
                  />
                </div>
                <div className="w-[2px] h-10 bg-[rgba(200,190,170,0.3)]" />
              </div>

            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Moment08;

