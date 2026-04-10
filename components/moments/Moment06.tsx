"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScroll } from '@/lib/context/ScrollContext';

const Moment06 = ({ index }: { index: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const structureRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<HTMLDivElement[]>([]);
  const roofRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);
  const palmLeftRef = useRef<HTMLDivElement>(null);
  const palmRightRef = useRef<HTMLDivElement>(null);
  const dappleRefs = useRef<HTMLDivElement[]>([]);
  const { isMobile } = useScroll();

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=150%" : "+=200%",
        pin: true,
        pinSpacing: false,
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

    // 2. Staggered reveal of architectural elements - delayed for reveal
    const revealElements = [
        palmLeftRef.current,
        palmRightRef.current,
        platformRef.current,
        ...postRefs.current,
        roofRef.current,
        glowRef.current,
        lightsRef.current
    ].filter(Boolean) as HTMLElement[];

    tl.fromTo(revealElements, 
      { 
        opacity: 0, 
        scale: 0.9, 
        y: 60 
      }, 
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        stagger: 0.04,
        force3D: true,
        ease: "power2.out",
        duration: 0.4
      }, 0.15);

    // 3. Parallax "Deep Dive" - Pavillion structure (Midground)
    tl.to(structureRef.current, {
      scale: 1.1,
      y: "-3vh",
      force3D: true,
      ease: "none",
    }, 0);

    tl.to(glowRef.current, {
      opacity: 0.4,
      scale: 1.4,
      filter: "blur(40px)",
      y: "-5vh",
      force3D: true,
      ease: "none",
    }, 0);

    // 4. Palms Parallax - Foreground (Fastest movement)
    tl.to(palmLeftRef.current, { 
      x: "-12vw", 
      y: "-15vh", 
      rotate: -12, 
      scale: 1.1, 
      ease: "none" 
    }, 0);

    tl.to(palmRightRef.current, { 
      x: "12vw", 
      y: "-15vh", 
      rotate: 12, 
      scale: 1.1, 
      ease: "none" 
    }, 0);

    // 5. Dapples - Background deep (Slowest drift)
    dappleRefs.current.forEach((dapple, i) => {
      if (dapple) {
        tl.to(dapple, {
          xPercent: (i % 2 === 0 ? 15 : -15),
          yPercent: (i % 3 === 0 ? 10 : -10),
          rotate: (i % 2 === 0 ? 8 : -8),
          scale: 1.1,
          opacity: 0.1,
          ease: "none"
        }, 0);
      }
    });

    // 6. Exit transition - standardized fade + transform exit
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
  }, [isMobile]);


  const dapples = [
    { top: '10%', left: '15%', size: '300px' },
    { top: '25%', left: '60%', size: '350px' },
    { top: '5%', left: '40%', size: '280px' },
    { top: '30%', left: '20%', size: '320px' },
    { top: '15%', left: '75%', size: '310px' },
    { top: '40%', left: '45%', size: '290px' },
  ];

  return (
    <section 
      ref={sectionRef}
      className="moment relative w-full overflow-hidden" 
      id="moment-06"
      style={{
        background: 'linear-gradient(180deg, #1a3020 0%, #243828 35%, #1c2e22 65%, #141e18 100%)',
        opacity: 0,
        pointerEvents: 'none'
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {dapples.map((d, i) => (
          <div 
            key={i}
            ref={el => { if (el) dappleRefs.current[i] = el; }}
            className="absolute bg-[#dcc864] opacity-[0.07]"
            style={{
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              borderRadius: '50%',
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      <div 
        ref={structureRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="relative w-full max-w-[800px] h-[400px]">
          <div 
            className="absolute bottom-0 left-[-50%] w-[200%] h-[40%] bg-[#28647866] opacity-40 z-0"
            style={{ filter: 'blur(40px)' }}
          />

          <div 
            ref={glowRef}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#ffc864] opacity-[0.12] z-0"
            style={{ filter: 'blur(15px)' }}
          />

          <div 
            ref={platformRef}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[60vw] max-w-[800px] h-[2px] bg-[rgba(180,150,100,0.6)] z-20 shadow-[0_0_10px_rgba(180,150,100,0.3)]"
          />

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

          <div 
            ref={roofRef}
            className="absolute bottom-[55%] left-1/2 -translate-x-1/2 w-[65vw] max-w-[850px] h-[100px] z-30"
            style={{
              background: 'linear-gradient(180deg, rgba(100,75,45,0.8) 0%, rgba(140,105,65,0.6) 100%)',
              clipPath: 'polygon(5% 100%, 0% 0%, 100% 0%, 95% 100%)'
            }}
          />

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

      <div 
        ref={palmLeftRef}
        className="absolute left-0 bottom-[-10%] w-[12px] h-[120%] bg-[#1a2e22] z-40"
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          transform: 'rotate(2deg)'
        }}
      >
        <div 
          className="absolute top-0 left-[-50px] w-[120px] h-[100px] bg-[#141e18]"
          style={{ clipPath: 'polygon(50% 100%, 0% 0%, 15% 0%, 50% 80%, 85% 0%, 100% 0%)' }}
        />
      </div>

      <div 
        ref={palmRightRef}
        className="absolute right-0 bottom-[-10%] w-[12px] h-[120%] bg-[#1a2e22] z-40"
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          transform: 'rotate(-2deg)'
        }}
      >
        <div 
          className="absolute top-0 right-[-50px] w-[120px] h-[100px] bg-[#141e18]"
          style={{ clipPath: 'polygon(50% 100%, 0% 0%, 15% 0%, 50% 80%, 85% 0%, 100% 0%)' }}
        />
      </div>

    </section>
  );
};

export default Moment06;

