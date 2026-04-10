"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';


const Moment10 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const starRefs = useRef<HTMLDivElement[]>([]);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const [starsData, setStarsData] = useState<any[]>([]);
  const { isMobile } = useScroll();


  useEffect(() => {
    // Generate stars with random properties only on client - reduced for mobile
    const count = isMobile ? 25 : 55;
    setStarsData(Array.from({ length: count }).map((_, i) => {
      const size = i < (count * 0.7) ? 1 : i < (count * 0.9) ? 2 : 3;
      const isBlueTint = Math.random() > 0.7;
      const color = isBlueTint ? 'rgba(220, 230, 255, 0.6)' : `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`;
      const hasGlow = size >= 2 && Math.random() > 0.5;

      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${size}px`,
        color,
        hasGlow
      };
    }));
  }, [isMobile]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=150%" : "+=200%",
        pin: true,
        pinSpacing: true,
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

    // 2. Camera Depth - Pull back and parallax - Background Depth
    tl.fromTo(contentRef.current, 
      { scale: 1.1, y: "2vh" },
      {
        scale: 1,
        y: 0,
        force3D: true,
        ease: "none",
      }, 0.1);

    // 3. Narrative Text entrance & persistence - Foreground Speed
    tl.fromTo(textRef.current,
      { opacity: 0, scale: 0.9, y: 80, rotate: -1 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: 0,
        force3D: true,
        ease: "power2.out",
        duration: 0.5
      }, 0.2);

    // 4. Stars Celestial Kinetics - Drifting Background
    starRefs.current.forEach((star, i) => {
      if (star) {
        tl.to(star, {
          opacity: 0.8,
          scale: (i % 3 === 0 ? 2 : 1.5),
          x: (i % 2 === 0 ? 60 : -60),
          y: (i % 3 === 0 ? 40 : -40),
          ease: "none",
        }, 0);
      }
    });

    // 5. Nebula & Silhouette Parallax - Midground speeds
    tl.to(nebulaRef.current, {
        rotate: 45,
        opacity: 0.7,
        scale: 1.4,
        y: "-10vh",
        ease: "none"
    }, 0);

    tl.to(silhouetteRef.current, {
        y: "-12vh",
        scale: 1.15,
        x: "2vw",
        ease: "none"
    }, 0);

    // 6. Text Exit - Extremely fast fly-past
    tl.to(textRef.current, {
        opacity: 0,
        y: -180,
        scale: 1.3,
        rotate: 2,
        force3D: true,
        ease: "power2.in"
    }, 0.6);

    // 7. Exit transition - standardized fade + transform exit
    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.95,
      y: -40,
      ease: "power2.inOut",
    }, 0.85);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, [starsData, isMobile]);


  return (
    <section 
      ref={sectionRef}
      className="moment relative w-full overflow-hidden bg-[#060810]" 
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
          ref={nebulaRef}
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
          {starsData.map((star, i) => (
            <div 
              key={star.id}
              ref={el => { if (el) starRefs.current[i] = el; }}
              className="absolute rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
                boxShadow: star.hasGlow ? '0 0 3px rgba(220, 230, 255, 0.4)' : 'none',
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
          ref={silhouetteRef}
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

    </section>
  );
};

export default Moment10;

