"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/gsap";

const Moment04 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const planksContainerRef = useRef<HTMLDivElement>(null);
  const planksRef = useRef<HTMLDivElement>(null);
  const feetRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !planksContainerRef.current || !planksRef.current || !figureRef.current) return;

      // --- Scroll-In Animation ---
      gsap.fromTo(planksContainerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          force3D: true,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom-=100",
            end: "top center",
            scrub: 1,
            onEnter: () => { gsap.set(planksContainerRef.current, { willChange: "transform, opacity" }); },
            onLeave: () => { gsap.set(planksContainerRef.current, { clearProps: "willChange" }); },
            onEnterBack: () => { gsap.set(planksContainerRef.current, { willChange: "transform, opacity" }); },
            onLeaveBack: () => { gsap.set(planksContainerRef.current, { clearProps: "willChange" }); }
          }
        }
      );

      gsap.fromTo(feetRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          force3D: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom-=200",
            end: "top center",
            scrub: 1,
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
        onStart: () => { gsap.set([planksRef.current, planksContainerRef.current, figureRef.current], { willChange: "transform, opacity" }); },
        onComplete: () => { gsap.set([planksRef.current, planksContainerRef.current, figureRef.current], { clearProps: "willChange" }); }
      });

      // Perspective intensifies and everything translates upward
      exitTl.to(planksRef.current, {
        rotateX: "35deg",
        ease: "none",
        force3D: true
      }, 0);

      exitTl.to(planksContainerRef.current, {
        y: "-15vh",
        ease: "none",
        force3D: true
      }, 0);

      // Distant figure grows slightly
      exitTl.to(figureRef.current, {
        scale: 1.5,
        y: "-20px",
        force3D: true,
        ease: "none"
      }, 0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="moment relative min-h-[100svh] w-screen overflow-hidden" 
      id="moment-04"
      style={{
        background: 'linear-gradient(180deg, #5aadbe 0%, #7dc4cf 30%, #a8d8e0 55%, #d0ecf0 80%, #e8f6f8 100%)'
      }}
    >
      {/* Jetty Planks Section */}
      <div 
        ref={planksContainerRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55vw] max-w-[700px] h-[70%] z-10"
        style={{ perspective: '800px' }}
      >
        <div 
          ref={planksRef}
          className="relative w-full h-full origin-bottom"
          style={{ transform: 'rotateX(25deg)' }}
        >
          {/* Plank Background & Water Gaps */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  rgba(160,110,60,0.9) 0px,
                  rgba(180,130,75,0.85) 18px,
                  rgba(40,160,180,0.8) 18px,
                  rgba(40,160,180,0.8) 21px,
                  rgba(160,110,60,0.9) 21px
                )
              `
            }}
          />
          
          {/* Water Gaps (Overlaying with specific height if gradient isn't enough, 
              but the background above handles the shadow/plank look well) */}

          {/* Wood Grain Overlay */}
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background: `
                repeating-linear-gradient(
                  92deg,
                  transparent 0px,
                  rgba(0,0,0,0.04) 1px,
                  transparent 2px,
                  transparent 8px
                )
              `
            }}
          />

          {/* Distant Figure */}
          <div 
            ref={figureRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20px] z-[4]"
            style={{
              width: '8px',
              height: '20px',
              borderRadius: '4px 4px 0 0',
              background: 'rgba(240,235,220,0.7)'
            }}
          />

          {/* Frangipani Petals */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              ref={el => { if (el) petalsRef.current[i] = el; }}
              className="absolute"
              style={{
                width: '8px',
                height: '14px',
                borderRadius: '60% 40% 60% 40%',
                background: 'rgba(255, 248, 235, 0.85)',
                left: `${15 + (i * 12) + (Math.random() * 5)}%`,
                bottom: `${10 + (i * 4) + (Math.random() * 10)}%`,
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
                animation: `floatPetal ${3 + (i * 0.2)}s ease-in-out infinite`
              }}
            />
          ))}

          {/* Barefoot Steps */}
          <div ref={feetRef} className="absolute inset-0 z-[5] pointer-events-none">
            {/* Left Foot */}
            <div 
              className="absolute left-[38%] bottom-[15%]"
              style={{
                width: '28px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(210, 170, 130, 0.7)',
                animation: 'stepBreath 1.5s ease-in-out infinite alternate'
              }}
            />
            {/* Right Foot */}
            <div 
              className="absolute left-[58%] bottom-[22%]"
              style={{
                width: '28px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(210, 170, 130, 0.7)',
                animation: 'stepBreath 1.5s ease-in-out infinite alternate-reverse'
              }}
            />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatPetal {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes stepBreath {
          from { transform: scale(1); }
          to { transform: scale(1.02); }
        }
      ` }} />
    </section>
  );
};

export default Moment04;
