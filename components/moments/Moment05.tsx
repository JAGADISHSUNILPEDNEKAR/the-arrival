"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/gsap";

const Moment05 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sunSideRef = useRef<HTMLDivElement>(null);
  const shadeSideRef = useRef<HTMLDivElement>(null);
  const boundaryRef = useRef<HTMLDivElement>(null);
  const mainPalmRef = useRef<HTMLDivElement>(null);
  const secondaryPalmRef = useRef<HTMLDivElement>(null);
  const roofRef = useRef<HTMLDivElement>(null);
  const dappleRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !shadeSideRef.current || !sunSideRef.current || !boundaryRef.current) return;

      // --- Scroll-In Animation ---
      gsap.fromTo(shadeSideRef.current,
        { filter: "brightness(0.7)" },
        {
          filter: "brightness(1)",
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
            end: "top top",
            scrub: 2.5,
          }
        }
      );

      // --- Scroll-Out Animation ---
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2.5,
        },
        onStart: () => { gsap.set([shadeSideRef.current, sunSideRef.current, boundaryRef.current], { willChange: "width, left, filter" }); },
        onComplete: () => { gsap.set([shadeSideRef.current, sunSideRef.current, boundaryRef.current], { clearProps: "willChange" }); }
      });
      
      exitTl.to(shadeSideRef.current, {
        width: "65%",
        force3D: true,
        ease: "none"
      }, 0);

      exitTl.to(sunSideRef.current, {
        width: "37%",
        force3D: true,
        ease: "none"
      }, 0);

      exitTl.to(boundaryRef.current, {
        left: "35%",
        force3D: true,
        ease: "none"
      }, 0);

      // Dappled lights intensify
      dappleRefs.current.forEach((dapple) => {
        if (dapple) {
          exitTl.to(dapple, {
            opacity: "+=0.1",
            scale: 1.1,
            force3D: true,
            ease: "none"
          }, 0);
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Irregular palm shadow shapes for the boundary
  const palmShadows = [
    { width: 12, height: 100, top: 0, left: 0, opacity: 0.8 },
    { width: 25, height: 80, top: 10, left: 10, opacity: 0.9, clip: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)" },
    { width: 5, height: 95, top: 0, left: 24, opacity: 0.7 },
    { width: 18, height: 75, top: 25, left: 32, opacity: 0.85, clip: "polygon(5% 0, 95% 0, 100% 100%, 0% 100%)" },
    { width: 22, height: 100, top: 0, left: 45, opacity: 0.9 },
    { width: 3, height: 85, top: 5, left: 62, opacity: 0.65 },
    { width: 14, height: 90, top: 0, left: 70, opacity: 0.8, clip: "polygon(0 0, 100% 15%, 100% 100%, 0 85%)" },
    { width: 10, height: 100, top: 0, left: 88, opacity: 0.9 },
  ];

  // Dappled lights
  const dappledLights = [
    { top: '15%', left: '25%', w: 40, h: 60, dur: 4 },
    { top: '40%', left: '60%', w: 30, h: 50, dur: 3.5 },
    { top: '25%', left: '75%', w: 55, h: 35, dur: 5 },
    { top: '60%', left: '35%', w: 25, h: 80, dur: 4.5 },
    { top: '10%', left: '45%', w: 45, h: 45, dur: 3.8 },
    { top: '55%', left: '80%', w: 20, h: 30, dur: 5.5 },
    { top: '35%', left: '15%', w: 60, h: 40, dur: 4.2 },
    { top: '75%', left: '55%', w: 35, h: 55, dur: 4.8 },
  ];

  // Bougainvillea cluster
  const bougainvillea = [...Array(12)].map((_, i) => ({
    size: 6 + Math.random() * 8,
    top: 15 + Math.random() * 20,
    right: 10 + Math.random() * 15,
    rotate: Math.random() * 360,
    delay: Math.random() * 2
  }));

  return (
    <section 
      ref={sectionRef}
      className="moment relative h-screen w-screen overflow-hidden" 
      id="moment-05"
    >
      {/* THE SPLIT: Sun Side */}
      <div 
        ref={sunSideRef}
        className="absolute top-0 left-0 h-full w-[52%] z-[1]"
        style={{
          background: 'linear-gradient(180deg, #e8d48a 0%, #f0e0a0 40%, #f5e8b0 70%, #e0c870 100%)'
        }}
      />

      {/* THE SPLIT: Shade Side */}
      <div 
        ref={shadeSideRef}
        className="absolute top-0 right-0 h-full w-[50%] z-[1]"
        style={{
          background: 'linear-gradient(180deg, #1a3020 0%, #2a4a30 30%, #1e3828 60%, #162a1e 100%)'
        }}
      >
        {/* DAPPLED LIGHT */}
        {dappledLights.map((light, i) => (
          <div 
            key={i}
            ref={el => { if (el) dappleRefs.current[i] = el; }}
            className="absolute bg-[#dcc878] opacity-[0.12]"
            style={{
              top: light.top,
              left: light.left,
              width: `${light.w}px`,
              height: `${light.h}px`,
              borderRadius: '50%',
              filter: 'blur(8px)',
              animation: `dapple ${light.dur}s ease-in-out infinite`
            }}
          />
        ))}

        {/* BOUGAINVILLEA */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          {bougainvillea.map((petal, i) => (
            <div 
              key={i}
              className="absolute bg-[#c8345a]"
              style={{
                top: `${petal.top}%`,
                right: `${petal.right}%`,
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                transform: `rotate(${petal.rotate}deg)`,
                clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)',
                animation: `petalSway 2.5s ease-in-out ${petal.delay}s infinite`
              }}
            />
          ))}
        </div>

        {/* SAND PATH */}
        <div className="absolute bottom-0 left-0 w-full h-[40%] pointer-events-none overflow-hidden">
          {/* Path background */}
          <div 
            className="absolute bottom-[-10%] left-[10%] w-[120%] h-[120%] bg-[#dcc8a026]"
            style={{ borderRadius: '50% 50% 0 0', transform: 'rotate(-5deg)' }}
          />
          {/* Path edges */}
          <div 
            className="absolute bottom-[-5%] left-[5%] w-[110%] h-[2px] bg-[#d2bea240]"
            style={{ borderRadius: '50%', transform: 'rotate(-4deg)' }}
          />
          <div 
            className="absolute bottom-[35%] left-[15%] w-[90%] h-[2px] bg-[#d2bea240]"
            style={{ borderRadius: '50%', transform: 'rotate(-6deg)' }}
          />
        </div>

        {/* ROOF STRUCTURE */}
        <div 
          className="absolute top-[5%] right-[10%] w-[40%] h-[15%] bg-[#8c64324d] rounded-b-[4px]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 4px)`
          }}
        />
      </div>

      {/* THE PALM EDGE (Boundary) */}
      <div 
        ref={boundaryRef}
        className="absolute top-0 left-[48%] w-[8%] h-full z-[3] overflow-visible pointer-events-none"
      >
        {palmShadows.map((shadow, i) => (
          <div 
            key={i}
            className="absolute bg-[#0f1e0f]"
            style={{
              width: `${shadow.width}px`,
              height: `${shadow.height}%`,
              top: `${shadow.top}%`,
              left: `${shadow.left}%`,
              opacity: shadow.opacity,
              clipPath: shadow.clip || 'none',
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dapple {
          0%, 100% { opacity: 0.06; transform: translateX(0); }
          50% { opacity: 0.18; transform: translateX(4px); }
        }
        @keyframes petalSway {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(3deg) translateY(-2px); }
        }
      ` }} />
    </section>
  );
};

export default Moment05;
