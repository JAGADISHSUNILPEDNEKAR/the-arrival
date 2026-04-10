"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

const Moment05 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sunSideRef = useRef<HTMLDivElement>(null);
  const shadeSideRef = useRef<HTMLDivElement>(null);
  const boundaryRef = useRef<HTMLDivElement>(null);
  const dappleRefs = useRef<HTMLDivElement[]>([]);
  const petalsRef = useRef<HTMLDivElement[]>([]);
  const [bougainvilleaData, setBougainvilleaData] = useState<any[]>([]);
  const { isMobile } = useScroll();

  useEffect(() => {
    // Generate bougainvillea data only on client
    const count = isMobile ? 6 : 12;
    setBougainvilleaData([...Array(count)].map((_, i) => ({
      size: 6 + Math.random() * 8,
      top: 15 + Math.random() * 20,
      right: 10 + Math.random() * 15,
      rotate: Math.random() * 360,
    })));
  }, [isMobile]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=150%" : "+=250%",
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.8 : 1.2,
        onToggle: self => {
          if (self.isActive) {
            sectionRef.current?.classList.add('active');
          } else {
            sectionRef.current?.classList.remove('active');
          }
        }
      }
    });

    // 100ms kinetic threshold
    tl.set({}, {}, 0.1);

    // 1. Entry Reveal - standardized fade + transform
    tl.fromTo(sectionRef.current,
      { opacity: 0, scale: 1.02 },
      { 
        opacity: 1, 
        scale: 1,
        ease: "cinematic",
        duration: 0.5 
      }, 0.1);

    // 2. The Great Split - Background kinetic
    tl.to(shadeSideRef.current, {
      width: "70%",
      force3D: true,
      ease: "cinematic",
      duration: 1.2
    }, 0.2);

    tl.to(sunSideRef.current, {
      width: "35%",
      force3D: true,
      ease: "cinematic",
      duration: 1.2
    }, 0.2);

    tl.to(boundaryRef.current, {
      left: "30%",
      force3D: true,
      ease: "cinematic",
      duration: 1.2
    }, 0.2);

    // 3. Dappled lights scroll-driven flutter - Foreground 3D
    dappleRefs.current.forEach((dapple, i) => {
      if (dapple) {
        tl.to(dapple, {
          x: (i % 2 === 0 ? 50 : -50),
          y: (i % 3 === 0 ? 40 : -40),
          opacity: 0.4,
          scale: 1.5,
          rotate: (i % 2 === 0 ? 25 : -25),
          force3D: true,
          ease: "none",
        }, 0.1);
      }
    });

    // 4. Petal Sway - Kinetic depth
    petalsRef.current.forEach((petal, i) => {
      if (petal) {
        tl.to(petal, {
          rotation: (i % 2 === 0 ? 240 : -240),
          y: -150 - (i * 30),
          x: (i % 2 === 0 ? 40 : -40),
          opacity: 0.1,
          scale: 1.8,
          ease: "none"
        }, 0.1);
      }
    });

    // 5. Shadows parallax - 0.3x mapping relative to 1x screen flow
    tl.to(boundaryRef.current, {
      y: "-15vh",
      scaleY: 1.2,
      ease: "none"
    }, 0.1);

    // 6. Exit transition
    tl.to(sectionRef.current, {
      opacity: 0,
      scale: 0.98,
      y: -40,
      ease: "cinematic",
    }, 0.9);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.vars.trigger === sectionRef.current).forEach(st => st.kill());
    };
  }, [bougainvilleaData, isMobile]);


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

  return (
    <section 
      ref={sectionRef}
      className="moment relative w-full overflow-hidden" 
      id="moment-05"
    >
      <div 
        ref={sunSideRef}
        className="absolute top-0 left-0 h-full w-[52%] z-[1]"
        style={{
          background: 'linear-gradient(180deg, #e8d48a 0%, #f0e0a0 40%, #f5e8b0 70%, #e0c870 100%)'
        }}
      />

      <div 
        ref={shadeSideRef}
        className="absolute top-0 right-0 h-full w-[50%] z-[1]"
        style={{
          background: 'linear-gradient(180deg, #1a3020 0%, #2a4a30 30%, #1e3828 60%, #162a1e 100%)'
        }}
      >
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
            }}
          />
        ))}

        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          {bougainvilleaData.map((petal, i) => (
            <div 
              key={i}
              ref={el => { if (el) petalsRef.current[i] = el; }}
              className="absolute bg-[#c8345a]"
              style={{
                top: `${petal.top}%`,
                right: `${petal.right}%`,
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                transform: `rotate(${petal.rotate}deg)`,
                clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)',
              }}
            />
          ))}
        </div>
      </div>

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
    </section>
  );
};

export default Moment05;
