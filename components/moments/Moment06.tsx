"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/gsap";

const Moment06 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const dappleRefs = useRef<HTMLDivElement[]>([]);
  const postRefs = useRef<HTMLDivElement[]>([]);
  const roofRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);
  const palmLeftRef = useRef<HTMLDivElement>(null);
  const palmRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !structureRef.current || !glowRef.current) return;

      // --- Animation Timeline: Reveal ---
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "top top",
          scrub: 2.5,
        }
      });

      // Target elements for staggered reveal
      const revealElements = [
        palmLeftRef.current,
        palmRightRef.current,
        platformRef.current,
        ...postRefs.current,
        roofRef.current,
        glowRef.current,
        lightsRef.current
      ].filter(Boolean) as HTMLElement[];

      revealTl.fromTo(revealElements, 
        { 
          opacity: 0, 
          scale: 0.95, 
          y: 20 
        }, 
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          stagger: 0.15,
          force3D: true,
          ease: "power2.out",
          onStart: () => { gsap.set(revealElements, { willChange: "transform, opacity" }); },
          onComplete: () => { gsap.set(revealElements, { clearProps: "willChange" }); }
        }
      );

      // --- Pinned Timeline Animation: Push ---
      const pinnedTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3000px",
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
        },
        onStart: () => { gsap.set([structureRef.current, glowRef.current], { willChange: "transform, opacity, filter" }); },
        onComplete: () => { gsap.set([structureRef.current, glowRef.current], { clearProps: "willChange" }); }
      });

      pinnedTl.to(structureRef.current, {
        scale: 1.05,
        force3D: true,
        ease: "none"
      }, 0);

      pinnedTl.to(glowRef.current, {
        opacity: 0.25,
        filter: "blur(20px)",
        force3D: true,
        ease: "none"
      }, 0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 6 large soft ellipses for dappled light
  const dapples = [
    { top: '10%', left: '15%', size: '300px', delay: '0s', dur: '8s' },
    { top: '25%', left: '60%', size: '350px', delay: '-2s', dur: '10s' },
    { top: '5%', left: '40%', size: '280px', delay: '-4s', dur: '9s' },
    { top: '30%', left: '20%', size: '320px', delay: '-1s', dur: '11s' },
    { top: '15%', left: '75%', size: '310px', delay: '-5s', dur: '7s' },
    { top: '40%', left: '45%', size: '290px', delay: '-3s', dur: '12s' },
  ];

  return (
    <section 
      ref={sectionRef}
      className="moment relative h-[100svh] w-screen overflow-hidden" 
      id="moment-06"
      style={{
        background: 'linear-gradient(180deg, #1a3020 0%, #243828 35%, #1c2e22 65%, #141e18 100%)'
      }}
    >
      {/* DAPPLED OVERHEAD LIGHT */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {dapples.map((d, i) => (
          <div 
            key={i}
            className="absolute bg-[#dcc864] opacity-[0.07]"
            style={{
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              borderRadius: '50%',
              filter: 'blur(20px)',
              animation: `dappleShift ${d.dur} ease-in-out ${d.delay} infinite alternate`
            }}
          />
        ))}
      </div>

      {/* THE RESTAURANT STRUCTURE */}
      <div 
        ref={structureRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="relative w-full max-w-[800px] h-[400px]">
          
          {/* WATER BEYOND (Below Platform) */}
          <div 
            className="absolute bottom-0 left-[-50%] w-[200%] h-[40%] bg-[#28647866] opacity-40 z-0"
            style={{ filter: 'blur(40px)' }}
          />

          {/* INTERIOR GLOW */}
          <div 
            ref={glowRef}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#ffc864] opacity-[0.12] z-0"
            style={{ filter: 'blur(15px)' }}
          />

          {/* MAIN PLATFORM / FLOOR */}
          <div 
            ref={platformRef}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[60vw] max-w-[800px] h-[2px] bg-[rgba(180,150,100,0.6)] z-20 shadow-[0_0_10px_rgba(180,150,100,0.3)]"
          />

          {/* VERTICAL POSTS */}
          {[...Array(4)].map((_, i) => (
            <div 
              key={i}
              ref={el => { if (el) postRefs.current[i] = el; }}
              className="absolute bottom-[20%] w-[3px] h-[35%] bg-[rgba(140,110,70,0.7)] z-10"
              style={{
                left: `${15 + (i * 23.33)}%`,
                transform: 'translateX(-50%)'
              }}
            />
          ))}

          {/* ROOF */}
          <div 
            ref={roofRef}
            className="absolute bottom-[55%] left-1/2 -translate-x-1/2 w-[65vw] max-w-[850px] h-[100px] z-30"
            style={{
              background: 'linear-gradient(180deg, rgba(100,75,45,0.8) 0%, rgba(140,105,65,0.6) 100%)',
              clipPath: 'polygon(5% 100%, 0% 0%, 100% 0%, 95% 100%)'
            }}
          />

          {/* STRING LIGHTS */}
          <div 
            ref={lightsRef}
            className="absolute top-[35%] left-[15%] w-[70%] h-[60px] z-25 pointer-events-none"
          >
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-full h-[1px] mb-[12px]"
                style={{
                  background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(255,240,180,0.6) 13px, rgba(255,240,180,0.6) 15px, transparent 16px)'
                }}
              />
            ))}
          </div>

        </div>
      </div>

      {/* PALMS FRAMING */}
      <div 
        ref={palmLeftRef}
        className="absolute left-0 bottom-[-10%] w-[12px] h-[120%] bg-[#1a2e22] z-40"
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', // Slanted trunk
          transform: 'rotate(2deg)'
        }}
      >
        {/* Palm Fronds Left */}
        <div 
          className="absolute top-0 left-[-50px] w-[120px] h-[100px] bg-[#141e18]"
          style={{ clipPath: 'polygon(50% 100%, 0% 0%, 15% 0%, 50% 80%, 85% 0%, 100% 0%)' }}
        />
      </div>

      <div 
        ref={palmRightRef}
        className="absolute right-0 bottom-[-10%] w-[12px] h-[120%] bg-[#1a2e22] z-40"
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', // Slanted trunk
          transform: 'rotate(-2deg)'
        }}
      >
        {/* Palm Fronds Right */}
        <div 
          className="absolute top-0 right-[-50px] w-[120px] h-[100px] bg-[#141e18]"
          style={{ clipPath: 'polygon(50% 100%, 0% 0%, 15% 0%, 50% 80%, 85% 0%, 100% 0%)' }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dappleShift {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          100% { transform: translate(20px, 15px) rotate(10deg) scale(1.1); }
        }
      ` }} />
    </section>
  );
};

export default Moment06;
